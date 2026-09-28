import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PelangganForm from "@/components/pelanggan-form";

export default async function PelangganEditPage({ params }: { params: { id: string } }) {
  const pelanggan = await prisma.pelanggan.findUnique({ where: { id: params.id } });
  if (!pelanggan) notFound();

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Edit Pelanggan</h1>
      <div className="mt-6">
        <PelangganForm
          pelangganId={pelanggan.id}
          initialValues={{
            nama: pelanggan.nama,
            alamat: pelanggan.alamat,
            latitude: String(pelanggan.latitude),
            longitude: String(pelanggan.longitude),
            noHp: pelanggan.noHp,
          }}
        />
      </div>
    </div>
  );
}
