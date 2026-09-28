import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/status-badge";
import PesananStatusAction from "@/components/pesanan-status-action";
import type { StatusPesanan } from "@/lib/constants";

function formatTanggal(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function PesananDetailPage({ params }: { params: { id: string } }) {
  const pesanan = await prisma.pesanan.findUnique({
    where: { id: params.id },
    include: { pelanggan: true, kurir: true, items: { include: { produk: true } } },
  });
  if (!pesanan) notFound();

  const total = pesanan.items.reduce((sum, item) => sum + item.hargaSatuan * item.jumlah, 0);
  const itemGalon = pesanan.items.filter((item) => item.produk.jenis === "GALON");
  const punyaItemGalon = itemGalon.length > 0;
  const depositGalonDefault = itemGalon.reduce(
    (sum, item) => sum + (item.produk.depositGalon ?? 0) * item.jumlah,
    0
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/pesanan" className="text-sm text-brand-600 hover:underline">
            &larr; Kembali ke daftar pesanan
          </Link>
          <h1 className="mt-2 text-lg font-semibold text-ink">Pesanan {formatTanggal(pesanan.tanggal)}</h1>
        </div>
        <StatusBadge status={pesanan.status as StatusPesanan} />
      </div>

      <div className="card mt-6 p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Pelanggan</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{pesanan.pelanggan.nama}</dd>
            <dd className="text-sm text-ink-soft">{pesanan.pelanggan.alamat}</dd>
            <dd className="text-sm text-ink-soft">{pesanan.pelanggan.noHp}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-soft">Kurir</dt>
            <dd className="mt-1 text-sm text-ink">{pesanan.kurir?.nama ?? "Belum ditugaskan"}</dd>
            {pesanan.urutanRute !== null && (
              <dd className="text-sm text-ink-soft">Urutan rute ke-{pesanan.urutanRute}</dd>
            )}
          </div>
        </dl>

        <div className="mt-6 border-t border-line pt-4">
          <h2 className="text-sm font-semibold text-ink">Item Pesanan</h2>
          <div className="mt-3 divide-y divide-line">
            {pesanan.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">
                  {item.produk.nama}
                  {item.produk.varian ? ` (${item.produk.varian})` : ""} &times; {item.jumlah}
                </span>
                <span className="text-ink-soft">Rp{(item.hargaSatuan * item.jumlah).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-medium text-ink-soft">Total</span>
            <span className="text-base font-semibold text-ink">Rp{total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <h2 className="mb-3 text-sm font-semibold text-ink">Status Pengantaran</h2>
          <PesananStatusAction
            pesananId={pesanan.id}
            status={pesanan.status as StatusPesanan}
            punyaItemGalon={punyaItemGalon}
            depositGalonDefault={depositGalonDefault}
          />
          {pesanan.status === "SELESAI" && punyaItemGalon && (
            <div className="mt-3 text-sm text-ink-soft">
              <p>Galon kosong diambil: {pesanan.galonKosongDiambil ?? 0}</p>
              <p>Deposit diterima/dikembalikan: Rp{(pesanan.depositDiterima ?? 0).toLocaleString("id-ID")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
