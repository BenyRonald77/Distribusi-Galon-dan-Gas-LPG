import { prisma } from "@/lib/prisma";
import RuteBuilder from "@/components/rute-builder";

export default async function RutePage() {
  const kurirList = await prisma.kurir.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } });

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Rute Pengantaran Otomatis</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Pilih tanggal dan kurir, lalu tandai pesanan yang akan diantar. Urutan kunjungan dihitung otomatis
        berdasarkan jarak terdekat dari gudang.
      </p>
      <div className="mt-6">
        <RuteBuilder kurirList={kurirList} />
      </div>
    </div>
  );
}
