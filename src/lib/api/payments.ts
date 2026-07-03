import apiClient from "@/lib/apiClient";

export async function createOrder(
  bookingId: number | string
) {
  try {
    const res = await apiClient.post(
      "/api/payment/create-order",
      {
        bookingId,
      }
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "CREATE ORDER ERROR:",
      err?.response?.data || err.message
    );

    throw err;
  }
}

export async function verifyPayment(data: any) {
  try {
    const res = await apiClient.post(
      "/api/payment/verify",
      data
    );

    return res.data;
  } catch (err: any) {
    console.error(
      "VERIFY PAYMENT ERROR:",
      err?.response?.data || err.message
    );

    throw err;
  }
}