import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Distribusi Galon & Gas LPG",
  description:
    "Sistem manajemen pesanan, rute kurir, dan pelacakan galon kosong untuk usaha distribusi galon air dan gas LPG.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
