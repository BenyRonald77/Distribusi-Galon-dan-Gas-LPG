import { z } from "zod";
import { JENIS_PRODUK, STATUS_PESANAN } from "@/lib/constants";

export const pelangganSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  alamat: z.string().trim().min(1, "Alamat wajib diisi"),
  latitude: z.coerce.number().min(-90).max(90, "Latitude tidak valid"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude tidak valid"),
  noHp: z.string().trim().min(1, "No HP wajib diisi"),
});

export const produkSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama produk wajib diisi"),
    jenis: z.enum(JENIS_PRODUK),
    varian: z.string().trim().optional().or(z.literal("")),
    harga: z.coerce.number().int().positive("Harga harus lebih dari 0"),
    depositGalon: z.coerce.number().int().nonnegative().optional().nullable(),
  })
  .refine((data) => data.jenis !== "GALON" || (data.depositGalon ?? 0) > 0, {
    message: "Deposit galon wajib diisi untuk produk jenis galon",
    path: ["depositGalon"],
  });

export const kurirSchema = z.object({
  nama: z.string().trim().min(1, "Nama kurir wajib diisi"),
  noHp: z.string().trim().min(1, "No HP wajib diisi"),
});

export const pesananItemSchema = z.object({
  produkId: z.string().min(1),
  jumlah: z.coerce.number().int().positive("Jumlah harus lebih dari 0"),
});

export const pesananSchema = z.object({
  pelangganId: z.string().min(1, "Pilih pelanggan"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  items: z.array(pesananItemSchema).min(1, "Minimal tambahkan 1 item produk"),
});

export const assignRuteSchema = z.object({
  kurirId: z.string().min(1, "Pilih kurir"),
  pesananIds: z.array(z.string()).min(1, "Pilih minimal 1 pesanan"),
});

export const selesaikanPesananSchema = z.object({
  status: z.enum(STATUS_PESANAN),
  galonKosongDiambil: z.coerce.number().int().nonnegative().optional(),
  depositDiterima: z.coerce.number().int().optional(),
});
