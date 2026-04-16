"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    UtensilsCrossed,
    Search,
    ChefHat,
    MapPin,
    ShoppingBag,
    Truck,
    CheckCircle,
    Star,
    ArrowRight,
    ChevronDown,
    Clock,
    Leaf,
    Shield,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
    }),
};

const steps = [
    {
        number: "1",
        title: "Discover Local Chefs",
        description:
            "Browse verified home chefs in your neighborhood using our interactive map. Find culinary gems just around the corner who cook with love and authentic spices.",
        features: ["Verified home kitchens", "Browse by cuisine & ratings"],
        icon: Search,
        color: "from-orange-400 to-orange-600",
        bgColor: "bg-orange-50",
        illustration: (
            <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Sunita&apos;s Kitchen</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                4.8 &bull; 120+ orders
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md">VEG</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md">MAHARASHTRIAN</span>
                    </div>
                </div>
                <motion.div
                    className="absolute -top-4 -left-6 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    Find Chefs Nearby!
                </motion.div>
            </div>
        ),
    },
    {
        number: "2",
        title: "Pick Your Thali",
        description:
            "Choose from a rotating daily menu of authentic, healthy thali options. Whether you crave a spicy curry or a light dal, customize your meal plan to fit your taste.",
        features: ["Daily changing menus", "Flexible subscription plans"],
        icon: UtensilsCrossed,
        color: "from-orange-500 to-red-500",
        bgColor: "bg-red-50",
        illustration: (
            <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="h-36 bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center relative overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80"
                            alt="Thali"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="p-4">
                        <h4 className="font-bold text-gray-900 text-sm">Deluxe Veg Thali</h4>
                        <p className="text-xs text-gray-500 mt-1">4 Roti, 2 Sabzi, Dal, Rice, Salad, Dessert</p>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-orange-500">₹120</span>
                            <button className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600 transition-colors">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
                <motion.div
                    className="absolute -bottom-3 -right-4 italic text-orange-400 font-medium text-sm"
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    So many choices!
                </motion.div>
            </div>
        ),
    },
    {
        number: "3",
        title: "Enjoy Your Meal",
        description:
            "Sit back while we deliver hot, freshly packed tiffins right to you. Our insulated packaging ensures your food stays warm and delicious until the very last bite.",
        features: ["Contactless delivery available", "Real-time order tracking"],
        icon: Truck,
        color: "from-green-500 to-emerald-600",
        bgColor: "bg-emerald-50",
        illustration: (
            <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Out for Delivery</p>
                            <p className="text-xs text-gray-500">Arriving in 15 mins</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            initial={{ width: "30%" }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium">
                        <span>Preparing</span>
                        <span>On the way</span>
                        <span>Delivered</span>
                    </div>
                </div>
                <motion.div
                    className="absolute -top-4 -left-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                    Hot &amp; Tasty!
                </motion.div>
            </div>
        ),
    },
];

export default function HowItWorksPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans antialiased overflow-x-hidden">
            {/* ========== NAVBAR ========== */}
            <Navbar />

            {/* ========== HERO ========== */}
            <section className="relative py-20 md:py-28 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-orange-100/60 rounded-full blur-[100px]" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-100/40 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-3xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-6"
                    >
                        <span className="bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-orange-200">
                            Simple &amp; Easy
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
                    >
                        Delicious Home Food in
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                            3 Simple Steps
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
                    >
                        Experience the warmth of homemade meals delivered to your doorstep. From a local home kitchen to your table, just like mom makes it.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-10 flex flex-col items-center gap-1 text-gray-400"
                    >
                        <span className="text-sm italic">Let&apos;s see how!</span>
                        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ========== STEPS ========== */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {steps.map((step, idx) => {
                    const isReversed = idx % 2 === 1;
                    return (
                        <motion.div
                            key={step.number}
                            custom={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeUp}
                            className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-20 mb-24 last:mb-0`}
                        >
                            {/* Illustration */}
                            <div className="flex-1 flex justify-center">
                                <div className={`${step.bgColor} rounded-[2.5rem] p-8 md:p-12 relative`}>
                                    {step.illustration}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 max-w-lg">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-6`}>
                                    {step.number}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                    {step.title}
                                </h2>
                                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                                    {step.description}
                                </p>
                                <ul className="space-y-3">
                                    {step.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-3 text-gray-600">
                                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <span className="text-sm font-medium">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    );
                })}
            </section>

            {/* ========== WHY GHARSE ========== */}
            <section className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
                    >
                        Why Choose GharSe?
                    </motion.h2>
                    <p className="text-gray-500 max-w-xl mx-auto mb-14 text-lg">
                        We&apos;re not just another food delivery app. We connect you with real home chefs.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Leaf, title: "Fresh & Hygienic", desc: "Every meal is cooked fresh in clean, certified home kitchens using quality ingredients." },
                            { icon: Shield, title: "Verified Chefs", desc: "All our home chefs go through a rigorous verification and hygiene audit process." },
                            { icon: Clock, title: "On-Time Delivery", desc: "Insulated packaging ensures your food arrives hot and delicious, right on schedule." },
                        ].map((item, idx) => (
                            <motion.div
                                key={item.title}
                                custom={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="bg-[#FDFBF7] rounded-2xl p-8 border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all group"
                            >
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                    <item.icon className="w-7 h-7 text-orange-500" />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== CTA ========== */}
            <section className="py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                            Ready to taste the difference?
                        </h2>
                        <p className="text-gray-500 text-lg mb-8">
                            Join thousands of happy customers enjoying healthy, homemade meals every day.
                        </p>
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all text-lg group"
                        >
                            Get Started Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <p className="text-xs text-gray-400 mt-4">No subscription required for first order</p>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
