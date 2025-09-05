import type { Metadata } from 'next';
import './globals.css';
import { PRDProvider } from '@/contexts/PRDContext';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: "PLAI MAKER - AI와 함께 만드는 프로젝트 기획",
  description: "MISO AI와 전문가들이 당신의 아이디어를 체계적으로 구체화해드립니다",
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
    <html lang="ko">
      <body>
        <PRDProvider>
          {children}
        </PRDProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}