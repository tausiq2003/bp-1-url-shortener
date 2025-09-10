import { urlsTable } from "../models/urls.models.ts";
import db from "../db/index.ts";
import { and, eq } from "drizzle-orm";

export async function createUrl(
    url: string,
    shortCode: string,
    userId: string,
) {
    const [result] = await db
        .insert(urlsTable)
        .values({
            shortCode: shortCode,
            targetUrl: url,
            userId: userId,
        })
        .returning({
            id: urlsTable.id,
            shortCode: urlsTable.shortCode,
            targetUrl: urlsTable.targetUrl,
        });
    return result;
}
export async function getOriginalUrl(code: string) {
    const [result] = await db
        .select({ targetUrl: urlsTable.targetUrl })
        .from(urlsTable)
        .where(eq(urlsTable.shortCode, code));

    return result;
}
export async function getCodesById(id: string) {
    const codes = await db
        .select()
        .from(urlsTable)
        .where(eq(urlsTable.userId, id));
    return codes;
}
export async function deleteCodes(id: string, userid: string) {
    const [result] = await db
        .delete(urlsTable)
        .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, userid)))
        .returning({
            shortCode: urlsTable.shortCode,
            targetUrl: urlsTable.targetUrl,
        });
    return result;
}
