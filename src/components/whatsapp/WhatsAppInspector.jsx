"use client";
import { useState } from "react";
import { ShieldCheck, Phone, KeyRound } from "lucide-react";

export default function WhatsAppInspector() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sendOtp = () => {
    if (!phone) return;
    setStep(2);
  };

  const verifyOtp = () => {
    if (!otp) return;
    setStep(3);
  };

  const inspectPrivacy = async () => {
    setLoading(true);
    setResult(null);

    const settings = {
      profilePhoto: "Everyone",
      lastSeen: "Everyone",
      groups: "Everyone",
      readReceipts: true,
    };

    try {
      const res = await fetch("/api/whatsapp-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      setResult(data.risks || ["✅ All settings are safe."]);
    } catch (err) {
      setResult(["❌ Failed to inspect privacy settings."]);
    }

    setLoading(false);
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
              onChange={(e) => setPhone(e.target.value.trim)}              className="w-full px-4 py-2 border rounded-md mb-4"
              placeholder="+91XXXXXXXXXX"
            />
            <button
              onClick={sendOtp}
              className="w-full py-3 rounded-md text-white bg-green-700 hover:bg-green-800"
            >
              Send OTP
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
              onChange={(e) => setOtp(e.target.value.trim)}              className="w-full px-4 py-2 border rounded-md mb-4"
              placeholder="Enter the OTP"
            />
            <button
              onClick={verifyOtp}
              className="w-full py-3 rounded-md text-white bg-green-700 hover:bg-green-800"
            >
              Verify OTP
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
