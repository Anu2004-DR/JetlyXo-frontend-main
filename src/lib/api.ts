import apiClient from "@/lib/apiClient";



export type FlightSearchParams = {
  from?: string;
  to?: string;
  departure?: string;
  return?: string;
  travellers?: number;
  cabin?: string;
};

export type FlightResult = {
  airline: string;
  price: number;
  duration: string;
  stops: string;
  dep: string;
};

export type Booking = {
  id: number;
  bookingType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  passengerName?: string;
  pnr?: string;
  bus?: any;
  flightData?: any;
  train?: any;
};

/* ==============================
   CREATE BOOKING
============================== */
export async function createBooking(data: any) {
  const res = await apiClient.post("/api/bookings", data);
  return res.data;
}

/* ==============================
   GET BOOKING HISTORY
============================== */
export async function fetchBookings(): Promise<Booking[]> {
  const res = await apiClient.get("/api/bookings/history");

  console.log("FULL RESPONSE:", res.data);

  return res.data?.data || [];
}

  
/* ==============================
   GET BOOKING BY ID (FIXED)
============================== */
export async function getBookingById(id: number) {
  const res = await apiClient.get(`/api/bookings/${id}`);
  return res.data;
}

/* ==============================
   CANCEL BOOKING
============================== */
export async function cancelBooking(id: string) {
  const res = await apiClient.post(`/api/bookings/cancel/${id}`);
  return res.data;
}

/* ==============================
   RECOMMENDATIONS
============================== */
export async function fetchRecommendations(bookings: any[]) {
  const res = await apiClient.post("/api/recommendations", { bookings });
  return res.data;
}

/* ==============================
   RECOMMENDATION TYPES
============================== */
export type Recommendation = {
  id: string;
  type: "flight" | "bus" | "train";
  source: string;
  destination: string;
  price: number;
  departureTime: string;
  score: number;
  reason?: string;
};

/* ==============================
   MAP BOOKINGS FOR AI
============================== */
export type AIInputBooking = {
  source: string;
  destination: string;
  price: number;
  type: "flight" | "bus" | "train";
};

export function mapBookingsForAI(bookings: Booking[]): AIInputBooking[] {
  return bookings
    .map((b: Booking) => {

      if (b.flightData) {
        return {
          source: b.flightData.from,
          destination: b.flightData.to,
          price: b.flightData.price,
          type: "flight",
        };
      }

      if (b.bus) {
        return {
          source: b.bus.fromCity,
          destination: b.bus.toCity,
          price: b.bus.price,
          type: "bus",
        };
      }

      if (b.train) {
        return {
          source: b.train.fromCity,
          destination: b.train.toCity,
          price: b.train.price,
          type: "train",
        };
      }

      return null;
    })
    .filter((b): b is AIInputBooking => b !== null);
}
/* ==============================
   SEARCH FLIGHTS
============================== */
export async function searchFlights(params: any) {
  const res = await apiClient.get("/api/flights/search", {
    params
  });
  return res.data;
}

/* ==============================
   FETCH BUSES
============================== */
export async function fetchBuses() {
  const res = await apiClient.get("/api/buses");
  return res.data;
}

/* ==============================
   FETCH TRAINS
============================== */
export async function fetchTrains() {
  const res = await apiClient.get("/api/trains");
  return res.data;
}