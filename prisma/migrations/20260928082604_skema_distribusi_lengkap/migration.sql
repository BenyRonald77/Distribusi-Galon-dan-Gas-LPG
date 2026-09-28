-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "noHp" TEXT NOT NULL,
    "pelangganTetap" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Produk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "varian" TEXT,
    "harga" INTEGER NOT NULL,
    "depositGalon" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Kurir" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pesanan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pelangganId" TEXT NOT NULL,
    "kurirId" TEXT,
    "tanggal" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BARU',
    "urutanRute" INTEGER,
    "galonKosongDiambil" INTEGER,
    "depositDiterima" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pesanan_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pesanan_kurirId_fkey" FOREIGN KEY ("kurirId") REFERENCES "Kurir" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PesananItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pesananId" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" INTEGER NOT NULL,
    CONSTRAINT "PesananItem_pesananId_fkey" FOREIGN KEY ("pesananId") REFERENCES "Pesanan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PesananItem_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "Produk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalonPinjaman" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pelangganId" TEXT NOT NULL,
    "jumlahDipinjam" INTEGER NOT NULL DEFAULT 0,
    "depositTerkumpul" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GalonPinjaman_pelangganId_fkey" FOREIGN KEY ("pelangganId") REFERENCES "Pelanggan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Pelanggan_nama_idx" ON "Pelanggan"("nama");

-- CreateIndex
CREATE INDEX "Pesanan_tanggal_status_idx" ON "Pesanan"("tanggal", "status");

-- CreateIndex
CREATE INDEX "Pesanan_kurirId_tanggal_idx" ON "Pesanan"("kurirId", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "GalonPinjaman_pelangganId_key" ON "GalonPinjaman"("pelangganId");
