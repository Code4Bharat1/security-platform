/**
 * POST /api/payments/webhook
 * ---------------------------
 * Razorpay server-to-server webhook endpoint.
 * Handles asynchronous payment events like:
 *   - payment.captured   → Confirm order fulfillment
 *   - payment.failed     → Mark order as failed, notify user
 *   - order.paid         → Alternative order completion signal
 *   - refund.created     → Handle refund processing
 *
 * Configure this URL in the Razorpay Dashboard → Webhooks:
 *   https://security-platform-api.code4bharat.com/api/payments/webhook
 *   Secret: RAZORPAY_WEBHOOK_SECRET
 */

import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req) {
  try {
    // ── Read raw body for HMAC verification ────────────────────────────
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, message: "Missing webhook signature header." },
        { status: 400 }
      );
    }

    // ── Verify webhook authenticity ────────────────────────────────────
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.warn("[webhook] ⚠️  Invalid webhook signature – request rejected.");
      return NextResponse.json(
        { success: false, message: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    // ── Parse event payload ────────────────────────────────────────────
    const event = JSON.parse(rawBody);
    const eventType = event.event;

    console.log(`[webhook] 📩 Received event: ${eventType}`);

    switch (eventType) {
      // ── Payment successfully captured ────────────────────────────────
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        console.log(
          `[webhook] ✅ Payment captured — ID: ${payment.id}, ` +
          `Amount: ₹${payment.amount / 100}, Order: ${payment.order_id}`
        );

        // TODO: Confirm order fulfillment in database
        // await db.orders.updateOne(
        //   { orderId: payment.order_id },
        //   { $set: { status: "paid", paymentId: payment.id, capturedAt: new Date() } }
        // );

        break;
      }

      // ── Payment failed ───────────────────────────────────────────────
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.log(
          `[webhook] ❌ Payment failed — ID: ${payment.id}, ` +
          `Reason: ${payment.error_description}, Order: ${payment.order_id}`
        );

        // TODO: Mark order as failed and optionally notify user
        // await db.orders.updateOne(
        //   { orderId: payment.order_id },
        //   { $set: { status: "failed", failureReason: payment.error_description } }
        // );

        break;
      }

      // ── Order fully paid ─────────────────────────────────────────────
      case "order.paid": {
        const order = event.payload.order.entity;
        console.log(
          `[webhook] 💰 Order paid — ID: ${order.id}, Amount: ₹${order.amount / 100}`
        );

        // TODO: Final order confirmation (idempotent check)
        break;
      }

      // ── Refund created ───────────────────────────────────────────────
      case "refund.created": {
        const refund = event.payload.refund.entity;
        console.log(
          `[webhook] 🔄 Refund created — ID: ${refund.id}, ` +
          `Amount: ₹${refund.amount / 100}, Payment: ${refund.payment_id}`
        );

        // TODO: Handle refund — downgrade plan, revoke credits
        // await db.orders.updateOne(
        //   { paymentId: refund.payment_id },
        //   { $set: { status: "refunded", refundId: refund.id } }
        // );

        break;
      }

      default:
        console.log(`[webhook] ℹ️  Unhandled event type: ${eventType}`);
    }

    // Razorpay expects a 200 OK response to acknowledge receipt
    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error("[webhook] Error processing webhook:", err);
    // Return 200 even on errors to prevent Razorpay from retrying indefinitely.
    // Log the error for investigation instead.
    return NextResponse.json({ success: true, received: true });
  }
}
