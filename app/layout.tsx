import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';  // 确保这行存在

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '通义万相视频换人',
  description: '基于阿里云通义万相的视频换人Web应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
