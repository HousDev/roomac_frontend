
// lib/paymentApi.ts
import { request } from "@/lib/api";

/**
 * Create Razorpay Order
 * @param amount number (in INR)
 */
export const createRazorpayOrder = async (amount: number) => {
  try {
    const res = await request("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });

    return res;
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    throw error;
  }
};

/**
 * Verify Razorpay Payment (optional but recommended)
 */
export const verifyRazorpayPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  try {
    const res = await request("/api/payment/verify-payment", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return res;
  } catch (error) {
    console.error("verifyRazorpayPayment error:", error);
    throw error;
  }
};


/**
 * Get Razorpay configuration status
 */
export const getRazorpayStatus = async () => {
  try {
    const res = await request("/api/payment/status", {
      method: "GET",
    });
    return res;
  } catch (error: any) {
    console.error("getRazorpayStatus error:", error);
    return { success: false, data: { enabled: false, hasKeyId: false, mode: 'unknown' } };
  }
};
