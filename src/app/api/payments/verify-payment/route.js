/**
 * POST /api/payments/verify-payment
 * -----------------------------------
 * Verifies Razorpay payment signature and forwards to the Express backend
 * for actual database fulfillment (subscription upgrade + credit allocation).
 *
 * Request body:
 *   { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName }
 * Request headers:
 *   Authorization: Bearer <token>  (forwarded to backend)
 *
 * Response:
 *   { success, message, credits }
 */

import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planName,
    } = await req.json();

    // ── Input validation ───────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment details." },
        { status: 400 }
      );
    }

    if (!planName) {
      return NextResponse.json(
        { success: false, message: "Invalid plan name." },
        { status: 400 }
      );
    }

    // ── Signature verification ─────────────────────────────────────────
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.warn("[verify-payment] Invalid signature for order:", razorpay_order_id);
      return NextResponse.json(
        { success: false, message: "Invalid payment signature! Payment could not be verified." },
        { status: 400 }
      );
    }

    console.log(
      `[verify-payment] ✅ Razorpay signature verified — Plan: ${planName}, ` +
      `Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`
    );

    // ── Forward to Express backend for DB fulfillment ──────────────────
    // The backend's POST /subscription/upgrade handles:
    //   - Marking old subscriptions as 'upgraded'
    //   - Creating new active subscription record
    //   - Granting credits to user
    //   - Logging credit transaction
    const authHeader = req.headers.get("authorization");
    const apiBase = (process.env.NEXT_PUBLIC_PROD_API_URL || "").replace(/\/+$/, "");

    const backendRes = await fetch(`${apiBase}/subscription/upgrade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ plan: planName }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok) {
      console.error("[verify-payment] Backend upgrade failed:", backendData);
      return NextResponse.json(
        {
          success: false,
          message: backendData.message || "Subscription upgrade failed on backend.",
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: backendData.message || `Payment verified & ${planName} plan upgraded successfully!`,
      plan: planName,
      credits: backendData.credits,
    });
  } catch (err) {
    console.error("[verify-payment] Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Payment verification failed." },
      { status: 500 }
    );
  }
}
