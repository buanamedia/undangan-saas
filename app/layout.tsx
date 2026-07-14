// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Tanda ./ artinya mencari globals.css di folder yang sama (folder app)
import SessionTimeoutProvider from "@/app/SessionTimeoutProvider"; // ⚡ Impor komponen pelindung sesi

export const metadata: Metadata = {
  title: "Modern Digital Invitation SaaS",
  description: "Buat undangan digital premium, modern, dan cepat dengan mudah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50">
        {/* ⚡ Bungkus halaman agar terproteksi auto logout secara global */}
        <SessionTimeoutProvider>
          {children}
        </SessionTimeoutProvider>
      </body>
    </html>
  );
}