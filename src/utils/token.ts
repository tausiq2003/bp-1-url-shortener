import jwt, { type JwtPayload } from "jsonwebtoken";
import { userTokenSchema } from "../validation/token.validation.ts";
import { ZodError } from "zod";

const jwtSecret = process.env.JWT_SECRET;

export async function createUserToken(payload: object) {
    const validationResult = await userTokenSchema.safeParseAsync(payload);
    if (!validationResult.success) {
        throw new ZodError(validationResult.error.issues);
    }
    const payloadData = validationResult.data;
    if (!jwtSecret) {
        throw new Error("Secret not found");
    }
    const token = jwt.sign(payloadData, jwtSecret);
    return token;
}
export function validateUserToken(
    token: string,
): JwtPayload | { error: string } {
    try {
        if (!jwtSecret) {
            return { error: "Secret not found" };
        }
        const payload = jwt.verify(token, jwtSecret);
        if (typeof payload === "string") {
            return { error: "Invalid token payload" };
        }
        return payload;
    } catch (err) {
        return { error: (err as Error).message };
    }
}
