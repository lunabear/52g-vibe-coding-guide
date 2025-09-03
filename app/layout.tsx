import type { Metadata } from 'next';
import './globals.css';
import { PRDProvider } from '@/contexts/PRDContext';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: "PLAI MAKER - Plan your project with AI",
  description: "MISO AI and experts help you elaborate your idea systematically.",
};

export const viewport = {
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
    <html lang="en">
      <body>
        <PRDProvider>
          {children}
        </PRDProvider>
        <Toaster />
      </body>
    </html>
  );
}