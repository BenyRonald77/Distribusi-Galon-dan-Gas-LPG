import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JENIS_LABEL, type JenisProduk } from "@/lib/constants";
import DeleteButton from "@/components/delete-button";

export default async function ProdukListPage() {
  const produk = await prisma.produk.findMany({ orderBy: [{ jenis: "asc" }, { nama: "asc" }] });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Produk</h1>
          <p className="mt-1 text-sm text-ink-soft">{produk.length} produk terdaftar</p>
        </div>
        <Link href="/admin/produk/baru" className="btn-primary">
          + Tambah Produk
        </Link>
      </div>

      {produk.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-medium text-ink">Belum ada produk.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Tambahkan galon dan gas LPG yang Anda jual beserta harganya.
          </p>
          <Link href="/admin/produk/baru" className="btn-primary mt-4 inline-flex">
            + Tambah Produk
          </Link>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Deposit Galon</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {produk.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {p.nama}
                    {p.varian && <span className="ml-1 text-ink-soft">({p.varian})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        p.jenis === "GALON" ? "bg-brand-50 text-brand-700" : "bg-accent-100 text-accent-600"
                      }`}
                    >
                      {JENIS_LABEL[p.jenis as JenisProduk]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">Rp{p.harga.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.depositGalon ? `Rp${p.depositGalon.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/produk/${p.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">
                        Edit
                      </Link>
                      <DeleteButton url={`/api/produk/${p.id}`} confirmMessage={`Hapus produk "${p.nama}"?`} />
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
