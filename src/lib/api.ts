import apiClient from "@/lib/apiClient";

export type FlightSearchParams = {
  from?: string;
  to?: string;
  departure?: string;
  date?: string;
  return?: string;
  travellers?: number;
  cabin?: string;
};

export type FlightResult = {
  airline: string;
  price: number;
  duration: string;
  stops: string | number;
  dep: string;
  id?: number;
  seats?: number;
  from?: string;
  to?: string;
  departure?: string;
  arrival?: string;
};

export type Booking = {
  id: number;
  bookingType: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  passengerName?: string;
  pnr?: string;
  bus?: {
    id?: number;
    busName?: string;
    operator?: string;
    name?: string;
    fromCity?: string;
    toCity?: string;
    price?: number;
  } | null;
  flight?: {
    id?: number;
    airline?: string;
    fromCity?: string;
    toCity?: string;
    price?: number;
  } | null;
  flightData?: {
    from?: string;
    to?: string;
    price?: number;
    departure?: string;
  } | null;
  train?: {
    id?: number;
    trainName?: string;
    name?: string;
    fromCity?: string;
    toCity?: string;
    price?: number;
  } | null;
};

export async function createBooking(data: any) {
  try {
    const res = await apiClient.post("/api/bookings", data);
    return {
      ...res.data,
      id: res.data?.bookingId ?? res.data?.data?.id ?? res.data?.id ?? null,
    };
  } catch (err: any) {
    console.error("CREATE BOOKING ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

export async function createOrder(bookingId: number | string) {
  try {
    const res = await apiClient.post("/api/payment/create-order", { bookingId });
    return res.data;
  } catch (err: any) {
    console.error("CREATE ORDER ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

export async function verifyPayment(data: any) {
  try {
    const res = await apiClient.post("/api/payment/verify", data);
    return res.data;
  } catch (err: any) {
    console.error("VERIFY PAYMENT ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

export async function fetchBookings(): Promise<Booking[]> {
  try {
    const res = await apiClient.get("/api/bookings/history");
    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("FETCH BOOKINGS ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function getBookingById(id: number) {
  try {
    const res = await apiClient.get(`/api/bookings/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("GET BOOKING ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

export async function cancelBooking(id: string) {
  try {
    const res = await apiClient.post(`/api/bookings/cancel/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("CANCEL ERROR:", err?.response?.data || err.message);
    throw err;
  }
}

export async function searchFlights(params: FlightSearchParams) {
  try {
    const from = params.from || "BLR";
    const to = params.to || "DEL";

    const res = await apiClient.get("/api/flights/search", {
      params: {
        from,
        to,
        departure: params.departure || params.date,
        travellers: params.travellers || 1,
        cabin: params.cabin || "economy",
      },
    });

    return res.data?.flights || res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("FLIGHT SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function searchBuses(params: { from?: string; to?: string }) {
  try {
    if (!params.from || !params.to) {
      throw new Error("From and To required");
    }

    const res = await apiClient.get("/api/buses/search", {
      params: {
        from: params.from,
        to: params.to,
      },
    });

    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("BUS SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function fetchBuses() {
  try {
    const res = await apiClient.get("/api/buses");
    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("FETCH BUSES ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function searchTrains(params: { from?: string; to?: string }) {
  try {
    if (!params.from || !params.to) {
      throw new Error("From and To required");
    }

    const res = await apiClient.get("/api/trains/search", {
      params: {
        from: params.from,
        to: params.to,
      },
    });

    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("TRAIN SEARCH ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function fetchTrains() {
  try {
    const res = await apiClient.get("/api/trains");
    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("FETCH TRAINS ERROR:", err?.response?.data || err.message);
    return [];
  }
}

export async function fetchRecommendations(bookings: any[]) {
  try {
    const res = await apiClient.post("/api/recommendations", { bookings });
    return res.data?.data || res.data || [];
  } catch (err: any) {
    console.error("RECOMMENDATION ERROR:", err?.response?.data || err.message);
    return [];
  }
}

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

export type AIInputBooking = {
  source: string;
  destination: string;
  price: number;
  type: "flight" | "bus" | "train";
};

export function mapBookingsForAI(bookings: Booking[]): AIInputBooking[] {
  return bookings
    .map((booking) => {
      if (booking.flightData) {
        return {
          source: booking.flightData.from || "",
          destination: booking.flightData.to || "",
          price: booking.flightData.price || 0,
          type: "flight" as const,
        };
      }

      if (booking.flight) {
        return {
          source: booking.flight.fromCity || "",
          destination: booking.flight.toCity || "",
          price: booking.flight.price || 0,
          type: "flight" as const,
        };
      }

      if (booking.bus) {
        return {
          source: booking.bus.fromCity || "",
          destination: booking.bus.toCity || "",
          price: booking.bus.price || 0,
          type: "bus" as const,
        };
      }

      if (booking.train) {
        return {
          source: booking.train.fromCity || "",
          destination: booking.train.toCity || "",
          price: booking.train.price || 0,
          type: "train" as const,
        };
      }

      return null;
    })
    .filter((booking): booking is AIInputBooking => booking !== null);
}
