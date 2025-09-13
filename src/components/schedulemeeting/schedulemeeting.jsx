"use client"
import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MapPin, Video, Users, Plus, X, Check, MessageSquare } from 'lucide-react';

export default function ScheduleMeeting() {
  const [meetingData, setMeetingData] = useState({
    title: '',
    agenda: '',
    selectedDate: '',
    selectedTime: '',
    duration: 30,
    type: 'online',
    venue: '',
    participants: [''],
    hostName: '',
    hostEmail: '',
    contactNumber: '',
    importance: 'normal',
    isRecurring: false,
    frequency: 'weekly'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field, value) => {
    setMeetingData(prev => ({ ...prev, [field]: value }));
  };

  const addParticipant = () => {
    setMeetingData(prev => ({
      ...prev,
      participants: [...prev.participants, '']
    }));
  };

  const removeParticipant = (index) => {
    if (meetingData.participants.length > 1) {
      setMeetingData(prev => ({
        ...prev,
        participants: prev.participants.filter((_, i) => i !== index)
      }));
    }
  };

  const updateParticipant = (index, email) => {
    setMeetingData(prev => ({
      ...prev,
      participants: prev.participants.map((participant, i) => 
        i === index ? email : participant
      )
    }));
  };

  const submitMeeting = () => {
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const availableTimes = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  const durationOptions = [
    { minutes: 15, label: '15 min' },
    { minutes: 30, label: '30 min' }

  ]
  const meetingTypes = [
    { id: 'online', icon: Video, name: 'Video Call', color: 'from-blue-500 to-cyan-500' },
      ];

  return (
    <div className="min-h-screen bg-black-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      {/* Success Notification */}
      {isSubmitted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-400/30 rounded-3xl p-8 text-center max-w-md w-full">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Success!</h3>
            <p className="text-green-200 text-lg">Your meeting has been scheduled successfully.</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
            Schedule Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Meeting
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create and organize your meetings with ease. Set the date, invite participants, and get everyone connected.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-8">
            {/* Basic Information */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Meeting Information</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-3">Meeting Title</label>
                  <input
                    type="text"
                    value={meetingData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Enter your meeting title"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-3">Meeting Agenda</label>
                  <textarea
                    value={meetingData.agenda}
                    onChange={(e) => updateField('agenda', e.target.value)}
                    placeholder="Describe the meeting purpose and agenda"
                    rows={4}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Date</label>
                    <input
                      type="date"
                      value={meetingData.selectedDate}
                      onChange={(e) => updateField('selectedDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-medium mb-3">Time</label>
                    <select
                      value={meetingData.selectedTime}
                      onChange={(e) => updateField('selectedTime', e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    >
                      <option value="" className="bg-gray-800">Choose time</option>
                      {availableTimes.map(time => (
                        <option key={time} value={time} className="bg-gray-800">{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-medium mb-4">Duration</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {durationOptions.map(option => (
                      <button
                        key={option.minutes}
                        onClick={() => updateField('duration', option.minutes)}
                        className={`p-3 rounded-xl font-medium transition-all duration-300 ${
                          meetingData.duration === option.minutes
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Type */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Meeting Type</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {meetingTypes.map(type => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => updateField('type', type.id)}
                      className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                        meetingData.type === type.id
                          ? `border-cyan-400 bg-gradient-to-r ${type.color}/20`
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <IconComponent className={`w-8 h-8 mx-auto mb-3 ${
                        meetingData.type === type.id ? 'text-cyan-400' : 'text-gray-400'
                      }`} />
                      <p className={`font-medium ${
                        meetingData.type === type.id ? 'text-cyan-400' : 'text-gray-300'
                      }`}>
                        {type.name}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-3">
                  {meetingData.type === 'online' ? 'Meeting Link or Platform' :
                   meetingData.type === 'call' ? 'Phone Number' : 'Meeting Location'}
                </label>
                <input
                  type="text"
                  value={meetingData.venue}
                  onChange={(e) => updateField('venue', e.target.value)}
                  placeholder={
                    meetingData.type === 'online' ? 'https://zoom.us/j/123456789' :
                    meetingData.type === 'call' ? '+1 (555) 123-4567' :
                    'Conference Room A, Building 1'
                  }
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-8">
            {/* Host Details */}
         

            {/* Participants */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Participants</h2>
              </div>
              
              <div className="space-y-4">
                {meetingData.participants.map((participant, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="email"
                      value={participant}
                      onChange={(e) => updateParticipant(index, e.target.value)}
                      placeholder="participant@example.com"
                      className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    />
                    {meetingData.participants.length > 1 && (
                      <button
                        onClick={() => removeParticipant(index)}
                        className="p-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={addParticipant}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 text-gray-300 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  Add Participant
                </button>
              </div>
            </div>

            {/* Additional Options */}
     
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-12">
          <button
            onClick={submitMeeting}
            className="px-12 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
          >
            Schedule Meeting
          </button>
        </div>
      </div>
    </div>
  );
}