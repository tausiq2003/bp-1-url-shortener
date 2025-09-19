import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users.models";

export const urlsTable = pgTable("urls", {
    id: uuid().primaryKey().defaultRandom(),
    shortCode: varchar("code", { length: 6 }).notNull().unique(),
    targetUrl: text("target_url").notNull(),
    userId: uuid("user_id")
        .references(() => usersTable.id, { onDelete: "cascade" })
        .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
