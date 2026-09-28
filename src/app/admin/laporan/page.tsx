import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/status-badge";
import type { StatusPesanan } from "@/lib/constants";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultRange() {
  const sampai = new Date();
  const dari = new Date();
  dari.setDate(dari.getDate() - 29);
  return { dari: isoDate(dari), sampai: isoDate(sampai) };
}

export default async function LaporanPage({
  searchParams,
}: {
  searchParams: { dari?: string; sampai?: string };
}) {
  const defaults = defaultRange();
  const dari = searchParams.dari || defaults.dari;
  const sampai = searchParams.sampai || defaults.sampai;

  const start = new Date(`${dari}T00:00:00`);
  const end = new Date(`${sampai}T23:59:59.999`);

  const [pesananList, galonOutstanding] = await Promise.all([
    prisma.pesanan.findMany({
      where: { tanggal: { gte: start, lte: end } },
      include: { pelanggan: true, items: true },
      orderBy: { tanggal: "desc" },
    }),
    prisma.galonPinjaman.findMany({
      where: { jumlahDipinjam: { gt: 0 } },
      include: { pelanggan: true },
      orderBy: { jumlahDipinjam: "desc" },
    }),
  ]);

  const totalNilai = pesananList.reduce(
    (sum, p) => sum + p.items.reduce((s, item) => s + item.hargaSatuan * item.jumlah, 0),
    0
  );
  const jumlahPerStatus = pesananList.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const totalGalonOutstanding = galonOutstanding.reduce((sum, g) => sum + g.jumlahDipinjam, 0);
  const totalDepositOutstanding = galonOutstanding.reduce((sum, g) => sum + g.depositTerkumpul, 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-ink">Laporan Pesanan</h1>
        <form className="card mt-4 flex flex-wrap items-end gap-3 p-4" method="GET">
          <div>
            <label htmlFor="dari" className="field-label">
              Dari Tanggal
            </label>
            <input id="dari" type="date" name="dari" defaultValue={dari} className="field-input" />
          </div>
          <div>
            <label htmlFor="sampai" className="field-label">
              Sampai Tanggal
            </label>
            <input id="sampai" type="date" name="sampai" defaultValue={sampai} className="field-input" />
          </div>
          <button type="submit" className="btn-primary">
            Terapkan
          </button>
        </form>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Jumlah Pesanan</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{pesananList.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Total Nilai Pesanan</p>
            <p className="mt-1 text-2xl font-semibold text-ink">Rp{totalNilai.toLocaleString("id-ID")}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Selesai</p>
            <p className="mt-1 text-2xl font-semibold text-ink">
              {jumlahPerStatus.SELESAI ?? 0} / {pesananList.length}
            </p>
          </div>
        </div>

        {pesananList.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="text-sm font-medium text-ink">Tidak ada pesanan pada rentang tanggal ini.</p>
            <p className="mt-1 text-sm text-ink-soft">Coba perluas rentang tanggal di atas.</p>
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Nilai</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pesananList.map((p) => {
                  const nilai = p.items.reduce((s, item) => s + item.hargaSatuan * item.jumlah, 0);
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-ink-soft">
                        {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(
                          p.tanggal
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{p.pelanggan.nama}</td>
                      <td className="px-4 py-3 text-ink-soft">Rp{nilai.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status as StatusPesanan} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink">Galon Kosong Outstanding</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Pelanggan yang masih memegang galon isi dan belum mengembalikan galon kosongnya, beserta deposit yang
          sedang dipegang usaha.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Total Galon Outstanding</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{totalGalonOutstanding} galon</p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Total Deposit Dipegang</p>
            <p className="mt-1 text-2xl font-semibold text-ink">Rp{totalDepositOutstanding.toLocaleString("id-ID")}</p>
          </div>
        </div>

        {galonOutstanding.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="text-sm font-medium text-ink">Tidak ada galon outstanding.</p>
            <p className="mt-1 text-sm text-ink-soft">Semua galon yang beredar sudah dikembalikan pelanggan.</p>
          </div>
        ) : (
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line bg-paper text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Pelanggan</th>
                  <th className="px-4 py-3 font-medium">Galon Dipinjam</th>
                  <th className="px-4 py-3 font-medium">Deposit Dipegang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {galonOutstanding.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-3 font-medium text-ink">{g.pelanggan.nama}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-accent-100 text-accent-600">{g.jumlahDipinjam} galon</span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">Rp{g.depositTerkumpul.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
