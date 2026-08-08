/**
 * POST /api/payments/create-order
 * --------------------------------
 * Generates a Razorpay order_id for the selected subscription plan.
 *
 * Request body:
 *   { amount: number (in ₹), planName: string }
 *
 * Response:
 *   { success, orderId, amount (paise), currency, keyId }
 */

import { NextResponse } from "next/server";
import { razorpayInstance } from "@/lib/razorpay";
import { saveOrderRecord } from "@/lib/orderService";

// Plan whitelist to prevent tampered amounts from the client
const PLAN_PRICE_MAP = {
  Premium: 799,
  Pro: 2499,
  Enterprise: 7999,
};

export async function POST(req) {
  try {
    const { amount, planName } = await req.json();

    // ── Validate inputs ────────────────────────────────────────────────
    if (!planName || !PLAN_PRICE_MAP[planName]) {
      return NextResponse.json(
        { success: false, message: "Invalid plan name." },
        { status: 400 }
      );
    }

    // Server-side price enforcement: ignore client-sent amount,
    // use the canonical price from the whitelist.
    const canonicalPrice = PLAN_PRICE_MAP[planName];

    const options = {
      amount: Math.round(canonicalPrice * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${planName}`,
      notes: {
        planName,
        source: "security-platform",
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Persist pending order record in database (fail-safe)
    await saveOrderRecord({
      orderId: order.id,
      planName,
      amount: canonicalPrice,
      currency: order.currency || "INR",
      receipt: options.receipt,
      status: "created",
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[create-order] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create order." },
      { status: 500 }
    );
  }
}
