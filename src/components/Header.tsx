"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, getUser, logout } from "@/lib/auth";

export default function Header() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const currentUser = getUser();

      setLoggedIn(!!token);
      setUser(currentUser);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogin = () => {
    router.push("/login");
  };

  const handleBookings = () => {
    if (!getToken()) {
      localStorage.setItem("redirectAfterLogin", "/my-booking");
      router.push("/login");
    } else {
      router.push("/my-booking");
    }
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUser(null);

    router.push("/");
    router.refresh();
  };

  return (
    <motion.header
      className="sticky top-0 z-30 glass border-b border-white/5"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-white"
        >
          JetlyXO <span className="text-jetly-accent">✈️</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="#search"
            className="text-white/80 hover:text-white text-sm"
          >
            Flights
          </Link>

          <button
            onClick={handleBookings}
            className="text-white/80 hover:text-white text-sm"
          >
            My Bookings
          </button>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <Link
            href="#search"
            className="px-4 py-2 rounded-xl bg-jetly-accent text-white text-sm"
          >
            Search Flights
          </Link>

          {!loggedIn ? (
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-xl border border-white/20 text-white text-sm"
            >
              Login
            </button>
          ) : (
            <div className="flex items-center gap-3">

              <span className="text-sm text-white/90 max-w-[140px] truncate">
                Hi, {user?.name || user?.email || "User"}
              </span>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm"
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