"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    UtensilsCrossed,
    Star,
    Heart,
    Quote,
    ChefHat,
    MapPin,
    Users,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
    }),
};

const customerStories = [
    {
        name: "Priya Sharma",
        location: "Narhe, Pune",
        avatar: "PS",
        rating: 5,
        story: "As a working professional, finding healthy home food was a nightmare. GharSe changed everything! Sunita aunty's Maharashtrian thali is exactly like my mom's cooking. I've been ordering daily for 3 months now.",
        highlight: "Lost 5 kgs switching from junk food to GharSe tiffins!",
        color: "bg-orange-100 text-orange-600",
    },
    {
        name: "Rohan Deshmukh",
        location: "Sinhagad Road, Pune",
        avatar: "RD",
        rating: 5,
        story: "Being a college student away from home, I really missed ghar ka khana. Rajesh bhaiya's chicken biryani rivals any restaurant. The portions are generous and honestly, it feels like a warm hug from home.",
        highlight: "My entire hostel floor now orders from GharSe!",
        color: "bg-blue-100 text-blue-600",
    },
    {
        name: "Anita Kulkarni",
        location: "Dhayari, Pune",
        avatar: "AK",
        rating: 5,
        story: "I started ordering for my elderly parents who live alone. Meena didi's healthy salad bowls and misal pav keep them fed with nutritious, tasty meals. The delivery is always on time and the food is piping hot.",
        highlight: "My parents' health improved noticeably in just 2 months!",
        color: "bg-green-100 text-green-600",
    },
    {
        name: "Vikram Patil",
        location: "IT Park, Hinjewadi",
        avatar: "VP",
        rating: 4,
        story: "Our entire office switched to GharSe for lunch. No more greasy cafeteria food! The variety is amazing — from Maharashtrian to North Indian. Plus, the prices are way cheaper than restaurant delivery.",
        highlight: "Saved ₹3,000/month compared to Zomato orders!",
        color: "bg-purple-100 text-purple-600",
    },
];

const chefSpotlights = [
    {
        name: "Sunita Patil",
        location: "Narhe, Pune",
        specialty: "Maharashtrian Thali",
        avatar: "SP",
        story: "I've been cooking for my family for 25 years, but when my kids moved out, I felt purposeless. GharSe gave me a chance to share my recipes with thousands. Now I cook 25 thalis daily, and every empty tiffin that comes back fills my heart.",
        stats: { orders: "3,500+", rating: 4.8, years: "2 years" },
        gradient: "from-orange-400 to-red-400",
    },
    {
        name: "Meena Deshpande",
        location: "Dhayari, Pune",
        specialty: "Healthy & Vegan Bowls",
        avatar: "MD",
        story: "After retiring from teaching, I wanted to promote healthy eating. I started with just misal pav, and now I serve salad bowls, smoothie bowls, and traditional snacks. My customers call me 'Nutrition Aunty' and I love it!",
        stats: { orders: "1,800+", rating: 4.9, years: "1.5 years" },
        gradient: "from-green-400 to-emerald-500",
    },
    {
        name: "Rajesh Kulkarni",
        location: "Sinhagad Road, Pune",
        specialty: "North Indian & Biryani",
        avatar: "RK",
        story: "I lost my restaurant during COVID. GharSe helped me rebuild from my own kitchen. My biryani is still the same one people loved at my restaurant — authentic dum-style with fresh spices. I'm earning more now than I ever did before.",
        stats: { orders: "5,200+", rating: 4.7, years: "2.5 years" },
        gradient: "from-red-400 to-orange-500",
    },
];

const impactNumbers = [
    { number: "10,000+", label: "Happy Customers", icon: Users },
    { number: "150+", label: "Home Chefs", icon: ChefHat },
    { number: "50,000+", label: "Meals Delivered", icon: UtensilsCrossed },
    { number: "4.8", label: "Avg Rating", icon: Star },
];

export default function StoriesPage() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans antialiased overflow-x-hidden">
            {/* ========== NAVBAR ========== */}
            <Navbar />

            {/* ========== HERO ========== */}
            <section className="relative py-20 md:py-28 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-20 w-80 h-80 bg-orange-100/50 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-10 w-72 h-72 bg-red-100/40 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-3xl mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-6"
                    >
                        <span className="bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-orange-200 inline-flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 fill-orange-500" />
                            Real Stories, Real People
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
                    >
                        Stories from the
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                            GharSe Family
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
                    >
                        From hungry students to busy professionals, from passionate home chefs to retired teachers — GharSe brings everyone to the same table.
                    </motion.p>
                </div>
            </section>

            {/* ========== IMPACT NUMBERS ========== */}
            <section className="max-w-5xl mx-auto px-4 mb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {impactNumbers.map((item, idx) => (
                        <motion.div
                            key={item.label}
                            custom={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <item.icon className="w-6 h-6 text-orange-500" />
                            </div>
                            <p className="text-2xl md:text-3xl font-extrabold text-orange-500">{item.number}</p>
                            <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ========== CUSTOMER STORIES ========== */}
            <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Real reviews from real people who made the switch to home-cooked meals.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {customerStories.map((story, idx) => (
                        <motion.div
                            key={story.name}
                            custom={idx}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden"
                        >
                            {/* Decorative quote */}
                            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Quote className="w-16 h-16 text-orange-500" />
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-5">
                                {Array.from({ length: story.rating }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>

                            {/* Story text */}
                            <p className="text-gray-600 leading-relaxed mb-5 text-sm">
                                &ldquo;{story.story}&rdquo;
                            </p>

                            {/* Highlight */}
                            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-6">
                                <p className="text-sm font-bold text-orange-600 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    {story.highlight}
                                </p>
                            </div>

                            {/* Person */}
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 ${story.color} rounded-full flex items-center justify-center font-bold text-sm`}>
                                    {story.avatar}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{story.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {story.location}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ========== CHEF SPOTLIGHTS ========== */}
            <section className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-orange-200 inline-flex items-center gap-2 mb-4">
                            <ChefHat className="w-3.5 h-3.5" />
                            Chef Spotlights
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                            Meet the Chefs Behind Your Meals
                        </h2>
                        <p className="text-gray-500 text-lg max-w-xl mx-auto">
                            These passionate home chefs put their heart into every meal they prepare for you.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {chefSpotlights.map((chef, idx) => (
                            <motion.div
                                key={chef.name}
                                custom={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                className="bg-[#FDFBF7] rounded-[2rem] p-8 md:p-10 border border-gray-100 hover:shadow-lg transition-all"
                            >
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar & Stats */}
                                    <div className="flex-shrink-0 text-center md:text-left">
                                        <div className={`w-24 h-24 bg-gradient-to-br ${chef.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto md:mx-0 shadow-lg`}>
                                            {chef.avatar}
                                        </div>
                                        <div className="mt-4 space-y-1">
                                            <p className="font-extrabold text-gray-900">{chef.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 justify-center md:justify-start">
                                                <MapPin className="w-3 h-3" /> {chef.location}
                                            </p>
                                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold inline-block">
                                                {chef.specialty}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Story */}
                                    <div className="flex-1">
                                        <p className="text-gray-600 leading-relaxed mb-6">
                                            &ldquo;{chef.story}&rdquo;
                                        </p>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-lg font-extrabold text-orange-500">{chef.stats.orders}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">Orders Served</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-lg font-extrabold text-orange-500 flex items-center justify-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    {chef.stats.rating}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-medium">Avg Rating</p>
                                            </div>
                                            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                                                <p className="text-lg font-extrabold text-orange-500">{chef.stats.years}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">On GharSe</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== BECOME A CHEF CTA ========== */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-orange-500 to-red-500 rounded-[2rem] p-10 md:p-14 text-center text-white relative overflow-hidden"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                                Have a Recipe the World Should Taste?
                            </h2>
                            <p className="text-white/80 text-lg max-w-lg mx-auto mb-8">
                                Join our community of home chefs. Cook from your kitchen, earn on your schedule, and share your passion with thousands.
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all text-lg group"
                            >
                                Become a Chef
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
