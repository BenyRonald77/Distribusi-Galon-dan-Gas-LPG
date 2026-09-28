// Nilai-nilai berikut disimpan sebagai String di SQLite (lihat catatan di
// prisma/schema.prisma) dan divalidasi lewat Zod di src/lib/validation.ts.

export const JENIS_PRODUK = ["GALON", "LPG"] as const;
export type JenisProduk = (typeof JENIS_PRODUK)[number];

export const STATUS_PESANAN = ["BARU", "DIPROSES", "DIANTAR", "SELESAI"] as const;
export type StatusPesanan = (typeof STATUS_PESANAN)[number];

export const STATUS_LABEL: Record<StatusPesanan, string> = {
  BARU: "Baru",
  DIPROSES: "Diproses",
  DIANTAR: "Diantar",
  SELESAI: "Selesai",
};

export const JENIS_LABEL: Record<JenisProduk, string> = {
  GALON: "Galon",
  LPG: "Gas LPG",
};
