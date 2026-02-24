import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { GoogleAuthProvider } from "@/context/GoogleAuthContext";
import { CartProvider } from "@/context/CartContext";
import FloatingOrderTracker from "@/components/FloatingOrderTracker";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GharSe - Homemade Food Delivery",
  description: "Connect with trusted home chefs in your neighborhood. Fresh, hygienic, homemade meals delivered to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <GoogleAuthProvider>
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                {children}
                <FloatingOrderTracker />
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
