import apiClient from "@/lib/apiClient";
import { Flight, FlightSearchParams } from "@/types";

export async function searchFlights(
  params: FlightSearchParams
): Promise<Flight[]> {
  try {
    const origin = params.from || "BLR";
    const destination = params.to || "DEL";

    const res = await apiClient.get("/api/flights/search", {
      params: {
        origin,
        destination,
        departureDate: params.departure || params.date,
        adults: params.travellers || 1,
        cabin: params.cabin,
        fareType: params.fareType,
      },
    });

    return (
      res.data?.data ||
      res.data?.flights ||
      []
    ) as Flight[];
  } catch (err: any) {
    console.error(
      "FLIGHT SEARCH ERROR:",
      err?.response?.data || err.message
    );

    throw new Error(
      err?.response?.data?.message ||
      "Flight search failed"
    );
  }
}