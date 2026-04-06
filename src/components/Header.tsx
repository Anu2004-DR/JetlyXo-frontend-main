"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("jetly_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    loadUser();

    // 🔥 listen for login/logout changes
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* ================= HANDLERS ================= */
  const handleLogin = () => {
    router.push("/login");
  };

  const handleBookings = () => {
    const token = localStorage.getItem("jetly_token");

    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/my-booking");
      router.push("/login");
    } else {
      router.push("/my-booking");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jetly_user");
    localStorage.removeItem("jetly_token");

    setUser(null);

    router.push("/");
  };

  /* ================= UI ================= */
  return (
    <motion.header
      className="sticky top-0 z-30 glass border-b border-white/5"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          JetlyXO <span className="text-jetly-accent">✈️</span>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#search" className="text-white/80 hover:text-white text-sm">Flights</Link>
          <Link href="#" className="text-white/80 hover:text-white text-sm">Hotels</Link>
          <Link href="#" className="text-white/80 hover:text-white text-sm">Trains</Link>
          <Link href="#" className="text-white/80 hover:text-white text-sm">Deals</Link>

          <button
            onClick={handleBookings}
            className="text-white/80 hover:text-white text-sm"
          >
            My Bookings
          </button>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <Link
            href="#search"
            className="px-4 py-2 rounded-xl bg-jetly-accent text-white text-sm"
          >
            Search Flights
          </Link>

          {!user ? (
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-xl border border-white/20 text-white text-sm"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/80">
                Hi, {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}