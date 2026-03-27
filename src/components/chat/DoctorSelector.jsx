// src/components/chat/DoctorSelector.jsx
'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { fetchDoctors } from '@/lib/api';

export default function DoctorSelector() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showDoctors, setShowDoctors, updateExtractedData, sendMessage } = useVoiceAgent();

  useEffect(() => {
    if (showDoctors) {
      fetchDoctors()
        .then(data => setDoctors(data.doctors))
        .catch(err => console.error('Failed to fetch doctors:', err))
        .finally(() => setLoading(false));
    }
  }, [showDoctors]);

  const handleSelectDoctor = async (doctor) => {
    updateExtractedData({ doctor: doctor.name });
    await sendMessage(`I would like to book an appointment with ${doctor.name}`);
    setShowDoctors(false);
  };

  if (!showDoctors) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={() => setShowDoctors(false)}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold">Select a Doctor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose a doctor to book your appointment</p>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            doctors.map(doctor => (
              <button
                key={doctor.id}
                onClick={() => handleSelectDoctor(doctor)}
                className="w-full p-4 text-left rounded-xl border dark:border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all"
              >
                <h4 className="font-semibold">{doctor.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                {doctor.next_available && (
                  <p className="text-xs text-green-600 mt-2">Next: {doctor.next_available[0]}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}