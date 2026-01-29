import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocationProvider } from "@/context/LocationContext";
import { GoogleAuthProvider } from "@/context/GoogleAuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <GoogleAuthProvider>
          <AuthProvider>
            <LocationProvider>
              {children}
            </LocationProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
