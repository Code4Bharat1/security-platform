"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Plus,
  X,
  Check,
  MessageSquare,
  Video,
  Mail,
} from "lucide-react";

export default function ScheduleMeeting() {
  const [meetingData, setMeetingData] = useState({
    title: "",
    agenda: "",
    selectedDate: "",
    selectedTime: "",
    duration: 30,
    type: "online",
    venue: "",
    participants: [""],
    hostName: "",
    hostEmail: "", // registered email (user’s)
    contactNumber: "",
    importance: "normal",
    isRecurring: false,
    frequency: "weekly",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meetings, setMeetings] = useState([]);

  // Load meetings from localStorage for UX
  useEffect(() => {
    const saved = localStorage.getItem("meetings");
    if (saved) setMeetings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("meetings", JSON.stringify(meetings));
  }, [meetings]);

  const updateField = (field, value) =>
    setMeetingData((prev) => ({ ...prev, [field]: value }));

  const addParticipant = () =>
    setMeetingData((prev) => ({
      ...prev,
      participants: [...prev.participants, ""],
    }));

  const removeParticipant = (index) => {
    if (meetingData.participants.length > 1) {
      setMeetingData((prev) => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index),
      }));
    }
  };

  const updateParticipant = (index, email) =>
    setMeetingData((prev) => ({
      ...prev,
      participants: prev.participants.map((p, i) =>
        i === index ? email : p
      ),
    }));

  // Submit meeting - POST to /api/schedule (emails handled in backend)
  const submitMeeting = async () => {
    if (!meetingData.hostEmail) {
      alert("Please enter your registered email.");
      return;
    }
    if (!meetingData.selectedDate || !meetingData.selectedTime) {
      alert("Please select a date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/schedulemeeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingData }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to schedule meeting");
      }

      const savedMeeting = json.savedMeeting ?? {
        ...meetingData,
        id: Date.now(),
      };
      setMeetings((prev) => [...prev, savedMeeting]);

      setIsSubmitted(true);

      // Reset form
      setMeetingData({
        title: "",
        agenda: "",
        selectedDate: "",
        selectedTime: "",
        duration: 30,
        type: "online",
        venue: "",
        participants: [""],
        hostName: "",
        hostEmail: "",
        contactNumber: "",
        importance: "normal",
        isRecurring: false,
        frequency: "weekly",
      });

      setTimeout(() => setIsSubmitted(false), 4000);
    } catch (err) {
      console.error("Schedule error:", err);
      alert("Could not schedule meeting: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTimes = [
    "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "12:00 PM","12:30 PM","01:00 PM","01:30 PM","02:00 PM","02:30 PM",
    "03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM","05:30 PM"
  ];

  const durationOptions = [
    { minutes: 15, label: "15 min" },
    { minutes: 30, label: "30 min" },
  ];

  const meetingTypes = [
    { id: "online", icon: Video, name: "Video Call" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {isSubmitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-3xl p-8 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Success!</h3>
            <p className="text-green-200 text-lg">
              Your meeting has been scheduled.<br />
              Confirmation emails have been sent to <b>you</b> and <b>admin</b>.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Form */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Meeting Information</h2>
            </div>

            {/* Title */}
            <input type="text" value={meetingData.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Meeting title" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white mb-4" />

            {/* Agenda */}
            <textarea value={meetingData.agenda} onChange={(e) => updateField("agenda", e.target.value)} placeholder="Meeting purpose" rows={4} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <input type="date" value={meetingData.selectedDate} onChange={(e) => updateField("selectedDate", e.target.value)} min={new Date().toISOString().split("T")[0]} className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white" />
              <select value={meetingData.selectedTime} onChange={(e) => updateField("selectedTime", e.target.value)} className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white">
                <option value="">Choose time</option>
                {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Host Email */}
            <input type="email" value={meetingData.hostEmail} onChange={(e) => updateField("hostEmail", e.target.value)} placeholder="Your registered email" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white mb-4" />

            {/* Duration */}
            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-3">Duration</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {durationOptions.map(opt => (
                  <button key={opt.minutes} onClick={() => updateField("duration", opt.minutes)} type="button" className={`p-3 rounded-xl font-medium ${meetingData.duration === opt.minutes ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Type */}
            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-3">Meeting Type</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {meetingTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button key={type.id} onClick={() => updateField("type", type.id)} type="button" className={`p-6 rounded-2xl border-2 ${meetingData.type === type.id ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}>
                      <Icon className="w-8 h-8 mx-auto mb-3 text-cyan-400" />
                      <p className={`${meetingData.type === type.id ? 'text-cyan-400' : 'text-gray-300'} font-medium`}>{type.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <input type="text" value={meetingData.venue} onChange={(e) => updateField("venue", e.target.value)} placeholder="Meeting link or location" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white" />
          </div>

          <div className="text-center">
            <button onClick={submitMeeting} disabled={isSubmitting} className={`px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold text-xl rounded-3xl ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}>
              {isSubmitting ? "Scheduling & Sending Emails..." : "Schedule Meeting"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-2 space-y-8">
          {/* Participants */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl"><Users className="w-6 h-6 text-white" /></div>
              <h2 className="text-2xl font-bold text-white">Participants</h2>
            </div>
            <div className="space-y-4">
              {meetingData.participants.map((p, i) => (
                <div key={i} className="flex gap-3">
                  <input value={p} onChange={(e) => updateParticipant(i, e.target.value)} placeholder="participant@example.com" className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white" />
                  {meetingData.participants.length > 1 && (
                    <button onClick={() => removeParticipant(i)} className="p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addParticipant} className="w-full p-4 bg-white/10 hover:bg-white/20 text-gray-300 rounded-2xl flex items-center justify-center gap-3">
                <Plus className="w-5 h-5" /> Add Participant
              </button>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Upcoming Meetings</h3>
            {meetings.length === 0 ? <p className="text-gray-400">No meetings scheduled yet.</p> : (
              <ul className="space-y-3">
                {meetings.map(m => (
                  <li key={m.id} className="p-3 bg-white/10 rounded-2xl text-white">
                    <div className="font-bold">{m.title || "Untitled"}</div>
                    <div className="text-gray-300 text-sm">{m.selectedDate} at {m.selectedTime}</div>
                    <div className="text-gray-400 text-xs mt-1">{m.venue}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
