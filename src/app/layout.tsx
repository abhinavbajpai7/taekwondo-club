import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { RegisterServiceWorker } from '@/components/pwa/register-sw';
import { SplashScreen } from '@/components/SplashScreen';

export const metadata: Metadata = {
  title: 'RTA Taekwondo Club — Attendance & Fees PWA',
  description: 'Digital attendance register, fee tracking and student portal for martial arts academy.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RTA Club',
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-900 text-slate-100">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="h-full flex flex-col font-sans antialiased bg-slate-950 text-slate-100 selection:bg-red-500/30">
        <SplashScreen />
        <AuthProvider>
          <RegisterServiceWorker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
