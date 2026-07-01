"use client"; // because we'll use hooks and client fetch

import FirewallDashboard from "@/components/firewallDashboard/firewallDashboard";
import React, { useState } from "react";
import useProtectedAction from "@/components/UseProtectedAction/UseProtectedAction";
import OwnershipVerificationWizard from "@/components/ownership/OwnershipVerificationWizard";

export default function DashboardPage() {
  // ====================================================
  // TEMPORARILY DISABLED FOR LOCAL TESTING
  // Purpose: Skip domain ownership verification.
  // Re-enable before production deployment.
  // ====================================================
  const SKIP_DOMAIN_VERIFICATION_FOR_TESTING = true;

  const [url, setUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  const protectedAction = useProtectedAction();
  async function handleScan(e) {
    e.preventDefault();
    if (!ownershipVerified && !SKIP_DOMAIN_VERIFICATION_FOR_TESTING) {
      setError("Verify ownership of this website before running the WAF scan.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);

    // ✅ Wrap your API call inside protectedAction
    await protectedAction(async (token) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/waf/waf-scan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // send token for protected route
            },
            body: JSON.stringify({ url }),
          }
        );

        const json = await res.json();

        if (res.ok) {
          console.log("#", json);
          setData(json.dashboard || { message: json.message });
        } else {
          setError(json.message || "Something went wrong");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      {/* Header Section */}
      <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2 sm:px-0 mt-15">
        {/* Image */}
        <div className="w-30 h-30 sm:w-24 sm:h-24 md:w-30 md:h-30 rounded-full overflow-hidden border-4 border-blue-500 flex-shrink-0">
          <img
            src="/BlueTeam/WAF.png" // apna image path yahan do
            alt="Firewall Logo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text in multiple rows */}
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold">
            WAF Detection Dashboard
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm md:text-base">
            Analyze websites for Web Application Firewall protection
          </p>
        </div>
      </div>

      {/* Form under header */}
      <form
        onSubmit={handleScan}
        className="mb-6 flex flex-col items-center w-full max-w-4xl border border-white-600 rounded-lg p-6 sm:p-8"
      >
        <input
          type="url"
          placeholder="Enter URL to scan"
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          required
          className="border rounded px-4 py-2 w-full text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded border border-blue-500 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Scanning..." : "Scan URL"}
        </button>
        <OwnershipVerificationWizard
          targetValue={url}
          targetLabel="Website URL"
          onVerifiedChange={setOwnershipVerified}
          className="mt-4 w-full"
        />
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded max-w-sm w-full text-center">
          {error}
        </div>
      )}

      {/* Dashboard Component */}
      {data && <FirewallDashboard data={data} />}
    </div>
  );
}
