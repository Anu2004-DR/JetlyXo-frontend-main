import apiClient from "@/lib/apiClient";
import { Bus } from "@/types";

export async function searchBuses(params: {
  from?: string;
  to?: string;
}): Promise<Bus[]> {
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

    return (res.data?.data || res.data || []) as Bus[];
  } catch (err: any) {
    console.error(
      "BUS SEARCH ERROR:",
      err?.response?.data || err.message
    );

    return [];
  }
}

export async function fetchBuses(): Promise<Bus[]> {
  try {
    const res = await apiClient.get("/api/buses");

    return (res.data?.data || res.data || []) as Bus[];
  } catch (err: any) {
    console.error(
      "FETCH BUSES ERROR:",
      err?.response?.data || err.message
    );

    return [];
  }
}