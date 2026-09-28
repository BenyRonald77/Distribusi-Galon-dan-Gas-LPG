import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/status-badge";
import type { StatusPesanan } from "@/lib/constants";

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default async function PesananListPage() {
  const pesanan = await prisma.pesanan.findMany({
    include: { pelanggan: true, items: true, kurir: true },
    orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Pesanan</h1>
          <p className="mt-1 text-sm text-ink-soft">{pesanan.length} pesanan tercatat</p>
        </div>
        <Link href="/admin/pesanan/baru" className="btn-primary">
          + Buat Pesanan
        </Link>
      </div>

      {pesanan.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <p className="text-sm font-medium text-ink">Belum ada pesanan.</p>
          <p className="mt-1 text-sm text-ink-soft">Buat pesanan pertama dari pelanggan tetap Anda.</p>
          <Link href="/admin/pesanan/baru" className="btn-primary mt-4 inline-flex">
            + Buat Pesanan
          </Link>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pelanggan</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Kurir</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pesanan.map((p) => {
                const total = p.items.reduce((sum, item) => sum + item.hargaSatuan * item.jumlah, 0);
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-ink-soft">{formatTanggal(p.tanggal)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{p.pelanggan.nama}</td>
                    <td className="px-4 py-3 text-ink-soft">{p.items.length} item</td>
                    <td className="px-4 py-3 text-ink-soft">Rp{total.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-ink-soft">{p.kurir?.nama ?? "-"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status as StatusPesanan} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/pesanan/${p.id}`} className="btn-secondary px-3 py-1.5 text-xs">
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
