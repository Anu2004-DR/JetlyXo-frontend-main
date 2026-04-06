"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  "Cheapest",
  "Fastest",
  "Best",
  "Departure Time",
  "Airline",
] as const;

/* -------- NORMALIZE FLIGHT DATA -------- */

function normalizeFlight(f: any, index: number) {
  return {
    id: typeof f?.id === "number" ? f.id : index + 1,
    airline: f?.airline ?? "Unknown Airline",
    priceNumber: typeof f?.price === "number" ? f.price : 0,
    priceDisplay:
      typeof f?.price === "number"
        ? `₹${f.price.toLocaleString("en-IN")}`
        : "—",
    duration: f?.duration ?? "—",
    stops: f?.stops ?? "Non-stop",
    dep: f?.dep ?? "--:--",

    seats:
      typeof f?.seats === "number"
        ? f.seats
        : typeof f?.seats === "string"
        ? parseInt(f.seats)
        : null,
  };
}

/* -------- BOOK BUTTON -------- */

function BookNowButton({
  priceNumber,
  airline,
  duration,
  flightId,
}: {
  priceNumber: number;
  airline: string;
  duration: string;
  flightId: number;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!flightId) {
      alert("Flight ID missing");
      return;
    }

    const token = localStorage.getItem("jetly_token");

    if (!token) {
      localStorage.setItem(
        "redirectAfterLogin",
        JSON.stringify({
          action: "flightPassenger",
          data: { flightId, priceNumber, airline, duration },
        })
      );

      router.push("/login");
      return;
    }

    router.push(
      `/flight-passenger?flightId=${flightId}&price=${priceNumber}&airline=${encodeURIComponent(
        airline
      )}&duration=${encodeURIComponent(duration)}`
    );
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Book Now
    </button>
  );
}

/* -------- MAIN COMPONENT -------- */

type FlightResultsProps = {
  flights: any[];
  from?: string;
  to?: string;
};

export default function FlightResults({
  flights,
  from = "Bangalore",
  to = "Delhi",
}: FlightResultsProps) {
  const [sortBy, setSortBy] =
    useState<(typeof SORT_OPTIONS)[number]>("Cheapest");

  const [flightList, setFlightList] = useState<any[]>(flights);

  /* sync props */
  useEffect(() => {
    setFlightList(flights);
  }, [flights]);

  /* -------- REFRESH SEATS -------- */

  async function refreshFlightSeats() {
    try {
      const res = await fetch(
        `http://localhost:5000/api/flights/search?from=${from}&to=${to}`
      );

      const data = await res.json();

      if (data?.flights) {
        setFlightList(data.flights);
      }
    } catch (err) {
      console.error("Seat refresh failed", err);
    }
  }

  useEffect(() => {
    const interval = setInterval(refreshFlightSeats, 5000);
    return () => clearInterval(interval);
  }, [from, to]);

  /* -------- NORMALIZE -------- */

  const normalized = useMemo(
    () => flightList.map((f, i) => normalizeFlight(f, i)),
    [flightList]
  );

  /* -------- SORT -------- */

  const filtered = useMemo(() => {
    const list = [...normalized];

    if (sortBy === "Cheapest") {
      list.sort((a, b) => a.priceNumber - b.priceNumber);
    }

    if (sortBy === "Fastest") {
      list.sort((a, b) => {
        const da = parseInt(a.duration.replace(/\D/g, ""), 10) || 0;
        const db = parseInt(b.duration.replace(/\D/g, ""), 10) || 0;
        return da - db;
      });
    }

    if (sortBy === "Airline") {
      list.sort((a, b) => a.airline.localeCompare(b.airline));
    }

    return list;
  }, [normalized, sortBy]);

  /* -------- UI -------- */

  return (
    <div id="results">
      {/* SORT */}
      <div className="flex gap-2 mb-6">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            className={`px-3 py-2 rounded-lg text-sm ${
              sortBy === opt
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="space-y-4">
        {filtered.map((flight, i) => (
          <motion.div
            key={flight.id}
            className="glass-card p-5 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <div>
              <p className="font-semibold text-white">
                {flight.airline}
              </p>

              <p className="text-sm text-white/60">
                {flight.duration} • {flight.stops}
              </p>

              <p className="text-sm text-white/50">
                Dep {flight.dep}
              </p>

              <p className="text-sm text-white/50">
                {flight.seats === 0
                  ? "Sold Out ❌"
                  : `Seats Available: ${flight.seats}`}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-xl font-bold text-white">
                {flight.priceDisplay}
              </p>

              <BookNowButton
                priceNumber={flight.priceNumber}
                airline={flight.airline}
                duration={flight.duration}
                flightId={flight.id}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}