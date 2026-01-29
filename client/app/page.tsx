"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  ShoppingBag,
  UtensilsCrossed,
  ArrowRight,
  MapPin,
  ShieldCheck,
  Clock,
  Heart,
  Star,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "provider") {
        router.replace("/dashboard/provider");
      } else {
        router.replace("/explore");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading while checking auth or redirecting
  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-warm-white)] flex flex-col overflow-x-hidden">
      {/* ========== NAVBAR ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 py-4">
        <nav className="max-w-7xl mx-auto glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center group -my-2">
            <Image
              src="/logo.png"
              alt="GharSe"
              width={72}
              height={72}
              className="h-16 w-auto"
            />
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              How it works
            </Link>
            <Link
              href="#features"
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="#safety"
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
            >
              Trust & Safety
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
              >
                Log in
              </Button>
            </Link>
            <Link href="/login" className="hidden sm:block">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* ========== HERO SECTION ========== */}
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4 lg:px-8">
          {/* Background */}
          <div className="absolute inset-0 gradient-hero" />

          {/* Decorative Blobs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-orange-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-green-300/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-red-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

          {/* Floating Food Elements - Decorative */}
          <motion.div
            className="absolute top-32 right-[15%] hidden lg:block"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-xl flex items-center justify-center">
              <span className="text-3xl">🍛</span>
            </div>
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-[10%] hidden lg:block"
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-xl flex items-center justify-center">
              <span className="text-2xl">🥗</span>
            </div>
          </motion.div>
          <motion.div
            className="absolute top-1/2 right-[8%] hidden lg:block"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl shadow-lg flex items-center justify-center">
              <span className="text-xl">🫓</span>
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-6xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-md mb-8 border border-orange-100"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Homemade food, delivered with love
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 mb-6 text-balance"
            >
              Ghar ka Khana,
              <br />
              <span className="gradient-text-orange">Ab Door Nahi.</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 text-balance"
            >
              Connect with trusted home chefs in your neighborhood. Fresh,
              hygienic, homely meals delivered to your doorstep — just like
              maa ke haath ka khana.
            </motion.p>

            {/* CTA Cards */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {/* Customer Card */}
              <motion.div variants={fadeInUp}>
                <Link href="/login?role=customer" className="block group">
                  <div className="relative glass-card rounded-3xl p-8 border-2 border-transparent hover:border-orange-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    {/* Gradient Bar */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-3xl" />

                    {/* Icon */}
                    <div className="relative mx-auto mb-6 w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative bg-gradient-to-br from-orange-500 to-red-500 w-full h-full rounded-2xl flex items-center justify-center shadow-xl">
                        <ShoppingBag className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Order Tiffin
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Discover homemade tiffins near you. Subscribe for daily
                      fresh meals.
                    </p>

                    <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all">
                      <span>Start Ordering</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Provider Card */}
              <motion.div variants={fadeInUp}>
                <Link href="/login?role=provider" className="block group">
                  <div className="relative glass-card rounded-3xl p-8 border-2 border-transparent hover:border-green-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                    {/* Gradient Bar */}
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-3xl" />

                    {/* Icon */}
                    <div className="relative mx-auto mb-6 w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 w-full h-full rounded-2xl flex items-center justify-center shadow-xl">
                        <ChefHat className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      Become a Provider
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Turn your kitchen into a business. Cook, earn, and make a
                      difference.
                    </p>

                    <div className="flex items-center justify-center gap-2 text-green-600 font-semibold group-hover:gap-4 transition-all">
                      <span>Start Selling</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Verified Home Chefs</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span>Fresh Daily Delivery</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section id="how-it-works" className="py-24 px-4 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How GharSe Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get delicious homemade food in just three simple steps
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: MapPin,
                  title: "Find Nearby Chefs",
                  description:
                    "Enter your location to discover verified home chefs cooking delicious meals in your area.",
                  color: "orange",
                },
                {
                  step: "02",
                  icon: UtensilsCrossed,
                  title: "Choose Your Meal",
                  description:
                    "Browse menus, check ratings, and pick your perfect tiffin. Subscribe daily, weekly, or monthly.",
                  color: "red",
                },
                {
                  step: "03",
                  icon: Heart,
                  title: "Enjoy Fresh Food",
                  description:
                    "Get freshly cooked, hygienic meals delivered to your doorstep. Just like home!",
                  color: "green",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="feature-card h-full text-center group">
                    {/* Step Number */}
                    <div
                      className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold bg-${item.color}-500 text-white shadow-lg`}
                    >
                      Step {item.step}
                    </div>

                    {/* Icon */}
                    <div
                      className={`mx-auto mt-4 mb-6 w-16 h-16 rounded-2xl bg-${item.color}-100 flex items-center justify-center transition-transform group-hover:scale-110`}
                    >
                      <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FEATURES ========== */}
        <section
          id="features"
          className="py-24 px-4 lg:px-8 bg-gradient-to-b from-orange-50 to-white"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 bg-green-100 text-green-600 rounded-full text-sm font-semibold mb-4">
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                The GharSe Difference
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We&apos;re not just food delivery. We&apos;re bringing the warmth of home to
                your plate.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: MapPin,
                  title: "Hyperlocal Network",
                  description:
                    "Order from home chefs within your neighborhood. Fresher food, faster delivery.",
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  icon: ShieldCheck,
                  title: "Verified Kitchens",
                  description:
                    "Every provider is verified for hygiene and quality. Your safety is our priority.",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: Heart,
                  title: "Made with Love",
                  description:
                    "Real home cooks preparing meals just like family. Taste the difference.",
                  gradient: "from-pink-500 to-rose-500",
                },
                {
                  icon: Clock,
                  title: "Flexible Subscriptions",
                  description:
                    "Daily, weekly, or monthly plans. Skip anytime. Complete flexibility.",
                  gradient: "from-purple-500 to-violet-500",
                },
                {
                  icon: Star,
                  title: "Trusted Reviews",
                  description:
                    "Genuine ratings from real customers. Know what you're ordering.",
                  gradient: "from-yellow-500 to-orange-500",
                },
                {
                  icon: UtensilsCrossed,
                  title: "Diverse Cuisines",
                  description:
                    "North Indian, South Indian, regional specialties. Endless variety.",
                  gradient: "from-green-500 to-emerald-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="feature-card group"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TRUST & SAFETY ========== */}
        <section id="safety" className="py-24 px-4 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
                  Trust & Safety
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Your Safety is Our
                  <br />
                  <span className="gradient-text-orange">Top Priority</span>
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Every meal on GharSe goes through strict quality checks. We
                  verify every home chef and ensure the highest standards of
                  hygiene.
                </p>

                <div className="space-y-4">
                  {[
                    "Background verified home chefs",
                    "Regular kitchen hygiene audits",
                    "Fresh ingredients with quality check",
                    "Contactless delivery options",
                    "Real-time order tracking",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Image/Illustration */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl blur-3xl opacity-20" />
                  <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border border-orange-100">
                    <Image
                      src="/auth-customer.png"
                      alt="GharSe Trust"
                      width={500}
                      height={500}
                      className="rounded-2xl shadow-xl"
                    />
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 shadow-xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">100% Verified</p>
                      <p className="text-sm text-gray-500">Home Kitchens</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section className="py-24 px-4 lg:px-8 bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Ready to Taste Home?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of happy customers enjoying fresh, homemade
                meals every day. Start your GharSe journey today!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login?role=customer">
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Order Now
                  </Button>
                </Link>
                <Link href="/login?role=provider">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-semibold transition-all hover:-translate-y-1"
                  >
                    <ChefHat className="w-5 h-5 mr-2" />
                    Become a Provider
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-16 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="GharSe"
                  width={72}
                  height={72}
                  className="h-14 w-auto"
                />
              </div>
              <p className="text-gray-400 max-w-md">
                Connecting hungry Indians with trusted home chefs. Fresh,
                hygienic, homemade meals delivered to your doorstep.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GharSe. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" />{" "}
              for hungry Indians
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
