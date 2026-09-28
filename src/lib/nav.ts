// Daftar navigasi admin. Tambahkan entri baru hanya saat halaman tujuannya
// sudah benar-benar ada (lihat aturan R-24: tidak boleh ada tautan mati).
export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/admin", label: "Beranda" },
  { href: "/admin/pelanggan", label: "Pelanggan" },
  { href: "/admin/produk", label: "Produk" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/kurir", label: "Kurir" },
  { href: "/admin/rute", label: "Rute Pengantaran" },
];
