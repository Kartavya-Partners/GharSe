"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-[#2C1810] text-white">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">G</span>
                            </div>
                            <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                                GharSe
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting hungry Indians with trusted home chefs. Fresh, hygienic, homemade meals delivered to your doorstep.
                        </p>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Company
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/how-it-works" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/explore" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                                    Menu
                                </Link>
                            </li>
                            <li>
                                <Link href="/stories" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                                    Stories
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Chefs */}
                    <div>
                        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            For Chefs
                        </h3>
                        <ul className="space-y-3">
                            {["Partner with us", "Chef Guidelines", "Safety Standards"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:help@gharse.in"
                                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                >
                                    help@gharse.in
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+919876543210"
                                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                                >
                                    +91 98765 43210
                                </a>
                            </li>
                            <li className="flex items-center gap-3 pt-2">
                                {/* Social Icons */}
                                {[
                                    { label: "Facebook", icon: "F" },
                                    { label: "Instagram", icon: "IG" },
                                    { label: "Twitter", icon: "TW" },
                                ].map((social) => (
                                    <a
                                        key={social.label}
                                        href="#"
                                        className="w-9 h-9 bg-white/10 hover:bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                                        title={social.label}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        2026 GharSe. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
