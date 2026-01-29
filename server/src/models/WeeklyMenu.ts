import mongoose, { Document, Schema } from "mongoose";

interface DayMenu {
    lunch: string;
    lunchPrice: number;
    lunchType: "veg" | "non-veg" | "vegan";
    dinner: string;
    dinnerPrice: number;
    dinnerType: "veg" | "non-veg" | "vegan";
    isHoliday: boolean;
}

export interface IWeeklyMenu extends Document {
    provider: mongoose.Types.ObjectId;
    weekStartDate: Date;
    weeklyPrice?: number; // Discounted weekly subscription price
    menu: {
        monday: DayMenu;
        tuesday: DayMenu;
        wednesday: DayMenu;
        thursday: DayMenu;
        friday: DayMenu;
        saturday: DayMenu;
        sunday: DayMenu;
    };
    createdAt: Date;
    updatedAt: Date;
}

const DayMenuSchema = {
    lunch: { type: String, default: "" },
    lunchPrice: { type: Number, default: 0 },
    lunchType: { type: String, enum: ["veg", "non-veg", "vegan"], default: "veg" },
    dinner: { type: String, default: "" },
    dinnerPrice: { type: Number, default: 0 },
    dinnerType: { type: String, enum: ["veg", "non-veg", "vegan"], default: "veg" },
    isHoliday: { type: Boolean, default: false },
};

const WeeklyMenuSchema = new Schema<IWeeklyMenu>(
    {
        provider: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        weekStartDate: {
            type: Date,
            required: true,
        },
        weeklyPrice: {
            type: Number,
            default: 0, // 0 means no weekly discount set
        },
        menu: {
            monday: DayMenuSchema,
            tuesday: DayMenuSchema,
            wednesday: DayMenuSchema,
            thursday: DayMenuSchema,
            friday: DayMenuSchema,
            saturday: DayMenuSchema,
            sunday: DayMenuSchema,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for provider + week
WeeklyMenuSchema.index({ provider: 1, weekStartDate: 1 }, { unique: true });

export default mongoose.model<IWeeklyMenu>("WeeklyMenu", WeeklyMenuSchema);
