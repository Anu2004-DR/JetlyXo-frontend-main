"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";

type Booking = {
  id: number;
  bookingType: string;
  totalPrice: number;
  status: string;
  from?: string;
  to?: string;
};

type Recommendation = {
  id: number;
  from: string;
  to: string;
  price: number;
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  /* 🔐 AUTH + FETCH BOOKINGS */
  useEffect(() => {
    //const token = localStorage.getItem("jetly_token");
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const loadBookings = async () => {
      try {
        const res = await apiClient.get("/api/bookings/history");
        setBookings(res.data);

        /* 🔥 CALL RECOMMENDATION API */
        const routes = res.data
          .filter((b: any) => b.from && b.to)
          .map((b: any) => ({
            from: b.from,
            to: b.to,
          }));

        if (routes.length > 0) {
          const recRes = await apiClient.post("/api/recommendations", {
            routes,
          });

          setRecommendations(recRes.data);
        }

      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [router]);

  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No bookings yet
        </p>
      )}

      {/* BOOKINGS */}
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-xl mb-4 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">Booking ID: {b.id}</p>
            <p className="text-gray-400">Type: {b.bookingType}</p>

            <p
              className={
                b.status === "CONFIRMED"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {b.status}
            </p>
          </div>

          <div className="text-right space-y-2">
            <p className="font-bold">₹{b.totalPrice}</p>

            <button
              onClick={() =>
                router.push(`/ticket?bookingId=${b.id}`)
              }
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              View Ticket
            </button>
          </div>
        </div>
      ))}

      {/* 🔥 RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <>
          <h2 className="text-2xl mt-10 mb-4">
            ✨ Recommended Trips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((r) => (
              <div
                key={r.id}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-xl shadow-lg"
              >
                <p className="font-semibold text-lg">
                  {r.from} → {r.to}
                </p>

                <p className="text-sm text-gray-200">
                  Starting from
                </p>

                <p className="text-xl font-bold">
                  ₹{r.price}
                </p>

                <button
                  onClick={() =>
                    router.push(`/search?from=${r.from}&to=${r.to}`)
                  }
                  className="mt-3 bg-white text-black px-3 py-1 rounded hover:bg-gray-200"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}