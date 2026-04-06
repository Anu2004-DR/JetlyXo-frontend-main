import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // ✅ IMPORTANT
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

<Script src="https://checkout.razorpay.com/v1/checkout.js" />
export const metadata: Metadata = {
  title: "JetlyXO – Plan Your Perfect Journey | Flights, Hotels & Trains",
  description:
    "Book flights, hotels and trains instantly with AI. Find the cheapest flights, best hotels, and travel deals with JetlyXO",
  keywords:
    "travel, flights, hotels, trains, AI booking, cheap flights, JetlyXO",
  openGraph: {
    title: "JetlyXO – Plan Your Perfect Journey",
    description: "Book flights, hotels and trains instantly with AI.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen`}>

        {/* ✅ Razorpay Script (GLOBAL LOAD) */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        {children}
      </body>
    </html>
  );
}

