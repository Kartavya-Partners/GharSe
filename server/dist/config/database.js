import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || "";
        await mongoose.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};
mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
});
mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
});
export default connectDB;
//# sourceMappingURL=database.js.map