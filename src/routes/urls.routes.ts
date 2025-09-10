import express from "express";
import type { AuthenticatedRequest } from "../types/requestType.ts";
import { shortenPostRequestBodySchema } from "../validation/request.validation.ts";
import { ensureAuthenticated } from "../middlewares/auth.middleware.ts";
import {
    createUrl,
    deleteCodes,
    getCodesById,
    getOriginalUrl,
} from "../services/url.service.ts";
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
            return res.status(400).json({ error: validationResult.error });
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

urlsRouter.delete(
    "/:id",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const id = req.params.id;
        const userid = req.user?.id;
        if (!id || !userid)
            return res.status(401).json({ error: "Unauthenticated request" });
        const result = await deleteCodes(id, userid);
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
