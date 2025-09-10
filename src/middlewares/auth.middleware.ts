import type { Response, NextFunction } from "express";
import { validateUserToken } from "../utils/token.ts";
import type { AuthenticatedRequest } from "../types/requestType.ts";

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return res.status(401).json({ error: "Bad Request, secure route" });
    if (!authHeader.startsWith("Bearer "))
        return res.status(401).json({ error: "Bad Request, bad auth" });
    const [, token] = authHeader.split(" ");
    if (!token) {
        return res.status(401).json({ error: "Bad Request, bad auth" });
    }

    const payload = validateUserToken(token);

    if (!payload || "error" in payload) {
        return res
            .status(401)
            .json({ error: payload?.error || "Invalid token" });
    }
    req.user = payload;
    next();
}

export function ensureAuthenticated(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized request" });
    }
    next();
}
