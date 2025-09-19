import express from "express";
import type { AuthenticatedRequest } from "../types/requestType";
import {
    shortenPostRequestBodySchema,
    updateURLRequestBodySchema,
} from "../validation/request.validation";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import {
    createUrl,
    deleteCodes,
    getCodesById,
    getOriginalUrl,
    updateCodesAndUrls,
} from "../services/url.service";
import { nanoid } from "nanoid";

const urlsRouter = express.Router();

urlsRouter.post(
    "/shorten",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const userId = req.user?.id;
        const validationResult =
            await shortenPostRequestBodySchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            const prettyErrors = validationResult.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
                code: issue.code,
            }));
            return res.status(400).json({ errors: prettyErrors });
        }
        const { url, code } = validationResult.data;

        const shortCode = code ?? nanoid(6);
        const result = await createUrl(
            url,
            shortCode as string,
            userId as string,
        );
        if (!result) {
            return res.status(500).json({ error: "something went wrong" });
        }
        return res.status(201).json({
            id: result.id,
            shortCode: result?.shortCode,
            targetUrl: result?.targetUrl,
        });
    },
);

urlsRouter.get(
    "/codes",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const id = req.user?.id;
        const codes = await getCodesById(id);
        if (codes.length === 0) {
            return res.status(404).json({ error: "no codes found" });
        }
        return res.status(200).json({ codes });
    },
);
urlsRouter.patch(
    "/update",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const validationResult =
            await updateURLRequestBodySchema.safeParseAsync(req.body);

        if (!validationResult.success) {
            const prettyErrors = validationResult.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
                code: issue.code,
            }));
            return res.status(400).json({ errors: prettyErrors });
        }
        const { shortCode, targetUrl } = validationResult.data;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ errors: "Bad Request" });
        }
        const result = await updateCodesAndUrls(userId, shortCode, targetUrl);
        if (!result)
            return res.status(500).json({ error: "something wrong happened" });
        if ("error" in result)
            return res.status(401).json({ error: result.error });
        return res.status(200).json({ data: { result } });
    },
);

urlsRouter.delete(
    "/:code",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const code = req.params.code;
        const userid = req.user?.id;
        if (!code || !userid)
            return res.status(401).json({ error: "Unauthenticated request" });
        const result = await deleteCodes(code, userid);
        if (!result) {
            return res.status(404).json({ error: "Not found" });
        }
        const { shortCode, targetUrl } = result;
        if (!shortCode || !targetUrl) {
            return res
                .status(404)
                .json({ error: "shortcode or url not found" });
        }
        return res
            .status(200)
            .json({ deleted: true, data: { shortCode, targetUrl } });
    },
);
//at the last because of shorten
urlsRouter.get("/:shortCode", async function (req, res) {
    const code = req.params.shortCode;
    const result = await getOriginalUrl(code as string);
    if (!result) {
        return res.status(404).json({ error: "InvalidCode" });
    }
    return res.redirect(result.targetUrl);
});

export default urlsRouter;
