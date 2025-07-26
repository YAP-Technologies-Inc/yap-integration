// src/context/UserContext.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext<{
  userId: string | null;
  setUserId: (id: string | null) => void;
}>({
  userId: null,
  setUserId: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userId');
    if (stored) setUserId(stored);
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => useContext(UserContext);
