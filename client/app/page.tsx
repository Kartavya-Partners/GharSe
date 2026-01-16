"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat, ShoppingBag, UtensilsCrossed, ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white flex flex-col">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 p-2 rounded-xl">
            <UtensilsCrossed className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
            GharSe
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
          <Link href="#features" className="hover:text-orange-600">How it works</Link>
          <Link href="#safety" className="hover:text-orange-600">Safety</Link>
          <Link href="#contact" className="hover:text-orange-600">Contact</Link>
        </nav>
        <Link href="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 pt-20 pb-24 text-center max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900"
          >
            Ghar ka Khana,<br />
            <span className="text-orange-600">Ab Door Nahi.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto"
          >
            GharSe connects busy Indians with trusted home tiffin providers in their neighborhood. Fresh, hygienic meals delivered daily — just like home.
          </motion.p>

          {/* CTA Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Customer */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-orange-500" />
              <div className="mx-auto mb-6 bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Order Tiffin</h3>
              <p className="text-gray-500 mt-2 mb-6">Find nearby homemade tiffins and subscribe for daily meals.</p>
              <Link href="/login?role=customer">
                <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700">
                  Continue as Customer <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Provider */}
            <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-3xl shadow-xl border border-green-100 p-8 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-green-500" />
              <div className="mx-auto mb-6 bg-green-100 w-16 h-16 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Become a Provider</h3>
              <p className="text-gray-500 mt-2 mb-6">Sell homemade food, manage orders, and earn from your kitchen.</p>
              <Link href="/login?role=provider">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Join as Provider <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20 bg-orange-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
            <div className="bg-white rounded-2xl p-8 shadow">
              <MapPin className="mx-auto text-orange-600 w-8 h-8 mb-4" />
              <h4 className="font-semibold text-lg">Hyperlocal</h4>
              <p className="text-gray-500 mt-2">Order from trusted cooks in your own neighborhood.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow">
              <ShieldCheck className="mx-auto text-orange-600 w-8 h-8 mb-4" />
              <h4 className="font-semibold text-lg">Safe & Hygienic</h4>
              <p className="text-gray-500 mt-2">Verified providers and quality-focused kitchens.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow">
              <UtensilsCrossed className="mx-auto text-orange-600 w-8 h-8 mb-4" />
              <h4 className="font-semibold text-lg">Homely Taste</h4>
              <p className="text-gray-500 mt-2">Food that reminds you of home, every single day.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-600 bg-white border-t">
        © {new Date().getFullYear()} GharSe. Built with ❤️ for hungry Indians.
      </footer>
    </div>
  );
}
