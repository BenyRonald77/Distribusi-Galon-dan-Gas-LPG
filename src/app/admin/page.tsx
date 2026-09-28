export default function AdminHomePage() {
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Beranda Dispatcher</h1>
      <p className="mt-1 text-sm text-ink-soft">{today}</p>

      <div className="mt-6 card p-6">
        <p className="text-sm text-ink-soft">
          Selamat datang. Gunakan menu di samping untuk mengelola pelanggan tetap,
          produk, pesanan, rute pengantaran, dan laporan galon kosong.
        </p>
      </div>
    </div>
  );
}
