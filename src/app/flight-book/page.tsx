"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookFlight, retrieveBooking } from "@/lib/api";

function FlightBookPageContent() {
  const router = useRouter();
  const params = useSearchParams();

  const did = params.get("did") || "";

  const airline = params.get("airline") || "";
  const duration = params.get("duration") || "";
  const price = params.get("price") || "";

  const firstName = params.get("firstName") || "";
  const lastName = params.get("lastName") || "";

  const phone = params.get("phone") || "";
  const email = params.get("email") || "";

  const title = params.get("title") || "Ms";
  const dob = params.get("dob") || "";
  const pan = params.get("pan") || "";

  const seatCode = params.get("seatCode") || "";
  const seatNumber = params.get("seatNumber") || "";
  const seatPrice = params.get("seatPrice") || "0";

  const mealCode = params.get("mealCode") || "";
  const mealName = params.get("mealName") || "";
  const mealPrice = params.get("mealPrice") || "0";

  const [loading, setLoading] = useState(false);

  async function handleBooking() {
    try {
      setLoading(true);

      if (!firstName || lastName.trim().length < 2) {
        alert("Please enter a valid First Name and Last Name.");
        return;
      }

      const payload = {
        dId: did,

        pax: [
          {
            ttl: title,
            fn: firstName,
            ln: lastName,
            pxt: "Adult",

            dob: `${dob}T00:00:00`,

            pno: "",
            panc: pan,

            pexp: "",
            pcn: "IN",
            nat: "IN",

            ffair: "",
            ffno: "",
            fdocid: "",

            ssr: [
              ...(seatCode
                ? [
                    {
                      type: "SeatDynamic",
                      triptype: "Oneway",
                      code: seatCode,
                    },
                  ]
                : []),

              ...(mealCode
                ? [
                    {
                      type: "Meal",
                      triptype: "Oneway",
                      code: mealCode,
                    },
                  ]
                : []),
            ],
          },
        ],

        gstad: "",
        gstcno: "",
        gstcn: "",
        gstno: "",
        gste: "",
        isg: false,

        email,
        cno: phone,
        cc: "+91",
      };

      console.log("========== BOOK PAYLOAD ==========");
      console.log(payload);

      const result = await bookFlight(payload);

      if (!result.data?.status) {
        alert(result.data?.reason || "Booking Failed");
        return;
      }

      const bookingCode = result.data?.code;

      if (!bookingCode) {
        alert("Booking code not received.");
        return;
      }

      alert(
        `${result.data.reason}\n\nBooking Code: ${bookingCode}`
      );

      console.log("Booking Code:", bookingCode);

      try {
        const booking = await retrieveBooking(bookingCode);

        console.log("========== RETRIEVE RESPONSE ==========");
        console.log(booking);
        sessionStorage.setItem(
          "bookingDetails",
          JSON.stringify(booking)
        );
        router.push(
          `/booking-success?` +
            `bookingCode=${encodeURIComponent(bookingCode)}` +
            `&airline=${encodeURIComponent(airline)}` +
            `&passenger=${encodeURIComponent(
              `${firstName} ${lastName}`
            )}` +
            `&price=${encodeURIComponent(price)}` +
            `&seat=${encodeURIComponent(seatNumber)}` +
            `&meal=${encodeURIComponent(
              mealName || "No Meal"
            )}`
        );
      } catch (err) {
        console.error("Retrieve Booking Failed:", err);

        alert(
          "Booking confirmed, but failed to retrieve booking details."
        );
      }
    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Booking Failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">
        Confirm Booking
      </h1>

      <div className="bg-slate-800 rounded-xl p-6 space-y-3">
        <p>
          <b>Passenger:</b> {title} {firstName} {lastName}
        </p>

        <p>
          <b>Airline:</b> {airline}
        </p>

        <p>
          <b>Duration:</b> {duration}
        </p>

        <p>
          <b>Ticket Price:</b> ₹{price}
        </p>

        <hr className="border-slate-600" />

        <p>
          <b>Seat:</b> {seatNumber || "Not Selected"}
        </p>

        <p>
          <b>Seat Price:</b> ₹{seatPrice}
        </p>

        <hr className="border-slate-600" />

        <p>
          <b>Meal:</b> {mealName || "No Meal"}
        </p>

        <p>
          <b>Meal Price:</b> ₹{mealPrice}
        </p>
      </div>

      <button
        onClick={handleBooking}
        disabled={loading}
        className="mt-8 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
}

export default function FlightBookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          Loading...
        </div>
      }
    >
      <FlightBookPageContent />
    </Suspense>
  );
}