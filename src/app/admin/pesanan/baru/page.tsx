import { prisma } from "@/lib/prisma";
import PesananForm from "@/components/pesanan-form";
import type { JenisProduk } from "@/lib/constants";

export default async function PesananBaruPage() {
  const [pelangganList, produkList] = await Promise.all([
    prisma.pelanggan.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true, alamat: true } }),
    prisma.produk.findMany({ orderBy: { nama: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Buat Pesanan Baru</h1>
      <div className="mt-6">
        <PesananForm
          pelangganList={pelangganList}
          produkList={produkList.map((p) => ({ ...p, jenis: p.jenis as JenisProduk }))}
        />
      </div>
    </div>
  );
}
