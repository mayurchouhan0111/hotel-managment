import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffUser, StaffRole } from '../types/hotel';
import { INITIAL_STAFF_USERS } from '../firebase/seed';
import {
  subscribeStaffUsers,
  authenticateStaffUserInFirestore,
  fetchStaffUsersFromFirestore,
} from '../firebase/firestore';

interface AuthContextType {
  currentUser: StaffUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (userId: string) => Promise<void>;
  logout: () => void;
  switchStaffUser: (user: StaffUser) => void;
  hasRole: (allowedRoles: StaffRole[]) => boolean;
  availableStaffUsers: StaffUser[];
}

const STORAGE_USER_KEY = 'grand_horizon_staff_user';
const STORAGE_AUTH_KEY = 'grand_horizon_is_authenticated';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [availableStaffUsers, setAvailableStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
      return savedAuth === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved staff user', e);
    }
    const savedAuth = localStorage.getItem(STORAGE_AUTH_KEY);
    return savedAuth === 'true' ? INITIAL_STAFF_USERS[0] : null;
  });

  // Subscribe to real-time staffUsers collection from Firestore
  useEffect(() => {
    const unsubscribe = subscribeStaffUsers((users) => {
      if (users && users.length > 0) {
        setAvailableStaffUsers(users);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (currentUser && isAuthenticated) {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(currentUser));
        localStorage.setItem(STORAGE_AUTH_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_USER_KEY);
        localStorage.setItem(STORAGE_AUTH_KEY, 'false');
      }
    } catch (e) {
      console.warn('Failed to persist auth state', e);
    }
  }, [currentUser, isAuthenticated]);

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Authenticate directly against Firestore backend staff collection
    const result = await authenticateStaffUserInFirestore(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return {
      success: false,
      error: result.error || 'Authentication failed against Firebase backend database.',
    };
  };

  const quickLogin = async (userId: string) => {
    // Find in active staff state or fetch from Firestore
    let targetUser = availableStaffUsers.find((u) => u.id === userId || u.role === userId);
    if (!targetUser) {
      const firestoreUsers = await fetchStaffUsersFromFirestore();
      targetUser = firestoreUsers.find((u) => u.id === userId || u.role === userId);
    }
    if (targetUser) {
      setCurrentUser(targetUser);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.setItem(STORAGE_AUTH_KEY, 'false');
    } catch (e) {
      console.warn('Failed to clear auth storage', e);
    }
  };

  const switchStaffUser = (user: StaffUser) => {
    setCurrentUser(user);
  };

  const hasRole = (allowedRoles: StaffRole[]): boolean => {
    if (!currentUser || !isAuthenticated) return false;
    if (currentUser.role === 'admin') return true; // Admin has all access
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        quickLogin,
        logout,
        switchStaffUser,
        hasRole,
        availableStaffUsers,
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
