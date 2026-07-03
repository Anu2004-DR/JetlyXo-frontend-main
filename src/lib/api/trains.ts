import apiClient from "@/lib/apiClient";
import { Train } from "@/types";

export async function searchTrains(params: {
  from?: string;
  to?: string;
}): Promise<Train[]> {
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

    return (res.data?.data || res.data || []) as Train[];
  } catch (err: any) {
    console.error(
      "TRAIN SEARCH ERROR:",
      err?.response?.data || err.message
    );

    return [];
  }
}

export async function fetchTrains(): Promise<Train[]> {
  try {
    const res = await apiClient.get("/api/trains");

    return (res.data?.data || res.data || []) as Train[];
  } catch (err: any) {
    console.error(
      "FETCH TRAINS ERROR:",
      err?.response?.data || err.message
    );

    return [];
  }
}