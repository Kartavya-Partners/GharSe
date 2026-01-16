import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema({
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
}, {
    timestamps: true,
});
// Index for geospatial queries
UserSchema.index({ "address.coordinates": "2dsphere" });
export default mongoose.model("User", UserSchema);
//# sourceMappingURL=User.js.map