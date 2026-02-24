"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, useInView } from "framer-motion";

// ===== REVEAL ON SCROLL COMPONENT =====
function RevealOnScroll({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directionMap = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: directionMap[direction].y,
        x: directionMap[direction].x,
      }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: 0.8,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ===== IMAGE URLS FROM REFERENCE =====
const IMAGES = {
  thali:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDMx5fGHouoSrpouHm9L5EzdIqJl4ctUG_Z8Zn3Ccd5ArIkW64KwDCN-ZZHV4dFd8sLKKBO_cudQj1MFnp0LPpKjVJu3GXR2TyKmwdC1ZeRp7QBPGoj-WdQIN5B_AGQdPosXqMmJopvzx9gcpnnEUHjywC7Tt9PBNuoOtj1J3GeqSil7PAWYKbkmURYJuetbG7dSjVmNEGOE_ixvhIFklmFr3oIYGiCNg-2rmoAkH3S_qjMrqc3xRpR6Ui-nPRX9jvv9omTY2Jkj6I",
  samosa:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC5tx-PdMr3ftZbtEVUiU61qWASy7oHSxKB-XnF0USri6zuGG1CfQBn3qvolRzT-jy4tUZE3KBOeiovL9MlMIsdANmSgMhyigH6y1IaI9qjhUS6aSAW7PSuO9VDw4jvXNdwvoFa26D-rSZbN73mS3SFoUYRvaLMg5hSgexU3SDjY7o7_W9FILsTlNj-LPUuMSRr3wX6RBiCThrC9rpABPxYIICQavfT7NqH05W1jkhtoDiqNvgFG2Mymu73KxO2_Dq5cLK30A_U8Sw",
  curry:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC3sqVX6wtO0XKJL578mOuVFBYL87Hf5ARSA9OA5sbsoC9hfL-o2mvQJ0onlzgalwkFzmLqGcv1LBXw5gtqe6XdSaA48UZfVQ5wHZkexE1pyLZHVuJ02N8HkbR3rXWHLY-ZhhdsO9HaCyOFt59lpsVuwYaEm1A1ZETvtkLikup_UBzFETB5HE1cD-pQgiFHMDd-aC_NSm240StrU0U-nYhQj3xWmQi8w-bojCrVEHrGz6VnEMhV4rJ6UD6l2PIS8j8t7fIuIPbiEPo",
  starAnise:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCAq4w4f3Yslwy07-s6pjBzNH1oQD59dqiGnYNx-Ki32eDIWXhHgjAhSMdj3TVFnVJuiQ_aJtb7I6ctvxXRPwuPXeeJeFzf77htzEZcvzP8iJ-RP1Sbm3U3OxXTHNvDX7ckdFgWNKxpUSy5aiZonS3M1G47Zwno2x9ikpsMKcYYM-srkySiHbjUzi16luCJr2FhTvNGCPsuDqxEnD36Gp8UbDusjCwpBoA7D7GheTap6Uvp3Ufuue8zRWfc5NlBriXQjgPnJGzD6xU",
  cardamom:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCx47qg1LE-O5MX0FQLVNq6RHFPH2UyBZV68x8RsWch-ZK05hv4DaCBXHp4KF8mtvVf0DzfrGlOEgqhj6X0o90pRKa73gyzzcGnEnxadDKkfukxHWaHFqJwjNhRaCdWQGAqxzzFt_DdAmHqYJYvDwH_4oW-eHFESAQmrqKT7kedcZVD7tcv8eQTmD7u06lsHeghIDNmYJ-3UaeyAtTwpQ5NbqqdVhMzCqh6sAWVdMmrtKu23xcSgnq3Q1Kv2QtCealSS01jOIGn5AA",
  user1:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDnKP6X_9yRRbl_NGWpBQ_QqVebevX1d7BGJNM2ij9TVgSnmbS_xnWURbZDGN2Y1KNYb42AvPJI4ytq7TQBRTBcR8OERmGmINjow1CtnxEvqmw9xHc6g2dmv5d4WTRqLCU_lgFhKNvtGQh3QElXGXSltcIevlwrKuhcwuJhzHLR3AK79GnEYy_pdRSfv-NnBmatgzJO0wqXY4h4WQNrgpoksTh346PWreuySVK-YWKV4id9O7KMGya28GMquHKMzfSGpVbVy6EKWHc",
  user2:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCFAOuGtrnhui95sFURMCaYeNch-GdcPGwMlVpScRK3coghr0dw7BOMXBver_y99MwmGCy4XgYpDF9R_l3Bx90z2hJxqwvoAV7qSh9e4-SgMM-ym5q7Y57_8TEf3sSvFjvTKwB-EK8sPZuAG8LI9Mlup4kkC7lr0Frm8wlxbYtIg5fwKe3kjQmbFXP0_hTjlZUCN2i1vxx--Mdng_tF9g4v8XAZoFdH9f4uvTnrFczjGsm1Ns3nY8AycB9zWikcAzD3frduA14R-jg",
  user3:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAhsVFugWzMmhulJ5fioyv91iXUJHZPf3CWP26d61qSQbtFHRwJTvwMl-OyiWzLnUChkBKKkkZGNoktquPWcZsqkaaW-KtxHa-TuqMCzDgBpp_dQM7Rr-pPRUagioK0kFtEVy_v8vP3lKwDTG_wzYD4ZLhSx7Z3MtqiZoecgyRkge218SJootPJNVIW1h7gYnmBNGB4rUccDXmSpio8MsO2znRmyHBYvpzVX3eeGbUSwR_eTV_2o9Yg-eacOcOUUIRAAFYb5g8ZzC0",
};

// ===== FEATURES DATA =====
const features = [
  {
    icon: "local_dining",
    title: "Hyperlocal Network",
    desc: "We map the best home chefs in your specific neighbourhood. The freshest food travels less distance, arrives faster, and tastes fresher.",
    color: "from-orange-400 to-red-400",
    bg: "bg-gradient-to-br from-orange-50 to-red-50",
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    icon: "verified_user",
    title: "100% Verified Kitchens",
    desc: "Every kitchen passes a strict 30-point hygiene and quality assessment before going live on our platform.",
    color: "from-green-400 to-emerald-400",
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    iconBg: "bg-green-100 text-green-600",
    checklist: ["FSSAI Registered", "Daily Fresh Cooking", "Hygiene Certified"],
  },
  {
    icon: "calendar_month",
    title: "Flexible Plans",
    desc: "Daily orders or weekly subscriptions \u2014 your choice, your convenience. Skip, pause or cancel anytime with zero penalties.",
    color: "from-purple-400 to-violet-400",
    bg: "bg-gradient-to-br from-purple-50 to-violet-50",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    icon: "favorite",
    title: "Made with Love",
    desc: "Authentic home-cooked recipes passed down through generations. Every meal is a labor of love from our home chefs.",
    color: "from-pink-400 to-rose-400",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    iconBg: "bg-pink-100 text-pink-600",
  },
];

// ===== HOW IT WORKS DATA =====
const steps = [
  {
    number: "01",
    title: "Find Chefs",
    desc: "Enter your locality to discover verified home chefs and explore their authentic menus.",
    icon: "search",
  },
  {
    number: "02",
    title: "Subscribe",
    desc: "Choose daily orders or weekly meal plans that perfectly fit your lifestyle and taste.",
    icon: "calendar_month",
  },
  {
    number: "03",
    title: "Eat Happy",
    desc: "Sit back, relax, and enjoy fresh homemade food delivered right to your doorstep.",
    icon: "favorite",
  },
];

// ===== TESTIMONIALS DATA =====
const testimonials = [
  {
    name: "Priya Sharma",
    role: "Working Professional",
    text: "GharSe has been a lifesaver! The dal makhani from Aunty Meena\u2019s kitchen tastes exactly like my mom\u2019s cooking. I\u2019ve been a subscriber for 6 months now!",
    avatar: IMAGES.user1,
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "College Student",
    text: "As a student living away from home, GharSe is the closest thing to ghar ka khana. Affordable, hygienic, and absolutely delicious!",
    avatar: IMAGES.user2,
    rating: 5,
  },
  {
    name: "Anita Patel",
    role: "Home Chef on GharSe",
    text: "GharSe gave me the platform to share my passion for cooking. I now serve 50+ happy customers daily from my home kitchen!",
    avatar: IMAGES.user3,
    rating: 5,
  },
];

// ===== STATS DATA =====
const stats = [
  { value: "500+", label: "Home Chefs", icon: "chef_hat" },
  { value: "50K+", label: "Happy Customers", icon: "groups" },
  { value: "1M+", label: "Meals Delivered", icon: "takeout_dining" },
  { value: "4.8", label: "Average Rating", icon: "star" },
];

// ===== MAIN COMPONENT =====
export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <div className="min-h-screen bg-[#fffbf7] overflow-x-hidden">
      {/* ========== NAVIGATION ========== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-orange-100"
          : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 z-10">
              <Image
                src="/logo.png"
                alt="GharSe"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: "Features", href: "/#features" },
                { label: "Chefs", href: "/explore" },
                { label: "Menu", href: "/" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Reviews", href: "/#reviews" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-orange-500 ${scrolled ? "text-gray-600" : "text-gray-700"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3 z-10">
              <Link href="/login?role=customer" className="hidden sm:block">
                <button className="text-gray-700 font-semibold text-sm hover:text-orange-500 transition-colors px-4 py-2">
                  Login
                </button>
              </Link>
              <Link href="/login?role=provider">
                <button className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-glow hover:scale-105 transition-all active:scale-95 border-t border-white/30">
                  Get Started
                </button>
              </Link>
              {/* Mobile Toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="material-symbols-outlined text-2xl">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              {[
                { label: "Features", href: "/#features" },
                { label: "Chefs", href: "/explore" },
                { label: "Menu", href: "/" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Reviews", href: "/#reviews" },
              ].map(
                (item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-gray-700 font-semibold py-2 hover:text-orange-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link
                href="/login?role=customer"
                className="block text-orange-500 font-semibold py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-visible z-10">
        {/* Floating Spices Background */}
        <div className="absolute top-40 left-10 w-24 h-24 opacity-60 animate-float pointer-events-none z-0 hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Star Anise"
            className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply transition-transform duration-700 hover:rotate-180"
            src={IMAGES.starAnise}
          />
        </div>
        <div className="absolute bottom-40 right-[40%] w-20 h-20 opacity-50 animate-float-delayed pointer-events-none z-0 hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Cardamom"
            className="w-full h-full object-contain drop-shadow-2xl mix-blend-multiply transition-transform duration-700 hover:scale-125"
            src={IMAGES.cardamom}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center relative">
            {/* Text Content */}
            <div className="lg:w-1/2 z-20 text-center lg:text-left pt-10">
              <RevealOnScroll direction="right">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-orange-200 mb-8 transform hover:scale-105 transition-transform cursor-default hover:shadow-xl">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full relative z-10"></div>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wide text-gray-800">
                    Live Kitchens Near You
                  </span>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={200} direction="right">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[0.9] mb-8 tracking-tight drop-shadow-sm font-display selection:bg-orange-300 selection:text-white">
                  Ghar ka <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-gradient-x">
                    Khana,
                  </span>
                  <br />
                  <span className="relative inline-block">
                    Ab Door Nahi.
                    <svg
                      className="absolute -bottom-2 w-full h-4 text-orange-500"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 10"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="animate-dash"
                      ></path>
                    </svg>
                  </span>
                </h1>
              </RevealOnScroll>

              <RevealOnScroll delay={400} direction="right">
                <p
                  className="font-hand text-3xl text-orange-500 mb-8 transform -rotate-1 origin-bottom-left font-bold hover:rotate-0 transition-transform duration-300 cursor-help"
                  title='Translation: Son, have you eaten?'
                >
                  &ldquo;Beta, khaana kha liya?&rdquo;
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={600} direction="right">
                <p className="max-w-xl mx-auto lg:mx-0 text-xl text-gray-600 mb-12 leading-relaxed font-medium">
                  Connect with trusted home chefs. Fresh, hygienic, homely meals
                  delivered to your doorstep &mdash; authentic taste, zero
                  compromise.
                </p>
              </RevealOnScroll>

              <RevealOnScroll delay={800} direction="up">
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Link
                    href="/login?role=customer"
                    className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-glow flex items-center justify-center gap-3 transition-all hover:scale-105 hover:shadow-neon active:scale-95 group border-t border-white/30 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    <span className="material-symbols-outlined group-hover:animate-bounce relative z-10">
                      takeout_dining
                    </span>
                    <span className="relative z-10">Order Tiffin</span>
                  </Link>
                  <Link
                    href="/login?role=provider"
                    className="bg-white/50 backdrop-blur-md text-gray-900 border-2 border-white/50 px-10 py-5 rounded-2xl text-lg font-bold shadow-lg flex items-center justify-center gap-3 hover:bg-white hover:text-orange-500 transition-all hover:scale-105 active:scale-95 hover:border-orange-200"
                  >
                    <span className="material-symbols-outlined transition-transform group-hover:rotate-12">
                      chef_hat
                    </span>
                    Become a Provider
                  </Link>
                </div>
              </RevealOnScroll>

              {/* Social Proof */}
              <RevealOnScroll delay={1000} direction="up">
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8">
                  <div className="flex -space-x-4 hover:space-x-1 transition-all duration-500 p-2">
                    {[IMAGES.user1, IMAGES.user2, IMAGES.user3].map(
                      (src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          alt="User"
                          className="w-12 h-12 rounded-full border-4 border-white shadow-md object-cover transition-transform hover:scale-110 hover:z-10"
                          src={src}
                        />
                      )
                    )}
                    <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600 shadow-md">
                      +2k
                    </div>
                  </div>
                  <div className="text-left group cursor-default">
                    <div className="flex text-yellow-500 text-lg group-hover:scale-105 transition-transform">
                      {[1, 2, 3, 4].map((s) => (
                        <span
                          key={s}
                          className="material-symbols-outlined fill-current"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                      <span
                        className="material-symbols-outlined fill-current"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star_half
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-orange-500 transition-colors">
                      Happy Tummy Owners
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Hero Image / Spinning Thali */}
            <div className="lg:w-2/3 relative mt-20 lg:mt-0 lg:-mr-32 z-10 perspective-1000">
              <RevealOnScroll delay={200} direction="left" className="h-full">
                <div className="relative w-[110%] aspect-square -right-5 lg:-right-20 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-full blur-3xl transform scale-90 group-hover:scale-100 transition-transform duration-1000"></div>

                  {/* Spinning Thali */}
                  <div className="w-full h-full relative p-10 animate-spin-slow group-hover:pause-animation transition-all">
                    <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white/20 backdrop-blur-sm bg-black/5 transform transition-transform duration-700 group-hover:scale-105">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt="Indian Thali"
                        className="w-full h-full object-cover scale-110"
                        src={IMAGES.thali}
                      />
                    </div>
                  </div>

                  {/* Floating Samosa */}
                  <div
                    className="absolute top-[10%] -left-[10%] w-40 h-40 md:w-48 md:h-48 bg-white p-2 rounded-full shadow-2xl animate-bounce-slow hover:pause-animation hover:scale-110 transition-transform duration-300 cursor-pointer z-20"
                    style={{ animationDuration: "3s" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Samosa"
                      className="w-full h-full object-cover rounded-full border-4 border-orange-100 hover:rotate-3 transition-transform"
                      src={IMAGES.samosa}
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap transform hover:scale-110 transition-transform">
                      Hot Samosas
                    </div>
                  </div>

                  {/* Floating Curry */}
                  <div
                    className="absolute bottom-[20%] -right-[5%] w-32 h-32 md:w-40 md:h-40 bg-white p-2 rounded-full shadow-2xl animate-bounce-slow hover:pause-animation hover:scale-110 transition-transform duration-300 cursor-pointer z-20"
                    style={{ animationDuration: "4s" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Curry"
                      className="w-full h-full object-cover rounded-full border-4 border-green-100 hover:-rotate-3 transition-transform"
                      src={IMAGES.curry}
                    />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap transform hover:scale-110 transition-transform">
                      Paneer Special
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="py-16 bg-white border-y border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <RevealOnScroll key={stat.label} delay={index * 100}>
                <div className="text-center group cursor-default">
                  <span
                    className="material-symbols-outlined text-4xl text-orange-400 mb-3 block group-hover:scale-110 transition-transform"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {stat.icon}
                  </span>
                  <p className="text-4xl md:text-5xl font-black text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                    {stat.value}
                  </p>
                  <p className="text-gray-500 font-semibold">{stat.label}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION ========== */}
      <section id="features" className="py-24 bg-[#fffbf7] relative">
        {/* Decorative */}
        <div className="absolute top-20 right-20 w-16 h-16 opacity-40 animate-float pointer-events-none hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.cardamom} alt="" className="w-full h-full object-contain mix-blend-multiply" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Why Choose Us?
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 font-display">
                The{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 italic">
                  GharSe
                </span>{" "}
                Difference
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                We&apos;re not just another food delivery app. We connect you
                with real home cooks who pour love into every meal.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <RevealOnScroll key={feature.title} delay={index * 120}>
                <div
                  className={`${feature.bg} rounded-3xl p-7 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 group border border-white/50 h-full`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {feature.desc}
                  </p>
                  {feature.checklist && (
                    <ul className="space-y-2">
                      {feature.checklist.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span
                            className="material-symbols-outlined text-sm text-green-500"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          <span className="text-gray-700 font-medium">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-orange-50/30 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  How It Works
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 font-display">
                Bhook lagi hai?
              </h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Get your favorite homemade food in just 3 simple steps
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-28 left-[20%] right-[20%] h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 rounded-full" />

            {steps.map((step, index) => (
              <RevealOnScroll key={step.number} delay={index * 200}>
                <div className="relative text-center group cursor-pointer">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-6 shadow-glow group-hover:scale-110 transition-all duration-300 group-hover:shadow-neon">
                    <span
                      className="material-symbols-outlined text-3xl text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {step.icon}
                    </span>
                    <span className="absolute -top-2 -right-2 w-9 h-9 bg-gray-900 text-white text-sm font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-500 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 max-w-xs mx-auto leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HYGIENE SECTION ========== */}
      <section
        id="hygiene"
        className="py-24 bg-gradient-to-br from-[#0b3d2e] to-[#0a2e22] text-white relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 right-20 w-80 h-80 bg-green-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-teal-400 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <RevealOnScroll direction="right">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/10">
                  <span
                    className="material-symbols-outlined text-green-400 text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified_user
                  </span>
                  <span className="text-sm font-bold text-white/80">
                    Safe on Every Plate
                  </span>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={200} direction="right">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 font-display">
                  Hygiene is our
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                    Obsession.
                  </span>
                </h2>
              </RevealOnScroll>

              <RevealOnScroll delay={400} direction="right">
                <p className="text-lg text-green-100/60 mb-10 max-w-lg leading-relaxed">
                  We don&apos;t just promise hygiene &mdash; we enforce it. Every chef on
                  GharSe is vetted, certified, and regularly reviewed.
                </p>
              </RevealOnScroll>

              <div className="space-y-5">
                {[
                  {
                    label: "Kitchen Inspections",
                    desc: "Regular visits and hygiene scoring",
                    icon: "home_health",
                    color: "bg-green-500",
                  },
                  {
                    label: "FSSAI Certified",
                    desc: "All chefs carry valid food-safety licenses",
                    icon: "workspace_premium",
                    color: "bg-teal-500",
                  },
                  {
                    label: "Temperature Control",
                    desc: "Hot food stays hot, cold food stays cold",
                    icon: "thermostat",
                    color: "bg-emerald-500",
                  },
                  {
                    label: "Contactless Delivery",
                    desc: "Safe pickup and drop-off options",
                    icon: "contactless",
                    color: "bg-green-600",
                  },
                ].map((item, index) => (
                  <RevealOnScroll key={index} delay={500 + index * 150} direction="right">
                    <div className="flex items-start gap-4 group cursor-default">
                      <div
                        className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <span className="material-symbols-outlined text-white text-xl">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">
                          {item.label}
                        </p>
                        <p className="text-sm text-green-100/50">{item.desc}</p>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <RevealOnScroll direction="left" delay={300}>
              <div className="relative flex items-center justify-center">
                <div className="relative w-80 h-80 lg:w-[420px] lg:h-[420px]">
                  {/* Glow rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-green-400/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border border-green-400/10" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-green-400/10 to-teal-400/5 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-[#f0d9b5] to-[#e0c9a5] flex items-center justify-center shadow-2xl border-4 border-white/10"
                    >
                      <div className="text-center">
                        <span
                          className="material-symbols-outlined text-6xl text-[#0b3d2e] mb-2 block"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          chef_hat
                        </span>
                        <p className="text-[#0b3d2e] font-black text-sm tracking-wide">
                          VERIFIED CHEF
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Floating badges */}
                  <motion.div
                    className="absolute -bottom-4 right-4 bg-green-500 text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 border border-green-400"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    100% Safe
                  </motion.div>

                  <motion.div
                    className="absolute top-4 -left-4 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-lg flex items-center gap-2 border border-white/10"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                  >
                    <span
                      className="material-symbols-outlined text-green-400 text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      health_and_safety
                    </span>
                    FSSAI Certified
                  </motion.div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section id="reviews" className="py-24 bg-[#fffbf7] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 rounded-full mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Reviews
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-display">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Family</span> Says
              </h2>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <RevealOnScroll key={t.name} delay={index * 150}>
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group h-full">
                  {/* Stars */}
                  <div className="flex text-yellow-400 mb-4">
                    {Array(t.rating)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"
                    />
                    <div>
                      <p className="font-bold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-24 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-600 rounded-full blur-[100px]" />
        </div>

        {/* Floating spice */}
        <div className="absolute top-10 right-10 w-20 h-20 opacity-30 animate-float pointer-events-none hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.starAnise} alt="" className="w-full h-full object-contain brightness-200" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 font-display leading-tight">
              Ready to taste the <br />
              <span className="text-yellow-300">difference?</span>
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Stop scrolling, start eating. The best home-made food in your
              neighbourhood is just a click away.
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/login?role=customer"
                className="bg-white text-orange-600 px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group"
              >
                <span className="material-symbols-outlined group-hover:animate-bounce">
                  takeout_dining
                </span>
                Explore Now
              </Link>
              <Link
                href="/login?role=provider"
                className="border-2 border-white/40 text-white px-10 py-5 rounded-2xl text-lg font-bold flex items-center gap-3 hover:bg-white/10 hover:border-white/60 active:scale-95 transition-all backdrop-blur-sm"
              >
                <span className="material-symbols-outlined">chef_hat</span>
                Open Your Kitchen
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-16 bg-gray-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="GharSe"
                  width={40}
                  height={40}
                  className="h-10 w-auto brightness-200"
                />
              </Link>
              <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                Home-cooked magic delivered. India&apos;s most-loved home chef
                platform for authentic meals.
              </p>
              <div className="flex gap-3">
                {["Instagram", "Twitter", "Facebook"].map((social) => (
                  <button
                    key={social}
                    className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
                  >
                    {social.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Find Chefs", href: "/explore" },
                  { label: "Stories", href: "/stories" },
                  { label: "How It Works", href: "/how-it-works" },
                  { label: "Become a Chef", href: "/login?role=provider" },
                  { label: "Features", href: "#features" },
                  { label: "Safety", href: "#hygiene" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-orange-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Legal
              </h4>
              <ul className="space-y-2.5">
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Cookie Policy",
                  "FSSAI License",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-gray-400 text-sm hover:text-orange-400 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">
                Contact
              </h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="material-symbols-outlined text-base">mail</span>
                  support@gharse.com
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <span className="material-symbols-outlined text-base">phone</span>
                  +91 98765 43210
                </li>
              </ul>
              <div className="mt-6 space-y-2">
                <button className="w-full px-4 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 border border-white/5">
                  <span className="material-symbols-outlined text-white text-lg">
                    phone_iphone
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Download on the
                    </p>
                    <p className="text-sm font-semibold text-white leading-tight">
                      App Store
                    </p>
                  </div>
                </button>
                <button className="w-full px-4 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 border border-white/5">
                  <span className="material-symbols-outlined text-white text-lg">
                    play_arrow
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Get it on
                    </p>
                    <p className="text-sm font-semibold text-white leading-tight">
                      Google Play
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} GharSe Technologies Pvt Ltd. All
              rights reserved.
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Made with</span>
              <span className="text-red-500 text-lg">&hearts;</span>
              <span>in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
