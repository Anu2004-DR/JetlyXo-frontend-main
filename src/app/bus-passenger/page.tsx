"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { createBooking } from "@/lib/api"; 

export default function BusPassengerPage() {
  const params = useSearchParams();
  const router = useRouter();

  /* -------- PARAMS -------- */

  const busId = params.get("busId");
  const operator = params.get("operator") || "Bus";
  const duration = params.get("duration") || "";
  const price = params.get("price") || "0";

  /* -------- STATE -------- */

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  /* -------- CONTINUE -------- */

  

async function handleContinue() {
  if (!busId) {
    alert("Bus info missing");
    return;
  }

  if (!name || !age || !phone || !email) {
    alert("Please fill all details");
    return;
  }

  try {

    const payload = {
      bookingType: "BUS",
      entityId: Number(busId), // ✅ FIXED

      passengerName: name,
      passengerAge: Number(age),
      passengerPhone: phone,
      passengerEmail: email
    };

    console.log("BOOKING PAYLOAD:", payload); // 🔍 debug

    const res = await createBooking(payload);

    const bookingId = res?.booking?.id; // ✅ FIXED

    if (!bookingId) {
      alert("Booking failed");
      return;
    }

    router.push(`/payment?bookingId=${bookingId}`);

  } catch (err: any) {
    console.error(err);
    alert(err?.message || "Error creating booking");
  }
}
  /* -------- UI -------- */

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">

      <div className="bg-slate-800 p-8 rounded-xl w-96 space-y-4 shadow-lg">

        <h1 className="text-2xl font-bold text-center">
          🚌 Bus Passenger Details
        </h1>

        <p>
          Operator: <span className="font-semibold">{operator}</span>
        </p>

        <p>
          Duration: <span className="font-semibold">{duration}</span>
        </p>

        <p>
          Price: <span className="font-semibold">₹{price}</span>
        </p>

        <input
          placeholder="Full Name"
          className="w-full p-2 rounded bg-slate-700"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          className="w-full p-2 rounded bg-slate-700"
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          placeholder="Phone Number"
          className="w-full p-2 rounded bg-slate-700"
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          placeholder="Email"
          className="w-full p-2 rounded bg-slate-700"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleContinue}
          className="w-full bg-green-600 py-2 rounded hover:bg-green-700"
        >
          Continue to Payment
        </button>

      </div>
    </div>
  );
}