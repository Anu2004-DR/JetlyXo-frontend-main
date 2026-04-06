"use client";

import { useEffect, useState } from "react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("http://localhost:5000/api/bookings/history");
    const data = await res.json();
    setPayments(data.bookings || []);
  }

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-bold text-white">
        💳 Payment History
      </h2>

      {payments.map((p) => (
        <div
          key={p.id}
          className="bg-slate-800 p-5 rounded-xl border border-white/10 flex justify-between items-center"
        >

          <div>
            <p className="text-white font-semibold">
              Payment #{p.id}
            </p>

            <p className="text-sm text-white/60">
              {p.bookingType} • {new Date(p.createdAt).toLocaleString()}
            </p>

            <p className="text-sm text-green-400">
              SUCCESS
            </p>
          </div>

          <p className="text-xl font-bold text-white">
            ₹{p.totalPrice}
          </p>

        </div>
      ))}
    </div>
  );
}