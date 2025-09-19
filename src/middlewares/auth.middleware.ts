import type { Response, NextFunction } from "express";
import { validateUserToken } from "../utils/token";
import type { AuthenticatedRequest } from "../types/requestType";

export function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const [, token] = authHeader.split(" ");
        if (token) {
            const payload = validateUserToken(token);
            if (payload && !("error" in payload)) {
                req.user = payload;
            }
        }
    }
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
