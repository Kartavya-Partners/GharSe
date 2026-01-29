import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
    customer: mongoose.Types.ObjectId;
    tiffin: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    deliveryDate: Date;
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
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
    deliveryInstructions?: string;
    paymentStatus: "pending" | "paid" | "refunded";
    // Snapshot for order history preservation when tiffin is deleted
    tiffinSnapshot: {
        name: string;
        price: number;
        type: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
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
        deliveryDate: {
            type: Date,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"],
            default: "pending",
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
        deliveryInstructions: {
            type: String,
            default: "",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "refunded"],
            default: "pending",
        },
        tiffinSnapshot: {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            type: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
