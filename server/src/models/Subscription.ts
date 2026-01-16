import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
    customer: mongoose.Types.ObjectId;
    tiffin: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    frequency: "daily" | "weekly" | "monthly";
    daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly subscriptions
    status: "active" | "paused" | "cancelled" | "completed";
    totalPrice: number;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    paymentStatus: "pending" | "paid" | "partially-paid";
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tiffin: {
            type: Schema.Types.ObjectId,
            ref: "Tiffin",
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            required: true,
        },
        daysOfWeek: {
            type: [Number],
            validate: {
                validator: (v: number[]) => v.every((day) => day >= 0 && day <= 6),
                message: "Days of week must be between 0 (Sunday) and 6 (Saturday)",
            },
        },
        status: {
            type: String,
            enum: ["active", "paused", "cancelled", "completed"],
            default: "active",
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            coordinates: {
                lat: Number,
                lng: Number,
            },
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "partially-paid"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
