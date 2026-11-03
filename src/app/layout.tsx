import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniFlow AI — Spec-Driven Product & Application Builder',
  description:
    'Turn product specifications into Living PRDs, Multi-Page UI/UX Designs, Full-Stack Applications, and Automated Sprint Plans in minutes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F7FC] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
