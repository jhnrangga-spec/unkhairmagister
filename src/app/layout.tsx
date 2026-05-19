import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "SIM Magister — Pendaftaran S2",
  description: "Pendaftaran mahasiswa baru dan wisuda program Magister (S2)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t bg-white py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Sistem Informasi Pendaftaran Magister
        </footer>
      </body>
    </html>
  );
}
