import mongoose, { Document } from "mongoose";
export interface ISubscription extends Document {
    customer: mongoose.Types.ObjectId;
    tiffin: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    frequency: "daily" | "weekly" | "monthly";
    daysOfWeek?: number[];
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
declare const _default: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}, mongoose.DefaultSchemaOptions> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubscription>;
export default _default;
//# sourceMappingURL=Subscription.d.ts.map