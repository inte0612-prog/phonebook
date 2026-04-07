import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Secure Phonebook | Facebook Style Contact Manager',
  description: 'AES-256 암호화기술을 적용한 보안 중심의 페이스북 스타일 전화번호부 서비스입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} min-h-screen bg-fb-bg text-fb-foreground`}>
        {children}
      </body>
    </html>
  );
}
