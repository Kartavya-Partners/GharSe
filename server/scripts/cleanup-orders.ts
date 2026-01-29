import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gharse";

async function cleanupOrders() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Get the Order collection
        const Order = mongoose.connection.collection("orders");

        // Find orders without tiffinSnapshot (orphaned orders)
        const orphanedOrders = await Order.find({
            $or: [
                { tiffinSnapshot: { $exists: false } },
                { "tiffinSnapshot.name": { $exists: false } }
            ]
        }).toArray();

        console.log(`\n📋 Found ${orphanedOrders.length} orders without tiffinSnapshot:`);

        for (const order of orphanedOrders) {
            console.log(`   - Order ID: ${order._id}, Status: ${order.status}, Price: ${order.totalPrice}`);
        }

        if (orphanedOrders.length > 0) {
            // Delete orphaned orders
            const result = await Order.deleteMany({
                $or: [
                    { tiffinSnapshot: { $exists: false } },
                    { "tiffinSnapshot.name": { $exists: false } }
                ]
            });
            console.log(`\n🗑️  Deleted ${result.deletedCount} orphaned orders`);
        } else {
            console.log("\n✅ No orphaned orders to delete");
        }

        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

cleanupOrders();
