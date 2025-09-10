import { eq } from "drizzle-orm";
import db from "../db/index.ts";
import { usersTable } from "../models/users.models.ts";

export async function getUserByEmail(email: string) {
    const [existingUser] = await db
        .select({
            id: usersTable.id,
            firstname: usersTable.firstname,
            lastname: usersTable.lastname,
            email: usersTable.email,
            password: usersTable.password,
            salt: usersTable.salt,
        })
        .from(usersTable)
        .where(eq(usersTable.email, email));
    return existingUser;
}
export async function createUser(
    firstname: string,
    lastname: string | undefined,
    email: string,
    password: string,
    salt: string,
) {
    try {
        const [user] = await db
            .insert(usersTable)
            .values({ firstname, lastname, email, password, salt })
            .returning({ id: usersTable.id });
        return user;
    } catch (err) {
        return {
            error: (err as Error).message,
        };
    }
}
