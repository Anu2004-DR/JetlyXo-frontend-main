"use client";

import { useState } from "react";
import { searchFlights } from "@/lib/api";

export default function FlightsPage() {
  const [from, setFrom] = useState("BLR");
  const [to, setTo] = useState("DEL");
  const [date, setDate] = useState("2026-05-01");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);

      const data = await searchFlights({ from, to, date });

      console.log("FLIGHTS:", data);
      setResults(data);

    } catch (e) {
      console.error(e);
      alert("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Search Flights</h1>

      <div className="flex gap-3 mb-4">
        <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From (BLR)" />
        <input value={to} onChange={e => setTo(e.target.value)} placeholder="To (DEL)" />
        <input value={date} onChange={e => setDate(e.target.value)} type="date" />

        <button onClick={handleSearch} className="bg-blue-500 px-4 py-2">
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {results.map(f => (
        <div key={f.id} className="border p-3 mb-2">
          <p>{f.airline}</p>
          <p>{f.from} → {f.to}</p>
          <p>{new Date(f.departure).toLocaleString()}</p>
          <p>₹{f.price}</p>

          <button
            className="bg-green-500 px-3 py-1 mt-2"
            onClick={() => handleBook(f)}
          >
            Book
          </button>
        </div>
      ))}
    </div>
  );

  async function handleBook(f: any) {
    // 👉 send selected flight to booking API
    await apiClient.post("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingType: "FLIGHT",
        flightId: null, // external → no DB id
        passengerName: "Test User",
        passengerAge: 22,
        passengerPhone: "9999999999",
        passengerEmail: "test@mail.com",
        totalPrice: f.price,

        // 🔥 IMPORTANT: store snapshot
        flight: f
      }),
    });

    alert("Booking created");
  }
}