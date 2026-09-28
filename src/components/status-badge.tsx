import { STATUS_LABEL, type StatusPesanan } from "@/lib/constants";

// Empat status operasional butuh warna yang berbeda agar dispatcher bisa
// memindai tabel pesanan sekilas tanpa membaca teks satu per satu. Ini
// bukan palet dekoratif: brand/accent dipakai untuk status yang sedang
// berjalan (DIPROSES/DIANTAR), netral untuk BARU, hijau standar "selesai"
// untuk SELESAI.
const STYLE: Record<StatusPesanan, string> = {
  BARU: "bg-slate-100 text-status-baru",
  DIPROSES: "bg-brand-50 text-brand-700",
  DIANTAR: "bg-accent-100 text-accent-600",
  SELESAI: "bg-emerald-50 text-status-selesai",
};

export default function StatusBadge({ status }: { status: StatusPesanan }) {
  return <span className={`badge ${STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
