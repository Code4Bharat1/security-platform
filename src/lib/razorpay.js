/**
 * Razorpay SDK Instance & HMAC Signature Verification Helper
 * -----------------------------------------------------------
 * - Exports a singleton Razorpay server-side SDK instance for creating
 *   orders, fetching payments, etc.
 * - Exports a signature verification helper used by the verify-payment
 *   and webhook routes to confirm Razorpay callback authenticity.
 */

import Razorpay from "razorpay";
import crypto from "crypto";

// ── Razorpay SDK singleton (server-side only) ──────────────────────────
export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── HMAC-SHA256 signature verification ─────────────────────────────────
/**
 * Verifies the Razorpay payment signature using HMAC-SHA256.
 *
 * @param {Object} params
 * @param {string} params.orderId      – The Razorpay order_id
 * @param {string} params.paymentId    – The Razorpay payment_id
 * @param {string} params.signature    – The signature returned by Razorpay Checkout
 * @returns {boolean} True if the generated signature matches the provided one
 */
export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
};

// ── Webhook signature verification ─────────────────────────────────────
/**
 * Verifies the Razorpay webhook signature.
 * Uses the RAZORPAY_WEBHOOK_SECRET (configured in the Razorpay Dashboard).
 *
 * @param {string} rawBody  – The raw request body as a string
 * @param {string} signature – The X-Razorpay-Signature header value
 * @returns {boolean} True if signature is valid
 */
export const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[razorpay] RAZORPAY_WEBHOOK_SECRET is not set – skipping webhook verification.");
    return false;
  }
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expectedSignature === signature;
};
