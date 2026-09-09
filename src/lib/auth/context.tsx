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

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginAsAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsStudent: (studentCode: string) => Promise<{ success: boolean; error?: string }>;
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
    // In production with Supabase, call supabase.auth.signInWithPassword
    // For universal out-of-the-box demo/dev:
    if (!email || !pass) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    const adminUser: AuthUser = {
      id: 'admin-1',
      email: email,
      role: 'admin',
    };

    setUser(adminUser);
    localStorage.setItem('tkd_auth_session', JSON.stringify(adminUser));
    return { success: true };
  };

  const loginAsStudent = async (code: string) => {
    if (!code) {
      return { success: false, error: 'Please enter your Student Code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const students = await db.getStudents();
    const found = students.find(
      (s) => s.student_code.toUpperCase() === cleanCode || s.id === cleanCode
    );

    if (!found) {
      return {
        success: false,
        error: `Student with code "${cleanCode}" not found. Try STU001 or check with your instructor.`,
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
        // Prevent student from accessing admin routes
        router.push('/student');
      }
      if (pathname === '/login') {
        router.push(user.role === 'admin' ? '/admin' : '/student');
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, loginAsAdmin, loginAsStudent, logout }}>
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
