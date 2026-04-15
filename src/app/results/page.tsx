"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchFlights, searchBuses, searchTrains } from "@/lib/api";

function ResultsPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const type = (params.get("type") as "flight" | "bus" | "train") || "flight";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let data: any[] = [];

      if (type === "flight") {
        data = await searchFlights({ from, to });
      }

      if (type === "bus") {
        data = await searchBuses({ from, to });
      }

      if (type === "train") {
        data = await searchTrains({ from, to });
      }

      setResults(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    load();
  }, [type, from, to]);

  const handleBookNow = (item: any) => {
    if (type === "flight") {
      router.push(
        `/flight-passenger?flightId=${item.id}&price=${item.price || 0}&airline=${encodeURIComponent(item.airline || item.name || "Flight")}&duration=${encodeURIComponent(item.duration || "")}`
      );
      return;
    }

    if (type === "bus") {
      router.push(
        `/bus-passenger?busId=${item.id}&price=${item.price || 0}&operator=${encodeURIComponent(item.busName || item.operator || "Bus")}&duration=${encodeURIComponent(item.duration || item.departure || "")}`
      );
      return;
    }

    router.push(
      `/train-passenger?trainId=${item.id}&price=${item.price || 0}&trainName=${encodeURIComponent(item.trainName || item.name || "Train")}&duration=${encodeURIComponent(item.duration || item.departure || "")}`
    );
  };

  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl mb-6">
        {type.toUpperCase()} Results: {from} to {to}
      </h1>

      {results.length === 0 && <p className="text-gray-400">No results found</p>}

      {results.map((result, index) => (
        <div
          key={result.id || index}
          className="bg-white/10 p-4 rounded-xl mb-3 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">
              {type === "flight" && (result.airline || result.name)}
              {type === "bus" && (result.busName || result.operator)}
              {type === "train" && (result.trainName || result.name)}
            </p>

            <p className="text-xs sm:text-sm text-gray-300 text-center">
              {result.fromCity || result.from || from} to {result.toCity || result.to || to}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold">INR {result.price}</p>

            <button
              className="bg-green-500 px-3 py-1 rounded mt-1"
              onClick={() => handleBookNow(result)}
            >
              Book Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
