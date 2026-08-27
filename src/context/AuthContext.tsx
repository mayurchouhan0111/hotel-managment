import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser, StaffRole } from '../types/hotel';
import { INITIAL_STAFF_USERS } from '../firebase/seed';

interface AuthContextType {
  currentUser: StaffUser;
  switchStaffUser: (user: StaffUser) => void;
  hasRole: (allowedRoles: StaffRole[]) => boolean;
  availableStaffUsers: StaffUser[];
}

const STORAGE_KEY = 'grand_horizon_staff_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved staff user', e);
    }
    // Default to Receptionist for fast reception workflow demonstration
    return INITIAL_STAFF_USERS[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Failed to save staff user', e);
    }
  }, [currentUser]);

  const switchStaffUser = (user: StaffUser) => {
    setCurrentUser(user);
  };

  const hasRole = (allowedRoles: StaffRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Admin has all access
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchStaffUser,
        hasRole,
        availableStaffUsers: INITIAL_STAFF_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
