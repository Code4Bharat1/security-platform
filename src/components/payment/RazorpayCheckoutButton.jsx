"use client";

/**
 * RazorpayCheckoutButton
 * ───────────────────────
 * Reusable component that:
 *  1. Dynamically loads the Razorpay Checkout SDK script
 *  2. Creates a server-side order via /api/payments/create-order
 *  3. Opens the Razorpay payment modal
 *  4. Verifies the payment via /api/payments/verify-payment
 *  5. Fires onPaymentSuccess callback with plan + credits data
 *
 * Props:
 *   - plan: { name: string, price: number }
 *   - onPaymentSuccess: (data) => void
 *   - className: string (optional, override button classes)
 *   - children: ReactNode (optional, custom button content)
 */

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { generatePaymentReceiptPDF } from "./generatePaymentReceiptPDF";

// ── Dynamic Razorpay script loader (singleton) ─────────────────────────
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Already loaded
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }

    // Check if script tag already exists (e.g. from a previous mount)
    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RazorpayCheckoutButton({
  plan,
  onPaymentSuccess,
  className,
  children,
}) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    // ── Step 0: Load Razorpay SDK ────────────────────────────────────
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your network.");
      setLoading(false);
      return;
    }

    try {
      // ── Step 1: Create order on the server ─────────────────────────
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          planName: plan.name,
        }),
      });

      const orderData = await res.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order.");
      }

      // ── Step 2: Open Razorpay Checkout modal ───────────────────────
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Nexcore Security Platform",
        description: `${plan.name} Plan — Subscription Upgrade`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // ── Step 3: Verify payment on the server ───────────────────
          try {
            const token = localStorage.getItem("token");
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planName: plan.name,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success(
                verifyData.message || "Subscription upgraded successfully!"
              );

              // Update local user state immediately
              try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                  const parsed = JSON.parse(storedUser);
                  if (verifyData.credits !== undefined) parsed.credits = verifyData.credits;
                  if (verifyData.plan) parsed.plan = verifyData.plan;
                  localStorage.setItem("user", JSON.stringify(parsed));
                }
              } catch (e) {
                console.warn("Could not sync user in local storage:", e);
              }

              if (onPaymentSuccess) {
                onPaymentSuccess(verifyData);
              }

              // Generate PDF receipt if backend returned receipt data
              if (verifyData.receipt) {
                try {
                  generatePaymentReceiptPDF(verifyData.receipt);
                } catch (pdfErr) {
                  console.error("[RazorpayCheckout] Failed to generate PDF receipt:", pdfErr);
                }
              }

              // Refresh the entire website after a short delay so all state takes effect immediately
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              toast.error(
                verifyData.message || "Payment verification failed. Please try again."
              );
              setTimeout(() => {
                window.location.reload();
              }, 1800);
            }
          } catch (verifyErr) {
            console.error("[RazorpayCheckout] Verification error:", verifyErr);
            toast.error("Payment verification failed. Please try again.");
            setTimeout(() => {
              window.location.reload();
            }, 1800);
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#d4af37", // Gold theme matching the platform
        },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled.", { icon: "ℹ️" });
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        console.error("[RazorpayCheckout] Payment failed:", response.error);
        toast.error(
          response.error?.description || "Payment failed. Refreshing page..."
        );
        setTimeout(() => {
          window.location.reload();
        }, 1800);
      });

      paymentObject.open();
    } catch (err) {
      console.error("[RazorpayCheckout] Error:", err);
      toast.error(err.message || "Error initiating payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      className={
        className ||
        "gold-button w-full justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
      }
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Processing…</span>
        </>
      ) : (
        children || (
          <>
            <span>Upgrade to {plan.name}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )
      )}
    </button>
  );
}
