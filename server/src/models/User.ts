import mongoose, { Document, Schema } from "mongoose";

interface SavedAddress {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
    isDefault: boolean;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
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
    savedAddresses?: SavedAddress[];
    createdAt: Date;
    updatedAt: Date;
}

const SavedAddressSchema = new Schema({
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "State" },
    pincode: { type: String, required: true },
    coordinates: {
        lat: Number,
        lng: Number,
    },
    isDefault: { type: Boolean, default: false },
}, { _id: true });

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
            minlength: 6,
            select: false, // Don't return password by default
        },
        googleId: {
            type: String,
            sparse: true,
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
        savedAddresses: [SavedAddressSchema],
    },
    {
        timestamps: true,
    }
);

// Index for geospatial queries
UserSchema.index({ "address.coordinates": "2dsphere" });

export default mongoose.model<IUser>("User", UserSchema);
