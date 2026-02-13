// app/lib/paymentApi.ts

export const createRazorpayOrder = async (amount: number) => {
  try {
    const response = await fetch(
      "http://localhost:3001/api/payment/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create Razorpay order");
    }

    return await response.json();
  } catch (error) {
    console.error("createRazorpayOrder error:", error);
    throw error;
  }
};
