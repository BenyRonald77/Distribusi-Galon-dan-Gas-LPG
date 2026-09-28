"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { JENIS_LABEL, type JenisProduk } from "@/lib/constants";

type Pelanggan = { id: string; nama: string; alamat: string };
type Produk = { id: string; nama: string; jenis: JenisProduk; varian: string | null; harga: number };

type ItemRow = { produkId: string; jumlah: string };

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function PesananForm({
  pelangganList,
  produkList,
}: {
  pelangganList: Pelanggan[];
  produkList: Produk[];
}) {
  const router = useRouter();
  const [pelangganId, setPelangganId] = useState("");
  const [tanggal, setTanggal] = useState(todayIsoDate());
  const [items, setItems] = useState<ItemRow[]>([{ produkId: "", jumlah: "1" }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const produkMap = useMemo(() => new Map(produkList.map((p) => [p.id, p])), [produkList]);

  const total = items.reduce((sum, item) => {
    const produk = produkMap.get(item.produkId);
    const jumlah = Number(item.jumlah) || 0;
    return sum + (produk ? produk.harga * jumlah : 0);
  }, 0);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addItem() {
    setItems((rows) => [...rows, { produkId: "", jumlah: "1" }]);
  }

  function removeItem(index: number) {
    setItems((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pelangganId) {
      setError("Pilih pelanggan terlebih dahulu.");
      return;
    }
    const validItems = items.filter((item) => item.produkId && Number(item.jumlah) > 0);
    if (validItems.length === 0) {
      setError("Tambahkan minimal 1 item produk dengan jumlah lebih dari 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/pesanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pelangganId,
          tanggal,
          items: validItems.map((item) => ({ produkId: item.produkId, jumlah: Number(item.jumlah) })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan pesanan.");
        return;
      }
      router.push("/admin/pesanan");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (pelangganList.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-ink">Belum ada pelanggan tetap.</p>
        <p className="mt-1 text-sm text-ink-soft">Tambahkan pelanggan tetap terlebih dahulu sebelum membuat pesanan.</p>
        <a href="/admin/pelanggan/baru" className="btn-primary mt-4 inline-flex">
          + Tambah Pelanggan
        </a>
      </div>
    );
  }

  if (produkList.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-ink">Belum ada produk.</p>
        <p className="mt-1 text-sm text-ink-soft">Tambahkan produk galon/gas LPG terlebih dahulu sebelum membuat pesanan.</p>
        <a href="/admin/produk/baru" className="btn-primary mt-4 inline-flex">
          + Tambah Produk
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-5 p-6">
      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pelanggan" className="field-label">
            Pelanggan
          </label>
          <select
            id="pelanggan"
            className="field-input"
            value={pelangganId}
            onChange={(e) => setPelangganId(e.target.value)}
            required
          >
            <option value="">Pilih pelanggan...</option>
            {pelangganList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tanggal" className="field-label">
            Tanggal Pesanan
          </label>
          <input
            id="tanggal"
            type="date"
            className="field-input"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="field-label mb-0">Item Pesanan</span>
          <button type="button" onClick={addItem} className="btn-secondary px-3 py-1.5 text-xs">
            + Tambah Item
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => {
            const produk = produkMap.get(item.produkId);
            return (
              <div key={index} className="flex items-start gap-2 rounded-md border border-line bg-paper p-2">
                <select
                  className="field-input flex-1"
                  value={item.produkId}
                  onChange={(e) => updateItem(index, { produkId: e.target.value })}
                  aria-label={`Produk item ${index + 1}`}
                >
                  <option value="">Pilih produk...</option>
                  {produkList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                      {p.varian ? ` (${p.varian})` : ""} - {JENIS_LABEL[p.jenis]} - Rp{p.harga.toLocaleString("id-ID")}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  className="field-input w-20"
                  value={item.jumlah}
                  onChange={(e) => updateItem(index, { jumlah: e.target.value })}
                  aria-label={`Jumlah item ${index + 1}`}
                />
                <div className="w-28 shrink-0 pt-2.5 text-right text-sm text-ink-soft">
                  {produk ? `Rp${(produk.harga * (Number(item.jumlah) || 0)).toLocaleString("id-ID")}` : "-"}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="btn-secondary px-2 py-1.5 text-xs disabled:opacity-40"
                  aria-label={`Hapus item ${index + 1}`}
                >
                  Hapus
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-ink-soft">Total Pesanan</span>
        <span className="text-lg font-semibold text-ink">Rp{total.toLocaleString("id-ID")}</span>
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Buat Pesanan"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/pesanan")}>
          Batal
        </button>
      </div>
    </form>
  );
}
