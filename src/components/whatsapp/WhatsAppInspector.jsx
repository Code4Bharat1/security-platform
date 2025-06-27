"use client";
import { useState } from "react";
import { ShieldCheck, Phone, KeyRound } from "lucide-react";

export default function WhatsAppInspector() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    // Simulate backend call
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1000);
  };

  const verifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const inspectPrivacy = async () => {
    setLoading(true);
    setResult(null);
    // Simulate inspection
    setTimeout(() => {
      setResult([
        "✅ 2-step verification is enabled.",
        "⚠️ Last seen is visible to everyone.",
        "✅ Disappearing messages are enabled.",
        "❌ Profile photo is visible to unknown numbers.",
        "✅ Group add restriction is enabled.",
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-20 px-4">
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto mb-4 text-green-600" size={48} />
        <h1 className="text-3xl font-bold text-green-800">
          WhatsApp Privacy Inspector
        </h1>
        <p className="text-gray-600 mt-2">
          Check and improve your WhatsApp privacy settings.
        </p>
      </div>

      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-lg">
        {step === 1 && (
          <>
            <label className="block mb-2 font-semibold flex items-center gap-2">
              <Phone size={20} /> Enter your phone number:
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-4"
              placeholder="+91XXXXXXXXXX"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !phone}
              className="w-full py-3 rounded-md text-white bg-green-700 hover:bg-green-800"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <label className="block mb-2 font-semibold flex items-center gap-2">
              <KeyRound size={20} /> Enter OTP:
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-4"
              placeholder="Enter the OTP"
            />
            <button
              onClick={verifyOtp}
              disabled={loading || !otp}
              className="w-full py-3 rounded-md text-white bg-green-700 hover:bg-green-800"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <button
              onClick={inspectPrivacy}
              disabled={loading}
              className="w-full py-3 rounded-md text-white bg-green-700 hover:bg-green-800"
            >
              {loading ? "Inspecting..." : "Inspect Privacy Settings"}
            </button>
            {result && (
              <div className="mt-6 text-left space-y-2">
                {result.map((item, idx) => (
                  <p
                    key={idx}
                    className={`${
                      item.startsWith("✅")
                        ? "text-green-700"
                        : item.startsWith("❌")
                        ? "text-red-600"
                        : "text-yellow-600"
                    } font-semibold`}
                  >
                    {item}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
