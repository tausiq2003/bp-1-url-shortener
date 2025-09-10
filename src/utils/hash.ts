import { createHmac, randomBytes } from "crypto";

export function hashPassword(password: string, salt?: string) {
    if (!salt) {
        salt = randomBytes(256).toString("hex");
    }
    const hashedPassword = createHmac("sha256", salt)
        .update(password)
        .digest("hex");
    return { salt, hashedPassword };
}
export function compareHash(
    password: string,
    hashPassword: string,
    salt: string,
) {
    const newHash = createHmac("sha256", salt).update(password).digest("hex");
    return newHash === hashPassword;
}
