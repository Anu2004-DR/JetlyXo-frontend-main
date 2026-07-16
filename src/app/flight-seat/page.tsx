"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { seatMap } from "@/lib/api";

function FlightSeatPageContent() {
  const router = useRouter();
  const params = useSearchParams();

  const did = params.get("did") || "";

  const flightId = params.get("flightId") || "";
  const searchId = params.get("searchId") || "";
  const tId = params.get("tId") || "";

  const airline = params.get("airline") || "";
  const duration = params.get("duration") || "";
  const price = params.get("price") || "";

  const firstName = params.get("firstName") || "";
const lastName = params.get("lastName") || "";

const passengerName = `${firstName} ${lastName}`.trim();
  const age = params.get("age") || "";
  const phone = params.get("phone") || "";
  const email = params.get("email") || "";
  const title = params.get("title") || "";
  const dob = params.get("dob") || "";
  const pan = params.get("pan") || "";
  const seatCode = params.get("seatCode") || "";
  const seatNumber = params.get("seatNumber") || "";
  const seatPrice = params.get("seatPrice") || "";
  const [loading, setLoading] = useState(true);
  const [seatResponse, setSeatResponse] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  useEffect(() => {
    async function loadSeatMap() {
      try {
        setLoading(true);

        const response = await seatMap({
          dId: did,
          pax: [
            {
              pid: 1,
              title,
              fn: firstName,
              ln: lastName,
            },
          ],
        });



        console.log("Seat Map:", response);

        setSeatResponse(response);
      } catch (err) {
        console.error(err);
        alert("Unable to load seat map.");
      } finally {
        setLoading(false);
      }
    }

    if (did) {
      loadSeatMap();
    }
  }, [did]);

  const seatRows =
    seatResponse?.data?.dtl?.[0]?.smseat || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <h1 className="text-3xl font-bold mb-8">
        Seat Selection
      </h1>

      {/* Flight Card */}

      <div className="bg-slate-800 rounded-xl p-6 mb-8">

        <div className="grid md:grid-cols-2 gap-3">

          <p>
            Airline :
            <span className="font-bold ml-2">
              {airline}
            </span>
          </p>

          <p>
  Passenger :
  <span className="font-bold ml-2">
    {passengerName}
  </span>
</p>
            

          <p>
            Duration :
            <span className="font-bold ml-2">
              {duration}
            </span>
          </p>

          <p>
            Ticket :
            <span className="font-bold ml-2">
              ₹{price}
            </span>
          </p>

        </div>

      </div>

      {/* Legend */}

      <div className="flex gap-6 mb-8">

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-600 rounded"></div>
          Free
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-yellow-500 rounded"></div>
          Paid
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 rounded"></div>
          Occupied
        </div>

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded"></div>
          Selected
        </div>

      </div>

      {loading ? (

        <div className="text-xl">
          Loading Seat Map...
        </div>

      ) : (

        <>
          {/* Cockpit */}

          <div className="flex justify-center mb-6">

            <div className="bg-slate-700 px-8 py-2 rounded-full font-semibold">
              Cockpit
            </div>

          </div>

          {/* Seat Headers */}

          <div className="max-w-xl mx-auto">

            <div className="grid grid-cols-7 gap-2 mb-3 text-center font-bold">

              <div>A</div>
              <div>B</div>
              <div>C</div>

              <div></div>

              <div>D</div>
              <div>E</div>
              <div>F</div>

            </div>

            {seatRows.map((row: any[], rowIndex: number) => (

              <div
                key={rowIndex}
                className="grid grid-cols-7 gap-2 mb-2"
              >

                {row.map((seat: any, index: number) => {

                  if (seat.isempty) {
                    return (
                      <div
                        key={index}
                        className="w-14 h-14"
                      />
                    );
                  }


                  return (

                    <button
                    key={seat.code}
                    onClick={() => {
                      if (seat.isempty) return;
                      if (seat.avlt === 2) return;
                  
                      setSelectedSeat(seat);
                    }}
                    className={`
                      h-16
                      rounded-lg
                      border
                      text-sm
                      font-semibold
                      transition-all
                      duration-150
                      hover:scale-105
                      active:scale-95
                  
                      ${
                        selectedSeat?.code === seat.code
                          ? "bg-blue-600 border-blue-300"
                          : seat.avlt === 2
                          ? "bg-red-600 cursor-not-allowed"
                          : seat.isfree
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-yellow-500 hover:bg-yellow-400 text-black"
                      }
                    `}
                  >
                    <div>{seat.sno}</div>
                  
                    <div className="text-xs">
                      ₹{seat.prc}
                    </div>
                  </button>


                  );
                })}

              </div>

            ))}

          </div>

          {/* Selected Seat */}

          {selectedSeat && (

            <div className="mt-10 bg-slate-800 rounded-xl p-6 max-w-md">

<h2 className="text-xl font-bold mb-4">
  Selected Seat
</h2>

<div className="space-y-2">

  <p>
    Seat :
    <span className="font-bold ml-2">
      {selectedSeat.sno}
    </span>
  </p>

  <p>
    Seat Charge :
    <span className="font-bold ml-2">
      ₹{selectedSeat.prc}
    </span>
  </p>

  <hr className="border-slate-600" />

  <p>
    Ticket Fare :
    <span className="font-bold ml-2">
      ₹{price}
    </span>
  </p>

</div>

            </div>

          )}

        </>

      )}

      {/* Continue */}

      <button
  disabled={!selectedSeat}
  className={`
    mt-10
    px-8
    py-3
    rounded-lg
    font-semibold
    transition

    ${
      selectedSeat
        ? "bg-blue-600 hover:bg-blue-700"
        : "bg-gray-600 cursor-not-allowed opacity-50"
    }
  `}
  onClick={() => {
    if (!selectedSeat) return;

    router.push(
      `/flight-meal?did=${encodeURIComponent(did)}` +
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
        `&seatCode=${encodeURIComponent(selectedSeat.code)}` +
        `&seatNumber=${encodeURIComponent(selectedSeat.sno)}` +
        `&seatPrice=${encodeURIComponent(selectedSeat.prc)}` +
        `&title=${encodeURIComponent(title)}` +
        `&dob=${encodeURIComponent(dob)}` +
        `&pan=${encodeURIComponent(pan)}`
    );
  }}
>
  Continue to Meals
</button>

    </div>
  );
}

export default function FlightSeatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          Loading...
        </div>
      }
    >
      <FlightSeatPageContent />
    </Suspense>
  );
}