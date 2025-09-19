import express from "express";
import {
    loginPostRequestBodySchema,
    signupPostRequestBodySchema,
    updateUserRequestBodySchema,
} from "../validation/request.validation";
import { hashPassword } from "../utils/hash";
import {
    createUser,
    deleteUser,
    getUserByEmail,
    updateUser,
} from "../services/user.service";
import { createUserToken } from "../utils/token";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import type { AuthenticatedRequest } from "../types/requestType";

const userRouter = express.Router();
//create user
userRouter.post("/signup", async function (req, res) {
    const validationResult = await signupPostRequestBodySchema.safeParseAsync(
        req.body,
    );

    if (!validationResult.success) {
        const prettyErrors = validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));
        return res.status(400).json({ errors: prettyErrors });
    }
    const { firstname, lastname, email, password } = validationResult.data;

    const existingUser = await getUserByEmail(email);

    if (existingUser)
        return res
            .status(400)
            .json({ error: `User with email ${email} exists` });

    const { salt, hashedPassword } = hashPassword(password);

    const user = await createUser(
        firstname,
        lastname,
        email,
        hashedPassword,
        salt,
    );

    if (!user)
        return res.status(500).json({ error: "something wrong happened" });
    if ("error" in user) return res.status(500).json({ error: user.error });
    return res.status(201).json({ data: { userId: user.id } });
});
//login router

userRouter.post("/login", async function (req, res) {
    const validationResult = await loginPostRequestBodySchema.safeParseAsync(
        req.body,
    );

    if (!validationResult.success) {
        const prettyErrors = validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }));
        return res.status(400).json({ errors: prettyErrors });
    }
    const { email, password } = validationResult.data;
    const existingUser = await getUserByEmail(email);
    if (!existingUser)
        return res
            .status(404)
            .json({ error: `User with email ${email} does not exists` });
    //check hashed password
    const existingHashedPassword = existingUser.password;
    const existingSalt = existingUser.salt;
    const { hashedPassword } = hashPassword(password, existingSalt);

    if (hashedPassword !== existingHashedPassword) {
        return res.status(400).json({ error: "Wrong password" });
    }
    const token = await createUserToken({ id: existingUser.id });

    return res.status(200).json({ token });
});
//update router
userRouter.patch(
    "/update",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const validationResult =
            await updateUserRequestBodySchema.safeParseAsync(req.body);

        if (!validationResult.success) {
            const prettyErrors = validationResult.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
                code: issue.code,
            }));
            return res.status(400).json({ errors: prettyErrors });
        }
        const { firstName, lastName } = validationResult.data;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ errors: "Bad Request" });
        }
        const result = await updateUser(userId, firstName, lastName);

        if (!result)
            return res.status(500).json({ error: "something wrong happened" });
        if ("error" in result)
            return res.status(500).json({ error: result.error });
        return res.status(200).json({ data: { result } });
    },
);
//delete user
userRouter.delete(
    "/delete",
    ensureAuthenticated,
    async function (req: AuthenticatedRequest, res) {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ errors: "Bad Request" });
        }
        const result = await deleteUser(userId);

        if (!result)
            return res.status(500).json({ error: "something wrong happened" });
        if ("error" in result)
            return res.status(500).json({ error: result.error });
        return res.status(200).json({ data: { result } });
    },
);

export default userRouter;
