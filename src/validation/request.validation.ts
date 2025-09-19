import { z } from "zod";

export const signupPostRequestBodySchema = z.object({
    firstname: z
        .string()
        .regex(/^[A-Za-z]+$/, "Only alphabetic characters are allowed."),
    lastname: z
        .string()
        .regex(/^[A-Za-z]+$/, "Only alphabetic characters are allowed.")
        .optional(),
    email: z.email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .max(64, "Password must be at most 64 characters long.")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter."),
    /* for testing only
        .regex(/[0-9]/, "Password must contain at least one number.")
        .regex(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character.",
        ),*/
});

export const loginPostRequestBodySchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(64),
});
const forbiddenCodes = ["user", "codes"];

export const shortenPostRequestBodySchema = z.object({
    url: z.url(),
    code: z
        .string()
        .regex(/^[A-Za-z]+$/, "Only alphabetic characters are allowed.")
        .refine((value) => !forbiddenCodes.includes(value), {
            message: "The provided short code is reserved.",
        })
        .optional(),
});

export const updateUserRequestBodySchema = z.object({
    firstName: z.string(),
    lastName: z.string().optional(),
});

export const updateURLRequestBodySchema = z.object({
    shortCode: z.string(),
    targetUrl: z.url(),
});
