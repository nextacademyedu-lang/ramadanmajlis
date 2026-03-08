import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  field: string;
  phone: string;
  photo_url: string;
  score: number;
  company?: string;
  linkedin_url?: string;
}

interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('event_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('event_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('event_user');
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
