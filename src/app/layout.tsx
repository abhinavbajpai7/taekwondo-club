import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { RegisterServiceWorker } from '@/components/pwa/register-sw';

export const metadata: Metadata = {
  title: 'Taekwondo Club — Attendance & Fees PWA',
  description: 'Digital attendance register, fee tracking and student portal for martial arts academy.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TKD Club',
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
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="h-full flex flex-col font-sans antialiased bg-slate-950 text-slate-100 selection:bg-red-500/30">
        <AuthProvider>
          <RegisterServiceWorker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
