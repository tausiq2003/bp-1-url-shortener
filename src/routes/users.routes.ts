import express from "express";
import {
    loginPostRequestBodySchema,
    signupPostRequestBodySchema,
} from "../validation/request.validation.ts";
import { hashPassword } from "../utils/hash.ts";
import { createUser, getUserByEmail } from "../services/user.service.ts";
import { createUserToken } from "../utils/token.ts";

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
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

userRouter.post("/login", async (req, res) => {
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
    const token = createUserToken({ id: existingUser.id });

    return res.status(200).json({ token });
});

export default userRouter;
