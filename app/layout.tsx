import type { Metadata } from "next";
import "./globals.css";
import { PRDProvider } from '@/contexts/PRDContext';

export const metadata: Metadata = {
  title: "Idea to PRD",
  description: "당신의 아이디어를 체계적인 제품 기획서로 만들어드립니다",
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
      </body>
    </html>
  );
}