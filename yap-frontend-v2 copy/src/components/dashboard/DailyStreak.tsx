'use client';

import React, { useState, useEffect } from 'react';
import { TablerCheck } from '@/icons';
import flame from '@/assets/flame.png';

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const STORAGE_KEY = 'login-days';
const TOTAL_STREAK_KEY = 'total-streak';
const HIGHEST_STREAK_KEY = 'highest-streak';
const LAST_LOGIN_KEY = 'last-login-day';

const getStartOfWeek = () => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

export default function DailyStreak() {
  const [completedDays, setCompletedDays] = useState<boolean[]>(
    Array(7).fill(false)
  );
  const [totalStreak, setTotalStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const todayStr = today.toDateString();

  useEffect(() => {
    const thisWeek = getStartOfWeek();
    const saved = localStorage.getItem(STORAGE_KEY);
    const lastLoginStr = localStorage.getItem(LAST_LOGIN_KEY);
    const storedTotal = parseInt(
      localStorage.getItem(TOTAL_STREAK_KEY) || '0',
      10
    );
    const storedHighest = parseInt(
      localStorage.getItem(HIGHEST_STREAK_KEY) || '0',
      10
    );

    // 1) Compute new total streak
    let newTotal = 1;
    if (lastLoginStr) {
      const lastLogin = new Date(lastLoginStr);
      const diffTime = today.getTime() - lastLogin.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) newTotal = storedTotal + 1;
      else if (diffDays === 0) newTotal = storedTotal;
      else newTotal = 1;
    }

    // 2) Persist total & last login locally
    if (lastLoginStr !== todayStr) {
      localStorage.setItem(TOTAL_STREAK_KEY, newTotal.toString());
      localStorage.setItem(LAST_LOGIN_KEY, todayStr);
    }
    setTotalStreak(newTotal);

    // 3) Compute & persist highest streak locally
    const newHighest = Math.max(storedHighest, newTotal);
    if (newHighest !== storedHighest) {
      localStorage.setItem(HIGHEST_STREAK_KEY, newHighest.toString());
    }
    setHighestStreak(newHighest);

    // 4) Sync up to server
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`/api/user-stats/${userId}/streak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStreak: newTotal,
          highestStreak: newHighest,
        }),
      })
        .then((res) => {
          if (!res.ok) console.error('Failed to sync streak:', res.statusText);
        })
        .catch((err) => console.error('Error syncing streak:', err));
    }

    // 5) Weekly check‑in tracking
    if (saved) {
      const parsed = JSON.parse(saved) as {
        weekStart: string;
        days: boolean[];
      };
      if (parsed.weekStart === thisWeek) {
        const updated = [...parsed.days];
        updated[todayIndex] = true;
        setCompletedDays(updated);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ weekStart: thisWeek, days: updated })
        );
        return;
      }
    }

    // 6) Fresh week
    const fresh = Array(7).fill(false);
    fresh[todayIndex] = true;
    setCompletedDays(fresh);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ weekStart: thisWeek, days: fresh })
    );
  }, []);

  return (
    <div className="bg-secondary w-full rounded-xl shadow px-6 py-4 flex flex-col border-b-2 border-gray-300 relative">
      {/* Header with flame icon and streak counts */}
      <div className="flex items-center gap-2 text-white mb-4">
        <img src={flame.src} alt="Flame icon" className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Daily Streak</h3>
        <div className="ml-auto flex items-center gap-2">
          <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            {totalStreak}
          </div>
          <span className="text-sm">/ Best: {highestStreak}</span>
        </div>
      </div>

      {/* Day Circles */}
      <div className="w-full flex justify-around">
        {days.map((day, idx) => {
          const done = completedDays[idx];
          const isToday = idx === todayIndex;
          return (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ring-white opacity-50 ring-2
                  ${
                    done ? 'bg-secondary text-white' : 'bg-secondary opacity-60'
                  }
                  ${isToday ? 'ring-2 ring-tertiary' : ''}
                `}
              >
                {done && <TablerCheck className="w-5 h-5 text-white" />}
              </div>
              <span className="text-xs text-white mt-1">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
