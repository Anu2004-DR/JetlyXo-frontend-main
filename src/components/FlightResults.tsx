"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

/* ---------------- SORT OPTIONS ---------------- */

const SORT_OPTIONS = [
  "Cheapest",
  "Fastest",
  "Best",
  "Departure Time",
  "Airline",
] as const;

/* ---------------- TYPES ---------------- */

type RawFlight = {
  id?: number | string;
  airline?: string;
  price?: number | string;
  duration?: string;
  stops?: string;
  dep?: string;
  departure?: string;
  departureTime?: string;
  seats?: number | string;
};

type NormalizedFlight = {
  id: number;
  airline: string;
  priceNumber: number;
  priceDisplay: string;
  duration: string;
  stops: string;
  dep: string;
  seats: number | null;
};

/* ---------------- HELPERS ---------------- */

function parseDuration(duration: string) {
  if (!duration) return 999999;

  const hoursMatch = duration.match(/(\d+)h/);
  const minsMatch = duration.match(/(\d+)m/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const mins = minsMatch ? parseInt(minsMatch[1]) : 0;

  return hours * 60 + mins;
}

/* ---------------- NORMALIZE FLIGHT ---------------- */

function normalizeFlight(
  f: RawFlight,
  index: number
): NormalizedFlight {

  const price =
    typeof f?.price === "number"
      ? f.price
      : typeof f?.price === "string"
      ? Number(
          f.price.replace(/[₹,$,]/g, "")
        )
      : 0;

  const seats =
    typeof f?.seats === "number"
      ? f.seats
      : typeof f?.seats === "string"
      ? parseInt(f.seats)
      : null;

  return {
    id:
      typeof f?.id === "number"
        ? f.id
        : index + 1,

    airline:
      f?.airline || "Unknown Airline",

    priceNumber: price,

    priceDisplay:
      price > 0
        ? `₹${price.toLocaleString("en-IN")}`
        : "—",

    duration:
      f?.duration || "N/A",

    stops:
      f?.stops || "Non-stop",

    dep:
      f?.dep ||
      f?.departure ||
      f?.departureTime ||
      "--:--",

    seats,
  };
}



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

   
const token = getToken();

if (!token) {

  router.push(
    `/login?redirect=${encodeURIComponent(
      `/flight-passenger?flightId=${flightId}` +
        `&price=${priceNumber}` +
        `&airline=${encodeURIComponent(
          airline
        )}` +
        `&duration=${encodeURIComponent(
          duration
        )}`
    )}`
  );

  return;
}


    const url =
      `/flight-passenger?flightId=${flightId}` +
      `&price=${priceNumber}` +
      `&airline=${encodeURIComponent(
        airline
      )}` +
      `&duration=${encodeURIComponent(
        duration
      )}`;

    router.push(url);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg text-white font-medium"
    >
      Book Now
    </button>
  );
}



type FlightResultsProps = {
  flights: RawFlight[];
  from?: string;
  to?: string;
};

export default function FlightResults({
  flights,
  from = "BLR",
  to = "DEL",
}: FlightResultsProps) {

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const [sortBy, setSortBy] =
    useState<
      (typeof SORT_OPTIONS)[number]
    >("Cheapest");

  const [flightList, setFlightList] =
    useState<RawFlight[]>(flights);

  /* ---------------- SYNC PROPS ---------------- */

  useEffect(() => {
    setFlightList(flights);
  }, [flights]);

  /* ---------------- REFRESH FLIGHTS ---------------- */

  async function refreshFlightSeats() {

    try {

      const res = await fetch(
        `${API_BASE}/api/flights/search` +
          `?origin=${encodeURIComponent(from)}` +
          `&destination=${encodeURIComponent(to)}` +
          `&departureDate=2026-05-20`
      );

      if (!res.ok) {
        throw new Error(
          "Failed to fetch flights"
        );
      }

      const data = await res.json();

      if (Array.isArray(data?.data)) {
        setFlightList(data.data);
      }

    } catch (err) {

      console.error(
        "Seat refresh failed:",
        err
      );
    }
  }

  useEffect(() => {

    refreshFlightSeats();

    const interval =
      setInterval(
        refreshFlightSeats,
        10000
      );

    return () =>
      clearInterval(interval);

  }, [from, to]);

  

  const normalizedFlights =
    useMemo(() => {

      return flightList.map((f, i) =>
        normalizeFlight(f, i)
      );

    }, [flightList]);



  const sortedFlights =
    useMemo(() => {

      const list = [
        ...normalizedFlights,
      ];

      switch (sortBy) {

        case "Cheapest":
          list.sort(
            (a, b) =>
              a.priceNumber -
              b.priceNumber
          );
          break;

        case "Fastest":
          list.sort(
            (a, b) =>
              parseDuration(
                a.duration
              ) -
              parseDuration(
                b.duration
              )
          );
          break;

        case "Airline":
          list.sort((a, b) =>
            a.airline.localeCompare(
              b.airline
            )
          );
          break;

        case "Departure Time":
          list.sort((a, b) =>
            a.dep.localeCompare(
              b.dep
            )
          );
          break;

        case "Best":
        default:
          break;
      }

      return list;

    }, [normalizedFlights, sortBy]);

  if (!sortedFlights.length) {

    return (
      <div className="text-center py-10 text-white">
        No flights found.
      </div>
    );
  }


  return (
    <div id="results">

      {/* SORT OPTIONS */}

      <div className="flex flex-wrap gap-2 mb-6">

        {SORT_OPTIONS.map((opt) => (

          <button
            key={opt}
            type="button"
            onClick={() =>
              setSortBy(opt)
            }
            className={`px-3 py-2 rounded-lg text-sm transition ${
              sortBy === opt
                ? "bg-blue-600 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* FLIGHT CARDS */}

      <div className="space-y-4">

        {sortedFlights.map(
          (flight, i) => (

            <motion.div
              key={flight.id}
              className="glass-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
            >

              {/* LEFT */}

              <div>

                <p className="font-semibold text-white text-lg">
                  {flight.airline}
                </p>

                <p className="text-sm text-white/70">
                  {flight.duration} •{" "}
                  {flight.stops}
                </p>

                <p className="text-sm text-white/50">
                  Departure:{" "}
                  {flight.dep}
                </p>

                <p className="text-sm text-white/50 mt-1">
                  {flight.seats ===
                  0
                    ? "Sold Out ❌"
                    : `Seats Available: ${
                        flight.seats ??
                        "N/A"
                      }`}
                </p>
              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-4">

                <p className="text-2xl font-bold text-white">
                  {
                    flight.priceDisplay
                  }
                </p>

                <BookNowButton
                  priceNumber={
                    flight.priceNumber
                  }
                  airline={
                    flight.airline
                  }
                  duration={
                    flight.duration
                  }
                  flightId={flight.id}
                />
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}