"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { fareQuote } from "@/lib/api";
import { getToken } from "@/lib/auth";

function FlightPassengerPageContent() {
  const router = useRouter();
  
  const params = useSearchParams();

  const flightId = params.get("flightId") ?? "";
const searchId = params.get("searchId") ?? "";
const tId = params.get("tId") ?? "";
  

  const airline = params.get("airline") || "Flight";
  const duration = params.get("duration") || "";
  const price = params.get("price") || "0";

  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Ms");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    try {
      setLoading(true);
  
      const token = getToken();
  
      if (!token) {
        alert("Please login first");
        router.push("/login");
        return;
      }
  
      // your validations...
  
      let did = "";
      const quote = await fareQuote({
        id: flightId,
        searchId,
        tId,
      });
      
      console.log("QUOTE JSON");
console.log(JSON.stringify(quote, null, 2));

console.log("dId =", quote.dId);

did = quote.dId;
      
      
      did = quote.data?.dId;
      
      if (!did) {
        console.error("dId Missing", quote);
        alert("Booking Detail ID (dId) not received.");
        return;
      }
  
      console.log("Booking Detail ID:", did);
  
      router.push(
        `/flight-seat?did=${encodeURIComponent(did)}` +
          `&flightId=${encodeURIComponent(flightId)}` +
          `&searchId=${encodeURIComponent(searchId)}` +
          `&tId=${encodeURIComponent(tId)}` +
          `&price=${encodeURIComponent(price)}` +
          `&airline=${encodeURIComponent(airline)}` +
          `&duration=${encodeURIComponent(duration)}` +
          `&firstName=${encodeURIComponent(firstName)}` +
          `&lastName=${encodeURIComponent(lastName)}` +
          `&age=${encodeURIComponent(age)}` +
          `&phone=${encodeURIComponent(phone)}` +
          `&email=${encodeURIComponent(email)}` +
          `&title=${encodeURIComponent(title)}` +
          `&dob=${encodeURIComponent(dob)}` +
          `&pan=${encodeURIComponent(pan)}`
      );
    } catch (err: any) {
      console.error(err);
  
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-96 space-y-4">

        <h1 className="text-2xl font-bold text-center">
          Flight Passenger Details
        </h1>

        <p>
          Airline:
          <span className="font-semibold ml-2">
            {airline}
          </span>
        </p>

        <p>
          Duration:
          <span className="font-semibold ml-2">
            {duration}
          </span>
        </p>

        <p>
          Price:
          <span className="font-semibold ml-2">
            ₹{price}
          </span>
        </p>
        <select
  className="w-full p-2 rounded bg-slate-700"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
>
  <option value="Mr">Mr</option>
  <option value="Ms">Ms</option>
  <option value="Mrs">Mrs</option>
</select>
<input
  className="w-full p-2 rounded bg-slate-700"
  placeholder="First Name"
  value={firstName}
  onChange={(e) => setFirstName(e.target.value)}
/>

<input
  className="w-full p-2 rounded bg-slate-700"
  placeholder="Last Name"
  value={lastName}
  onChange={(e) => setLastName(e.target.value)}
/>

<input
  type="date"
  className="w-full p-2 rounded bg-slate-700"
  value={dob}
  onChange={(e) => setDob(e.target.value)}
/>

        <input
          type="number"
          className="w-full p-2 rounded bg-slate-700"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-slate-700"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full p-2 rounded bg-slate-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

<input
  className="w-full p-2 rounded bg-slate-700"
  placeholder="PAN Card"
  value={pan}
  onChange={(e) => setPan(e.target.value.toUpperCase())}
/>

        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded disabled:opacity-50"
        >
          {loading
            ? "Verifying Fare..."
            : "Continue to Seat Selection"}
        </button>

      </div>
    </div>
  );
}

export default function FlightPassengerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          Loading...
        </div>
      }
    >
      <FlightPassengerPageContent />
    </Suspense>
  );
}