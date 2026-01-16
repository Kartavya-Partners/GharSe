import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: "customer" | "provider";
    address?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
            select: false, // Don't return password by default
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["customer", "provider"],
            default: "customer",
        },
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries
UserSchema.index({ "address.coordinates": "2dsphere" });

export default mongoose.model<IUser>("User", UserSchema);
