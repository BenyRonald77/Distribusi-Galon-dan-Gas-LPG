import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PesananStatusAction from "@/components/pesanan-status-action";
import StatusBadge from "@/components/status-badge";
import type { StatusPesanan } from "@/lib/constants";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatTanggalPanjang(isoDate: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

export default async function KurirDashboardPage({
  params,
  searchParams,
}: {
  params: { kurirId: string };
  searchParams: { tanggal?: string };
}) {
  const kurir = await prisma.kurir.findUnique({ where: { id: params.kurirId } });
  if (!kurir) notFound();

  const tanggal = searchParams.tanggal || todayIsoDate();
  const start = new Date(`${tanggal}T00:00:00`);
  const end = new Date(`${tanggal}T23:59:59.999`);

  const pesananList = await prisma.pesanan.findMany({
    where: { kurirId: kurir.id, tanggal: { gte: start, lte: end } },
    include: { pelanggan: true, items: { include: { produk: true } } },
    orderBy: { urutanRute: "asc" },
  });

  const selesaiCount = pesananList.filter((p) => p.status === "SELESAI").length;

  return (
    <div className="min-h-screen bg-paper pb-10">
      <header className="sticky top-0 z-10 border-b border-line bg-paper-raised px-4 py-3 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Dashboard Rute Kurir</p>
        <h1 className="text-lg font-semibold text-ink">{kurir.nama}</h1>
        <form className="mt-2 flex items-center gap-2" method="GET">
          <input type="date" name="tanggal" defaultValue={tanggal} className="field-input flex-1" />
          <button type="submit" className="btn-secondary shrink-0 px-3 py-2 text-sm">
            Tampilkan
          </button>
        </form>
        <p className="mt-2 text-sm text-ink-soft">
          {formatTanggalPanjang(tanggal)} &middot; {selesaiCount}/{pesananList.length} selesai
        </p>
      </header>

      <main className="px-4 py-4">
        {pesananList.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm font-medium text-ink">Tidak ada rute pada tanggal ini.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Pilih tanggal lain, atau tunggu dispatcher menugaskan pesanan untuk hari ini.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {pesananList.map((p) => {
              const total = p.items.reduce((sum, item) => sum + item.hargaSatuan * item.jumlah, 0);
              const itemGalon = p.items.filter((item) => item.produk.jenis === "GALON");
              const depositGalonDefault = itemGalon.reduce(
                (sum, item) => sum + (item.produk.depositGalon ?? 0) * item.jumlah,
                0
              );
              return (
                <li key={p.id} className="card overflow-hidden">
                  <div className="flex items-center justify-between bg-paper px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                        {p.urutanRute ?? "-"}
                      </span>
                      <span className="text-sm font-semibold text-ink">{p.pelanggan.nama}</span>
                    </div>
                    <StatusBadge status={p.status as StatusPesanan} />
                  </div>
                  <div className="space-y-3 px-4 py-3">
                    <div>
                      <p className="text-sm text-ink-soft">{p.pelanggan.alamat}</p>
                      <a href={`tel:${p.pelanggan.noHp}`} className="text-sm font-medium text-brand-600 hover:underline">
                        {p.pelanggan.noHp}
                      </a>
                    </div>
                    <div className="rounded-md border border-line bg-paper p-2 text-sm">
                      {p.items.map((item) => (
                        <div key={item.id} className="flex justify-between py-0.5">
                          <span className="text-ink">
                            {item.produk.nama} &times; {item.jumlah}
                          </span>
                          <span className="text-ink-soft">
                            Rp{(item.hargaSatuan * item.jumlah).toLocaleString("id-ID")}
                          </span>
                        </div>
                      ))}
                      <div className="mt-1 flex justify-between border-t border-line pt-1 font-medium">
                        <span className="text-ink-soft">Total</span>
                        <span className="text-ink">Rp{total.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                    <PesananStatusAction
                      pesananId={p.id}
                      status={p.status as StatusPesanan}
                      punyaItemGalon={itemGalon.length > 0}
                      depositGalonDefault={depositGalonDefault}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}
