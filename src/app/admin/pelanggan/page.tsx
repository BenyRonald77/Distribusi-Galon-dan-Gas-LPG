import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/delete-button";

export default async function PelangganListPage() {
  const pelanggan = await prisma.pelanggan.findMany({
    orderBy: { nama: "asc" },
    include: { galonPinjaman: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Pelanggan Tetap</h1>
          <p className="mt-1 text-sm text-ink-soft">{pelanggan.length} pelanggan terdaftar</p>
        </div>
        <Link href="/admin/pelanggan/baru" className="btn-primary">
          + Tambah Pelanggan
        </Link>
      </div>

      {pelanggan.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-medium text-ink">Belum ada pelanggan tetap.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Tambahkan pelanggan pertama untuk mulai membuat pesanan dan rute pengantaran.
          </p>
          <Link href="/admin/pelanggan/baru" className="btn-primary mt-4 inline-flex">
            + Tambah Pelanggan
          </Link>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Alamat</th>
                <th className="px-4 py-3 font-medium">No HP</th>
                <th className="px-4 py-3 font-medium">Galon Dipinjam</th>
                <th className="px-4 py-3 font-medium">Deposit</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pelanggan.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-ink">{p.nama}</td>
                  <td className="max-w-xs px-4 py-3 text-ink-soft">{p.alamat}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.noHp}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.galonPinjaman && p.galonPinjaman.jumlahDipinjam > 0 ? (
                      <span className="badge bg-accent-100 text-accent-600">
                        {p.galonPinjaman.jumlahDipinjam} galon
                      </span>
                    ) : (
                      <span className="text-ink-soft/60">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.galonPinjaman && p.galonPinjaman.depositTerkumpul > 0
                      ? `Rp${p.galonPinjaman.depositTerkumpul.toLocaleString("id-ID")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/pelanggan/${p.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                        Edit
                      </Link>
                      <DeleteButton
                        url={`/api/pelanggan/${p.id}`}
                        confirmMessage={`Hapus pelanggan "${p.nama}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
