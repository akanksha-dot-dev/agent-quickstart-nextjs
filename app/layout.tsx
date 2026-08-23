import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'EdexConvoAI — Adaptive Voice Tutor | Powered by Agora',
  description:
    'Real-time adaptive AI tutoring platform. Study Partner, Viva Prep, Quiz Mode, and Revision Sprint — all through natural voice conversation powered by Agora Conversational AI Engine.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning on <html>+<body>: browser extensions (Grammarly, js-focus-visible)
    // inject attributes after SSR that React cannot predict. This silences ONLY these two root
    // elements and does not suppress warnings in any child component.
    // See: https://nextjs.org/docs/messages/react-hydration-error
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
