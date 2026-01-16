import mongoose, { Document } from "mongoose";
export interface ITiffin extends Document {
    provider: mongoose.Types.ObjectId;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    images: string[];
    isAvailable: boolean;
    cutoffTime: string;
    maxOrdersPerDay?: number;
    rating?: number;
    reviewCount?: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITiffin, {}, {}, {}, mongoose.Document<unknown, {}, ITiffin, {}, mongoose.DefaultSchemaOptions> & ITiffin & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITiffin>;
export default _default;
//# sourceMappingURL=Tiffin.d.ts.map