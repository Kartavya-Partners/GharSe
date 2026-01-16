import mongoose, { Document, Schema } from "mongoose";

export interface ITiffin extends Document {
    provider: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    images: string[];
    isAvailable: boolean;
    cutoffTime: string; // Format: "HH:MM" (e.g., "10:00" for 10 AM)
    maxOrdersPerDay?: number;
    rating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

const TiffinSchema = new Schema<ITiffin>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Tiffin name is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
        },
        type: {
            type: String,
            enum: ["veg", "non-veg", "vegan"],
            required: true,
        },
        mealType: {
            type: String,
            enum: ["breakfast", "lunch", "dinner"],
            required: true,
        },
        images: {
            type: [String],
            default: [],
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        cutoffTime: {
            type: String,
            required: [true, "Cutoff time is required"],
            match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:MM format
        },
        maxOrdersPerDay: {
            type: Number,
            min: 1,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITiffin>("Tiffin", TiffinSchema);
