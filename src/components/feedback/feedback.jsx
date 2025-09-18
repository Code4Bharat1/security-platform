"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const FeedbackForm = () => {
  const [form, setForm] = useState({ name: "", email: "", feedback: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const validateForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.feedback.trim()) {
      setError("⚠️ All fields are required.");
      return false;
    }
    // simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("⚠️ Please enter a valid email.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmitted(true);
      setForm({ name: "", email: "", feedback: "" }); // reset form
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[url('/15.jpg')] bg-no-repeat bg-cover px-4 sm:px-6 lg:px-20 py-12 mt-15">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white p-6 sm:p-8 shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.35)]"
      >
        <h2 className="text-3xl font-bold text-white mb-6">
          💬 We Value Your Feedback
        </h2>

        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-green-400 font-semibold text-lg">
              🎉 Thank you for your feedback!
            </p>
            <p className="text-gray-300 mt-2">
              Your thoughts help us improve and serve you better.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            {error && (
              <p className="text-red-400 text-sm font-medium text-left">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="name"
                className="block font-medium mb-1 text-gray-200"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border rounded-xl shadow-sm bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-medium mb-1 text-gray-200"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border rounded-xl shadow-sm bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block font-medium mb-1 text-gray-200"
              >
                Feedback
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={form.feedback}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-5 py-3 border rounded-xl shadow-sm bg-white/20 text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Write your thoughts here..."
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer text-white py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default FeedbackForm;
