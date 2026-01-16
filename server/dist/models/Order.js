import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
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
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded"],
        default: "pending",
    },
}, {
    timestamps: true,
});
export default mongoose.model("Order", OrderSchema);
//# sourceMappingURL=Order.js.map