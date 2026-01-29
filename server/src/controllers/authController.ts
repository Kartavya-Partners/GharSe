import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "30d",
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, address } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "customer",
            address,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        // Check if user has password (OAuth users may not have one)
        if (!user.password) {
            res.status(401).json({ message: "Please login with Google" });
            return;
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (isPasswordMatch) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth login (customers only)
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { credential } = req.body;

        if (!credential) {
            res.status(400).json({ message: "Google credential is required" });
            return;
        }

        // Verify Google token
        const response = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
        );

        if (!response.ok) {
            res.status(401).json({ message: "Invalid Google token" });
            return;
        }

        const googleUser = await response.json();
        const { sub: googleId, email, name, picture } = googleUser;

        if (!email) {
            res.status(400).json({ message: "Email not provided by Google" });
            return;
        }

        // Check if user exists by googleId or email
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            // If user exists but doesn't have googleId, link it
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }

            // Check if user is a provider (providers should not use Google login)
            if (user.role === "provider") {
                res.status(400).json({
                    message: "Providers should login with email and password"
                });
                return;
            }
        } else {
            // Create new customer user
            user = await User.create({
                googleId,
                email,
                name: name || email.split("@")[0],
                role: "customer",
            });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error: any) {
        console.error("Google login error:", error);
        res.status(500).json({ message: error.message });
    }
};
