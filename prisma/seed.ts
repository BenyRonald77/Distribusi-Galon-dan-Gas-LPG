import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "galon123";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  // Akun admin
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.admin.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: { username: ADMIN_USERNAME, passwordHash },
  });
  console.log(`Akun admin siap. Username: ${ADMIN_USERNAME} / Password: ${ADMIN_PASSWORD}`);

  // Bersihkan data transaksional lama agar seed bisa dijalankan berulang
  // tanpa membuat data duplikat (aman untuk lingkungan pengembangan).
  await prisma.pesananItem.deleteMany();
  await prisma.pesanan.deleteMany();
  await prisma.galonPinjaman.deleteMany();
  await prisma.kurir.deleteMany();
  await prisma.produk.deleteMany();
  await prisma.pelanggan.deleteMany();

  // 10 pelanggan tetap dengan koordinat berbeda-beda di seputar Jakarta Pusat,
  // agar algoritma rute punya variasi jarak yang realistis dari gudang.
  const dataPelanggan = [
    { nama: "Andi Wijaya", alamat: "Jl. Melati No. 12, Menteng", latitude: -6.1953, longitude: 106.8271, noHp: "081234500001" },
    { nama: "Siti Rahayu", alamat: "Jl. Kenanga No. 5, Cikini", latitude: -6.1865, longitude: 106.839, noHp: "081234500002" },
    { nama: "Budi Santoso", alamat: "Jl. Mawar No. 8, Kemayoran", latitude: -6.1652, longitude: 106.8451, noHp: "081234500003" },
    { nama: "Dewi Lestari", alamat: "Jl. Anggrek No. 21, Cempaka Putih", latitude: -6.1745, longitude: 106.8663, noHp: "081234500004" },
    { nama: "Agus Salim", alamat: "Jl. Flamboyan No. 3, Tanah Abang", latitude: -6.1984, longitude: 106.8148, noHp: "081234500005" },
    { nama: "Rina Marlina", alamat: "Jl. Cempaka No. 9, Senen", latitude: -6.1806, longitude: 106.8437, noHp: "081234500006" },
    { nama: "Hendra Gunawan", alamat: "Jl. Dahlia No. 14, Gambir", latitude: -6.1701, longitude: 106.8236, noHp: "081234500007" },
    { nama: "Yuni Kartika", alamat: "Jl. Teratai No. 6, Sawah Besar", latitude: -6.1553, longitude: 106.8259, noHp: "081234500008" },
    { nama: "Joko Prasetyo", alamat: "Jl. Kamboja No. 17, Kelapa Gading", latitude: -6.1588, longitude: 106.9056, noHp: "081234500009" },
    { nama: "Maya Puspita", alamat: "Jl. Bougenville No. 2, Pademangan", latitude: -6.1301, longitude: 106.8347, noHp: "081234500010" },
  ];

  const pelanggan = await Promise.all(
    dataPelanggan.map((p) => prisma.pelanggan.create({ data: p }))
  );
  const byName = (nama: string) => pelanggan.find((p) => p.nama === nama)!;

  // Produk: galon dua ukuran + gas LPG dua ukuran
  const galon19 = await prisma.produk.create({
    data: { nama: "Galon 19L", jenis: "GALON", varian: "19 Liter", harga: 20000, depositGalon: 50000 },
  });
  const galon12 = await prisma.produk.create({
    data: { nama: "Galon 12L", jenis: "GALON", varian: "12 Liter", harga: 15000, depositGalon: 35000 },
  });
  const lpg3 = await prisma.produk.create({
    data: { nama: "LPG 3kg", jenis: "LPG", varian: "3 kg", harga: 22000, depositGalon: null },
  });
  const lpg12 = await prisma.produk.create({
    data: { nama: "LPG 12kg", jenis: "LPG", varian: "12 kg", harga: 155000, depositGalon: null },
  });

  // Kurir
  const kurir = await prisma.kurir.create({
    data: { nama: "Slamet Riyadi", noHp: "081298765432" },
  });

  const hariIni = daysAgo(0);
  const kemarin = daysAgo(1);
  const duaHariLalu = daysAgo(2);

  // Pesanan dengan status bervariasi untuk mendemonstrasikan seluruh alur:
  // BARU (belum dirutekan), DIPROSES (sudah dirutekan ke kurir),
  // DIANTAR (sudah diserahkan, menunggu diselesaikan), SELESAI (tuntas).

  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Dewi Lestari").id,
      tanggal: hariIni,
      status: "BARU",
      items: { create: [{ produkId: galon12.id, jumlah: 3, hargaSatuan: galon12.harga }] },
    },
  });

  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Agus Salim").id,
      tanggal: hariIni,
      status: "BARU",
      items: { create: [{ produkId: lpg3.id, jumlah: 2, hargaSatuan: lpg3.harga }] },
    },
  });

  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Joko Prasetyo").id,
      tanggal: hariIni,
      status: "BARU",
      items: {
        create: [
          { produkId: galon19.id, jumlah: 1, hargaSatuan: galon19.harga },
          { produkId: galon12.id, jumlah: 1, hargaSatuan: galon12.harga },
        ],
      },
    },
  });

  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Maya Puspita").id,
      tanggal: hariIni,
      status: "BARU",
      items: { create: [{ produkId: lpg12.id, jumlah: 1, hargaSatuan: lpg12.harga }] },
    },
  });

  // Sudah dirutekan ke kurir hari ini (simulasi hasil algoritma rute)
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Budi Santoso").id,
      tanggal: hariIni,
      status: "DIPROSES",
      kurirId: kurir.id,
      urutanRute: 2,
      items: { create: [{ produkId: lpg12.id, jumlah: 1, hargaSatuan: lpg12.harga }] },
    },
  });

  // Sudah diantar kurir, menunggu dispatcher/kurir menyelesaikan pencatatan galon
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Siti Rahayu").id,
      tanggal: hariIni,
      status: "DIANTAR",
      kurirId: kurir.id,
      urutanRute: 1,
      items: {
        create: [
          { produkId: galon19.id, jumlah: 1, hargaSatuan: galon19.harga },
          { produkId: lpg3.id, jumlah: 1, hargaSatuan: lpg3.harga },
        ],
      },
    },
  });

  // Pesanan selesai hari ini: 2 galon diantar, 1 kosong diambil kembali
  // -> masih ada 1 galon dipinjam + deposit tertahan.
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Andi Wijaya").id,
      tanggal: hariIni,
      status: "SELESAI",
      kurirId: kurir.id,
      urutanRute: 3,
      galonKosongDiambil: 1,
      depositDiterima: 50000,
      items: { create: [{ produkId: galon19.id, jumlah: 2, hargaSatuan: galon19.harga }] },
    },
  });
  await prisma.galonPinjaman.create({
    data: { pelangganId: byName("Andi Wijaya").id, jumlahDipinjam: 1, depositTerkumpul: 50000 },
  });

  // Pesanan selesai kemarin: galon belum ada yang dikembalikan sama sekali.
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Rina Marlina").id,
      tanggal: kemarin,
      status: "SELESAI",
      kurirId: kurir.id,
      urutanRute: 1,
      galonKosongDiambil: 0,
      depositDiterima: 50000,
      items: { create: [{ produkId: galon19.id, jumlah: 1, hargaSatuan: galon19.harga }] },
    },
  });
  await prisma.galonPinjaman.create({
    data: { pelangganId: byName("Rina Marlina").id, jumlahDipinjam: 1, depositTerkumpul: 50000 },
  });

  // Pesanan LPG selesai kemarin, tidak menyentuh pinjaman galon sama sekali.
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Hendra Gunawan").id,
      tanggal: kemarin,
      status: "SELESAI",
      kurirId: kurir.id,
      urutanRute: 2,
      items: { create: [{ produkId: lpg3.id, jumlah: 1, hargaSatuan: lpg3.harga }] },
    },
  });

  // Pesanan selesai 2 hari lalu dengan galon kosong sudah dikembalikan
  // seluruhnya -> tidak muncul di laporan outstanding.
  await prisma.pesanan.create({
    data: {
      pelangganId: byName("Yuni Kartika").id,
      tanggal: duaHariLalu,
      status: "SELESAI",
      kurirId: kurir.id,
      urutanRute: 1,
      galonKosongDiambil: 2,
      depositDiterima: 0,
      items: { create: [{ produkId: galon12.id, jumlah: 2, hargaSatuan: galon12.harga }] },
    },
  });
  await prisma.galonPinjaman.create({
    data: { pelangganId: byName("Yuni Kartika").id, jumlahDipinjam: 0, depositTerkumpul: 0 },
  });

  console.log(`Seed selesai: ${pelanggan.length} pelanggan, 4 produk, 1 kurir, 9 pesanan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
