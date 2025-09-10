import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
    firstname: z.string(),
    lastname: z.string().optional(),
    email: z.email(),
    password: z.string().min(4).max(10),
});

export const loginPostRequestBodySchema = z.object({
    email: z.email(),
    password: z.string().min(4).max(10),
});

export const shortenPostRequestBodySchema = z.object({
    url: z.url(),
    code: z
        .string()
        .optional()
        .refine((val) => val === undefined || val !== "shorten", {
            message: `"shorten" is a reserved code and cannot be used`,
        }),
});
