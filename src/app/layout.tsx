import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: 'Pro PhoneBook | Secure & Modern Contact Manager',
  description: 'AES-256 암호화기술을 적용한 보안 중심의 프리미엄 전화번호부 서비스입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
