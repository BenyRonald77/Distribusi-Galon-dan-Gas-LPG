# Distribusi Galon Air & Gas LPG

Aplikasi web untuk mengelola pesanan pelanggan tetap, merutekan pengantaran kurir secara otomatis berdasarkan lokasi, dan melacak galon kosong yang masih dipinjam pelanggan beserta depositnya. Lihat [`PRD.md`](./PRD.md) untuk dokumen kebutuhan produk lengkap.

## Fitur Utama

- **CRUD Pelanggan Tetap** - data pelanggan lengkap dengan alamat dan koordinat lokasi (input manual, atau tombol "gunakan lokasi saat ini").
- **CRUD Produk** - galon berbagai ukuran (dengan nominal deposit) dan gas LPG 3kg/12kg beserta harga.
- **Manajemen Kurir** - tambah/hapus data kurir, beserta tautan dashboard rute yang bisa dibagikan.
- **Pembuatan Pesanan** - pilih pelanggan dan produk, total dihitung otomatis.
- **Rute Pengantaran Otomatis** - assign beberapa pesanan ke seorang kurir, urutan kunjungan dihitung otomatis dengan algoritma nearest-neighbor berbasis jarak (haversine) dari titik gudang.
- **Update Status & Pelacakan Galon+Deposit** - tandai pesanan Diantar/Selesai; saat menyelesaikan pesanan galon, catat galon kosong yang diambil kembali dan deposit yang diterima/dikembalikan, otomatis memperbarui saldo pinjaman galon pelanggan.
- **Dashboard Rute Kurir** - halaman publik (tanpa login terpisah) yang dioptimalkan untuk HP, menampilkan rute kurir hari ini terurut lengkap dengan alamat dan item pesanan.
- **Laporan** - laporan jumlah & nilai pesanan per rentang tanggal, serta laporan galon kosong outstanding per pelanggan beserta total deposit yang dipegang.

## Stack Teknis

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM + SQLite (`prisma/dev.db`, tanpa dependensi database eksternal)
- Zod untuk validasi
- Sesi login admin sederhana (cookie httpOnly ditandatangani HMAC-SHA256), bukan NextAuth - lihat `PRD.md` bagian 8 untuk alasannya.

## Menjalankan Secara Lokal

1. Install dependensi:

   ```bash
   npm install
   ```

2. Salin file environment (nilai default sudah cukup untuk pengembangan lokal):

   ```bash
   cp .env.example .env
   ```

3. Buat database SQLite & jalankan migrasi:

   ```bash
   npx prisma migrate dev
   ```

4. Isi data contoh (10 pelanggan, 4 produk, 1 kurir, beberapa pesanan dengan status bervariasi):

   ```bash
   npm run db:seed
   ```

5. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Kredensial Admin Default (hasil seed)

| Username | Password |
|---|---|
| `admin` | `galon123` |

Ganti password ini sebelum digunakan di lingkungan produksi (buat ulang hash lewat `prisma/seed.ts` atau langsung lewat Prisma Studio).

## Halaman Penting

- `/login` - login admin/dispatcher.
- `/admin` - beranda panel dispatcher (butuh login).
- `/admin/pelanggan`, `/admin/produk`, `/admin/kurir` - manajemen data master.
- `/admin/pesanan` - daftar & pembuatan pesanan.
- `/admin/rute` - assign pesanan ke kurir + hitung rute otomatis.
- `/admin/laporan` - laporan pesanan & galon outstanding.
- `/kurir/[kurirId]` - dashboard rute kurir, **tanpa login**, dibagikan sebagai tautan oleh dispatcher (lihat `PRD.md` bagian 9 untuk penjelasan simplifikasi ini).

## Algoritma Rute Otomatis (Ringkasan)

Saat dispatcher memilih sekumpulan pesanan berstatus `BARU` dan menugaskannya ke seorang kurir:

1. Titik awal adalah koordinat gudang tetap (`src/lib/config.ts`).
2. Pada tiap langkah, sistem menghitung jarak garis lurus (rumus **haversine**) dari titik saat ini ke setiap pelanggan yang belum dikunjungi, lalu memilih yang terdekat (**nearest-neighbor**).
3. Proses diulang sampai semua pesanan terpilih memiliki urutan.
4. Hasil urutan disimpan ke field `urutanRute` pada tiap pesanan, `kurirId` diisi, dan status berubah menjadi `DIPROSES`.

Implementasi ada di `src/lib/route.ts`. Ini adalah heuristik sederhana (bukan exact TSP solver) dan jarak dihitung garis lurus, bukan jarak tempuh jalan raya sesungguhnya - lihat `PRD.md` bagian 9 (Batasan & Asumsi) untuk detail.

## Struktur Proyek Singkat

```
prisma/schema.prisma   Skema database (SQLite)
prisma/seed.ts          Seed data contoh
src/app/                Halaman & API routes (Next.js App Router)
src/components/         Komponen UI yang dipakai ulang
src/lib/                Logika bersama: prisma client, validasi Zod, algoritma rute, sesi login
middleware.ts (src/)    Proteksi rute /admin/*
PRD.md                  Dokumen kebutuhan produk
```

## Skill antislop

Repo ini memakai skill `antislop` dan `antislop-ui` (`.agents/skills/`) untuk menjaga UI tetap punya identitas visual yang disengaja, bukan tampilan generik hasil AI. Lihat `CLAUDE.md`.

## Kontributor

- BenyRonald77
