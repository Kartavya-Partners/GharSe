import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User";
import Tiffin from "./models/Tiffin";
import Order from "./models/Order";

dotenv.config();

// Narhe, Pune coordinates: ~18.4529°N, 73.8263°E
const NARHE_CENTER = { lat: 18.4529, lng: 73.8263 };

async function seed() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("MONGODB_URI not set");
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // ========== CLEANUP ==========
    console.log("\n🗑️  Cleaning up old data...");

    // Delete all tiffins
    const deletedTiffins = await Tiffin.deleteMany({});
    console.log(`   Deleted ${deletedTiffins.deletedCount} tiffins`);

    // Delete all orders
    const deletedOrders = await Order.deleteMany({});
    console.log(`   Deleted ${deletedOrders.deletedCount} orders`);

    // Delete all provider users (keep customers)
    const deletedProviders = await User.deleteMany({ role: "provider" });
    console.log(`   Deleted ${deletedProviders.deletedCount} providers`);

    // ========== CREATE PROVIDERS ==========
    console.log("\n👨‍🍳 Creating providers near Narhe, Pune...");

    const hashedPassword = await bcrypt.hash("Test@123", 10);

    const provider1 = await User.create({
        name: "Sunita Patil",
        email: "sunita.patil@test.com",
        password: hashedPassword,
        phone: "9876543201",
        role: "provider",
        address: {
            street: "Lane 5, Narhe Ambegaon Road",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411041",
            coordinates: {
                lat: NARHE_CENTER.lat + 0.005,  // ~500m north
                lng: NARHE_CENTER.lng + 0.003,
            },
        },
    });
    console.log(`   ✅ ${provider1.name} — ${provider1.email}`);

    const provider2 = await User.create({
        name: "Rajesh Kulkarni",
        email: "rajesh.kulkarni@test.com",
        password: hashedPassword,
        phone: "9876543202",
        role: "provider",
        address: {
            street: "Near Narhe Bus Stop, Sinhagad Road",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411041",
            coordinates: {
                lat: NARHE_CENTER.lat - 0.004,  // ~400m south
                lng: NARHE_CENTER.lng + 0.006,
            },
        },
    });
    console.log(`   ✅ ${provider2.name} — ${provider2.email}`);

    const provider3 = await User.create({
        name: "Meena Deshpande",
        email: "meena.deshpande@test.com",
        password: hashedPassword,
        phone: "9876543203",
        role: "provider",
        address: {
            street: "Dhayari Phata, Near D-Mart",
            city: "Pune",
            state: "Maharashtra",
            pincode: "411041",
            coordinates: {
                lat: NARHE_CENTER.lat + 0.008,  // ~800m north-east
                lng: NARHE_CENTER.lng - 0.005,
            },
        },
    });
    console.log(`   ✅ ${provider3.name} — ${provider3.email}`);

    // ========== CREATE TIFFINS ==========
    console.log("\n🍱 Creating tiffins...");

    const tiffinsData = [
        // --- Sunita's Kitchen ---
        {
            provider: provider1._id,
            name: "Maharashtrian Thali",
            description: "Complete traditional thali with puri-bhaji, amti dal, rice, 2 sabzis (aloo gobi, bharli vangi), pickle, papad, and sweet (gulab jamun). Homestyle cooking with fresh masalas ground daily.",
            price: 120,
            type: "veg" as const,
            mealType: "lunch" as const,
            images: [
                "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 25,
            rating: 4.6,
            reviewCount: 87,
        },
        {
            provider: provider1._id,
            name: "Poha & Chai Combo",
            description: "Fluffy kanda poha with sev, lemon, and fresh coriander served with hot adrak chai. Perfect Maharashtrian breakfast to start your day.",
            price: 60,
            type: "veg" as const,
            mealType: "breakfast" as const,
            images: [
                "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 30,
            rating: 4.8,
            reviewCount: 134,
        },

        // --- Rajesh's Kitchen ---
        {
            provider: provider2._id,
            name: "Chicken Biryani Box",
            description: "Fragrant Hyderabadi-style chicken biryani cooked dum style with tender marinated chicken, basmati rice, fried onions, and served with raita and salan.",
            price: 180,
            type: "non-veg" as const,
            mealType: "lunch" as const,
            images: [
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 20,
            rating: 4.7,
            reviewCount: 201,
        },
        {
            provider: provider2._id,
            name: "Paneer Butter Masala Meal",
            description: "Creamy paneer butter masala with buttery naan (2 pcs), jeera rice, onion salad, and a gulab jamun. Rich North Indian flavors.",
            price: 150,
            type: "veg" as const,
            mealType: "dinner" as const,
            images: [
                "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 15,
            rating: 4.5,
            reviewCount: 95,
        },

        // --- Meena's Kitchen ---
        {
            provider: provider3._id,
            name: "Healthy Salad Bowl",
            description: "Fresh mixed greens with chickpeas, cucumber, tomatoes, roasted paneer cubes, sunflower seeds, with a lemon-tahini dressing. Low-calorie, high-protein.",
            price: 140,
            type: "vegan" as const,
            mealType: "lunch" as const,
            images: [
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 15,
            rating: 4.4,
            reviewCount: 52,
        },
        {
            provider: provider3._id,
            name: "Misal Pav",
            description: "Spicy and tangy Puneri misal with farsan, chopped onions, lemon, and fresh pav. Authentic home recipe with sprouted moth beans.",
            price: 80,
            type: "veg" as const,
            mealType: "breakfast" as const,
            images: [
                "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=600&q=80",
            ],
            isAvailable: true,
            cutoffTime: "22:00",
            maxOrdersPerDay: 30,
            rating: 4.9,
            reviewCount: 178,
        },
    ];

    const createdTiffins = await Tiffin.insertMany(tiffinsData);
    console.log(`   ✅ Created ${createdTiffins.length} tiffins`);

    for (const t of createdTiffins) {
        console.log(`      • ${t.name} — ₹${t.price} (${t.type}, ${t.mealType})`);
    }

    // ========== SUMMARY ==========
    console.log("\n" + "=".repeat(50));
    console.log("🎉 SEED COMPLETE!");
    console.log("=".repeat(50));
    console.log(`\n📍 All providers located near Narhe, Pune (18.4529°N, 73.8263°E)`);
    console.log(`\n👨‍🍳 Providers (login with password: Test@123):`);
    console.log(`   1. Sunita Patil  — sunita.patil@test.com`);
    console.log(`   2. Rajesh Kulkarni — rajesh.kulkarni@test.com`);
    console.log(`   3. Meena Deshpande — meena.deshpande@test.com`);
    console.log(`\n🍱 Tiffins: ${createdTiffins.length} meals across 3 kitchens`);
    console.log(`\n💡 To test as customer, login with your customer account`);
    console.log(`   and set your location to Narhe, Pune.\n`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
