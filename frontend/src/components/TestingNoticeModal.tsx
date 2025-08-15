'use client';

import React, { useEffect, useState } from 'react';

export default function TestingNoticeModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem('seen_testing_notice');
    if (!hasSeenNotice) {
      setIsVisible(true);
    }
  }, []);

  const closeModal = () => {
    localStorage.setItem('seen_testing_notice', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          👋  YAP is in Testing Mode
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          You’re using an early test version of our app. If you see any bugs,
          broken features, or error messages, please let us know! Don’t worry, we are working hard to improve the experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://discord.com/invite/6uZFtMhM2z"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#5865F2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#4752C4] transition"
          >
            Join our Discord
          </a>
          {/* <a
            href="mailto:"
            className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
          >
            Email Support
          </a> */}
        </div>

        <button
          onClick={closeModal}
          className="mt-4 text-sm text-gray-500 underline hover:text-gray-700 hover:cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
