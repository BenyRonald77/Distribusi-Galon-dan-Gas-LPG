import { prisma } from "@/lib/prisma";
import KurirForm from "@/components/kurir-form";
import DeleteButton from "@/components/delete-button";

export default async function KurirPage() {
  const kurirList = await prisma.kurir.findMany({ orderBy: { nama: "asc" } });

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Kurir</h1>
      <p className="mt-1 text-sm text-ink-soft">{kurirList.length} kurir terdaftar</p>

      <div className="mt-6">
        <KurirForm />
      </div>

      {kurirList.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-medium text-ink">Belum ada kurir.</p>
          <p className="mt-1 text-sm text-ink-soft">Tambahkan kurir di atas sebelum membuat rute pengantaran.</p>
        </div>
      ) : (
        <div className="card mt-6 divide-y divide-line">
          {kurirList.map((k) => (
            <div key={k.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{k.nama}</p>
                <p className="text-sm text-ink-soft">{k.noHp}</p>
              </div>
              <DeleteButton url={`/api/kurir/${k.id}`} confirmMessage={`Hapus kurir "${k.nama}"?`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
