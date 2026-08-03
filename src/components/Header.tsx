"use client";

import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  User,
  LogOut,
  Ticket,
  ChevronDown,
} from "lucide-react";


import { getToken, getUser, logout } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);


  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const currentUser = getUser();

      setLoggedIn(!!token);
      setUser(currentUser);

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      setLoggedIn(!!getToken());
      setUser(getUser());
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);


  const handleLogin = () => {
    router.push("/login");
  };

  const handleBookings = () => {
    if (!getToken()) {
      localStorage.setItem(
        "redirectAfterLogin",
        "/my-bookings"
      );
      router.push("/login");
      return;
    }

    router.push("/my-bookings");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleLogout = () => {
    logout();

    setLoggedIn(false);
    setUser(null);

    router.push("/");
    router.refresh();
  };

  const navClass = (active: boolean) =>
    `text-sm transition ${
      active
        ? "text-white"
        : "text-white/70 hover:text-white"
    }`;

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 18,
      }}
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur"
    >
      <div className="max-w-7xl mx-auto h-16 px-5 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-bold text-white"
          >
            JetlyXO <span className="text-blue-500">✈️</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={navClass(pathname === "/")}
            >
              Home
            </Link>

            <Link
              href="/results"
              className={navClass(
                pathname.startsWith("/results")
              )}
            >
              Search Trips
            </Link>

            {loggedIn && (
              <button
                onClick={handleBookings}
                className={navClass(
                  pathname.startsWith("/my-bookings")
                )}
              >
                My Bookings
              </button>
            )}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {!loggedIn ? (
            <>
              <button
                onClick={handleLogin}
                className="px-4 py-2 rounded-xl border border-white/15 text-sm text-white hover:bg-white/10"
              >
                Login
              </button>

              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-blue-600 text-sm text-white hover:bg-blue-700"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={handleProfile}
                className="hidden md:block text-sm text-white/80 hover:text-white"
              >
                Hi, {user?.name || "User"}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-600 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const navItem = (href: string, label: string) => {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname.startsWith(href);

    return (
      <Link
        href={href}
        className="relative px-1 py-2 text-sm font-medium"
      >
        <span
          className={`transition ${
            active
              ? "text-white"
              : "text-white/70 hover:text-white"
          }`}
        >
          {label}
        </span>

        {active && (
          <motion.div
            layoutId="navIndicator"
            className="absolute left-0 right-0 -bottom-4 h-[3px] rounded-full bg-blue-500"
          />
        )}
      </Link>
    );
  };

  const initials =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <motion.header
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.5,
      }}
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <motion.div
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="flex items-center gap-8"
        >
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            JetlyXO{" "}
            <span className="text-blue-500">✈️</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItem("/", "Home")}
            {navItem("/results", "Search Trips")}

            {loggedIn && (
              <button
                onClick={() => router.push("/my-bookings")}
                className={`relative text-sm font-medium ${
                  pathname.startsWith("/my-bookings")
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                My Bookings

                {pathname.startsWith("/my-bookings") && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute left-0 right-0 -bottom-4 h-[3px] rounded-full bg-blue-500"
                  />
                )}
              </button>
            )}
          </nav>
        </motion.div>

        {/* Right */}

        {!loggedIn ? (
          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/login")}
              className="rounded-xl border border-white/10 px-5 py-2 text-white transition hover:bg-white/10"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
            >
              Signup
            </button>

          </div>
        ) : (
          <div
            ref={dropdownRef}
            className="relative"
          >
            <motion.button
              whileHover={{
                scale: 1.04,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg"
            >
              {/* Avatar */}

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-white shadow-lg">
                {initials}
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-white">
                  {user?.name}
                </p>

                <p className="text-xs text-white/50">
                  View Profile
                </p>
              </div>

              <ChevronDown
                className={`transition ${
                  open ? "rotate-180" : ""
                }`}
                size={18}
              />
            </motion.button>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                  className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push("/profile");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-white transition hover:bg-white/10"
                  >
                    <User size={18} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
                      router.push("/my-bookings");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-white transition hover:bg-white/10"
                  >
                    <Ticket size={18} />
                    My Bookings
                  </button>

                  <div className="border-t border-white/10" />

                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-3 px-5 py-4 text-red-400 transition hover:bg-red-500/10"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </motion.header>
  );
}