'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole, Student } from '../types';
import { db } from '../db';

interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  student?: Student | null;
}

interface AdminCredentials {
  email: string;
  password: string;
}

const DEFAULT_ADMIN_CREDS: AdminCredentials = {
  email: 'instructer@rta.club',
  password: 'RTA1234',
};

export function getAdminCredentials(): AdminCredentials {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tkd_admin_credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email && parsed.password) return parsed;
      } catch {
        // fallback
      }
    }
  }
  return DEFAULT_ADMIN_CREDS;
}

export function saveAdminCredentials(creds: AdminCredentials) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tkd_admin_credentials', JSON.stringify(creds));
  }
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsStudent: (studentCode: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminAccount: (email: string, pass: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check saved session
    const saved = localStorage.getItem('tkd_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        localStorage.removeItem('tkd_auth_session');
      }
    }
    setLoading(false);
  }, []);

  const loginAsAdmin = async (email: string, pass: string) => {
    if (!email || !pass) {
      return { success: false, error: 'Please provide both admin username and password.' };
    }

    const currentCreds = getAdminCredentials();
    const cleanEmail = email.trim().toLowerCase();
    const targetEmail = currentCreds.email.trim().toLowerCase();

    if (cleanEmail !== targetEmail || pass !== currentCreds.password) {
      return { success: false, error: 'Invalid admin username or password.' };
    }

    const adminUser: AuthUser = {
      id: 'admin-1',
      email: currentCreds.email,
      role: 'admin',
    };

    setUser(adminUser);
    localStorage.setItem('tkd_auth_session', JSON.stringify(adminUser));
    return { success: true };
  };

  const loginAsStudent = async (code: string, pass: string) => {
    if (!code) {
      return { success: false, error: 'Please enter your Student ID.' };
    }
    if (!pass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const students = await db.getStudents();
    const found = students.find(
      (s) => s.student_code.toUpperCase() === cleanCode || s.id === cleanCode
    );

    if (!found) {
      return {
        success: false,
        error: `Student with ID "${cleanCode}" not found. Please check with your instructor.`,
      };
    }

    const expectedPassword = found.password || '1234';
    if (pass !== expectedPassword) {
      return {
        success: false,
        error: 'Incorrect student password. Please verify and try again.',
      };
    }

    const studentUser: AuthUser = {
      id: `user-${found.id}`,
      role: 'student',
      student: found,
    };

    setUser(studentUser);
    localStorage.setItem('tkd_auth_session', JSON.stringify(studentUser));
    return { success: true };
  };

  const updateAdminAccount = (newEmail: string, newPass: string) => {
    const updated = { email: newEmail.trim(), password: newPass };
    saveAdminCredentials(updated);
    if (user?.role === 'admin') {
      const updatedUser = { ...user, email: updated.email };
      setUser(updatedUser);
      localStorage.setItem('tkd_auth_session', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tkd_auth_session');
    router.push('/login');
  };

  // Route protection
  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname.startsWith('/admin') || pathname.startsWith('/student')) {
        router.push('/login');
      }
    } else {
      if (user.role === 'student' && pathname.startsWith('/admin')) {
        router.push('/student');
      }
      if (pathname === '/login') {
        router.push(user.role === 'admin' ? '/admin' : '/student');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAsAdmin,
        loginAsStudent,
        updateAdminAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
