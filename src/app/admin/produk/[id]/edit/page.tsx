import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProdukForm from "@/components/produk-form";
import type { JenisProduk } from "@/lib/constants";

export default async function ProdukEditPage({ params }: { params: { id: string } }) {
  const produk = await prisma.produk.findUnique({ where: { id: params.id } });
  if (!produk) notFound();

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Edit Produk</h1>
      <div className="mt-6">
        <ProdukForm
          produkId={produk.id}
          initialValues={{
            nama: produk.nama,
            jenis: produk.jenis as JenisProduk,
            varian: produk.varian ?? "",
            harga: String(produk.harga),
            depositGalon: produk.depositGalon ? String(produk.depositGalon) : "",
          }}
        />
      </div>
    </div>
  );
}
