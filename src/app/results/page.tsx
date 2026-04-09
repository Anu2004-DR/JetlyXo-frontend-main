"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  searchFlights,
  searchBuses,
  searchTrains
} from "@/lib/api";

export default function ResultsPage() {
  const params = useSearchParams();

  const type = params.get("type") as "flight" | "bus" | "train";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let data = [];

      if (type === "flight") {
        data = await searchFlights({ from, to });
      }

      if (type === "bus") {
        data = await searchBuses({ from, to });
      }

      if (type === "train") {
        data = await searchTrains({ from, to });
      }

      setResults(data);
      setLoading(false);
    };

    load();
  }, [type, from, to]);

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">

      <h1 className="text-2xl mb-6">
        {type.toUpperCase()} Results: {from} → {to}
      </h1>

      {results.length === 0 && (
        <p className="text-gray-400">No results found</p>
      )}

      {results.map((r, i) => (
        <div
          key={i}
          className="bg-white/10 p-4 rounded-xl mb-3 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {type === "flight" && r.airline}
              {type === "bus" && r.busName}
              {type === "train" && r.trainName}
            </p>

            <p className="text-xs sm:text-sm text-gray-300 text-center">
              {r.fromCity || from} → {r.toCity || to}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold">₹{r.price}</p>

            <button
              className="bg-green-500 px-3 py-1 rounded mt-1"
              onClick={() =>
                alert("Next: connect to booking + payment")
              }
            >
              Book Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}