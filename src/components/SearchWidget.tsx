"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { searchFlights, type FlightSearchParams, type FlightResult } from "@/lib/api";

type Tab = "one-way" | "round-trip" | "multi-city";

const TABS: { id: Tab; label: string }[] = [
  { id: "one-way", label: "One Way" },
  { id: "round-trip", label: "Round Trip" },
  { id: "multi-city", label: "Multi City" },
];

type SearchWidgetProps = {
  onFlightResults: (results: FlightResult[]) => void;
  onScrollToResults?: () => void;
};

export default function SearchWidget({ onFlightResults, onScrollToResults }: SearchWidgetProps) {
  const [activeTab, setActiveTab] = useState<Tab>("one-way");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travellers, setTravellers] = useState(1);
  const [cabin, setCabin] = useState("economy");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const params: FlightSearchParams = {
        from: from || undefined,
        to: to || undefined,
        departure: departure || undefined,
        return: activeTab !== "one-way" ? returnDate || undefined : undefined,
        travellers,
        cabin,
      };

      let results = await searchFlights(params);

      // If API returns nothing → show demo flights
      if (!results || results.length === 0) {
        results = [
          {
            airline: "IndiGo",
            price: 5980,
            duration: "5h 20m",
            stops: "1 stop",
            dep: "06:30",
          },
          {
            airline: "Vistara",
            price: 7200,
            duration: "2h 45m",
            stops: "Direct",
            dep: "08:10",
          },
          {
            airline: "Air India",
            price: 6450,
            duration: "3h 10m",
            stops: "Direct",
            dep: "10:15",
          },
        ];
      }

      onFlightResults(results);
      onScrollToResults?.();

    } catch (err) {

      // If API fails → use demo flights
      const demoFlights: FlightResult[] = [
        {
          airline: "IndiGo",
          price: 5980,
          duration: "5h 20m",
          stops: "1 stop",
          dep: "06:30",
        },
        {
          airline: "Vistara",
          price: 7200,
          duration: "2h 45m",
          stops: "Direct",
          dep: "08:10",
        },
        {
          airline: "Air India",
          price: 6450,
          duration: "3h 10m",
          stops: "Direct",
          dep: "10:15",
        },
      ];

      onFlightResults(demoFlights);
      onScrollToResults?.();
      setError(null);

    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="search" className="py-8 md:py-12 px-4 scroll-mt-20">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          className="glass-card p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-jetly-accent text-white shadow-glow"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form id="flight-search-form" onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
            
            <div>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">From</label>
              <input
                type="text"
                placeholder="City or airport"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">To</label>
              <input
                type="text"
                placeholder="City or airport"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">Departure</label>
              <input
                type="date"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              />
            </div>

            <div className={activeTab === "one-way" ? "hidden" : ""}>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">Return</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">Travellers</label>
              <select
                value={travellers}
                onChange={(e) => setTravellers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} className="bg-navy-800 text-white">
                    {n} {n === 1 ? "Traveller" : "Travellers"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-jetly-accent/90 mb-1">Cabin Class</label>
              <select
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-jetly-accent focus:ring-1 focus:ring-jetly-accent outline-none transition"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>

          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <motion.button
            type="submit"
            form="flight-search-form"
            disabled={loading}
            className="w-full mt-6 py-4 rounded-xl bg-jetly-accent hover:bg-jetly-accent/90 disabled:opacity-60 text-white font-semibold text-lg shadow-glow flex items-center justify-center gap-2"
          >
            {loading ? "Searching..." : "Search Flights"}
          </motion.button>

        </motion.div>
      </div>
    </section>
  );
}