import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User.js";

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token || "",
                process.env.JWT_SECRET || "default_secret"
            );

            // In a real app, you might want to fetch the user from DB to ensure they still exist
            // req.user = await User.findById(decoded.id).select("-password");
            req.user = decoded;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        console.log(`[authorize] Required roles: ${roles.join(", ")}, User role: ${req.user?.role}`);
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user?.role} is not authorized to access this route`,
            });
        }
        next();
    };
};
