"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JENIS_PRODUK, JENIS_LABEL, type JenisProduk } from "@/lib/constants";

type ProdukFormValues = {
  nama: string;
  jenis: JenisProduk;
  varian: string;
  harga: string;
  depositGalon: string;
};

export default function ProdukForm({
  initialValues,
  produkId,
}: {
  initialValues?: ProdukFormValues;
  produkId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProdukFormValues>(
    initialValues ?? { nama: "", jenis: "GALON", varian: "", harga: "", depositGalon: "" }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(produkId);

  function update<K extends keyof ProdukFormValues>(key: K, value: ProdukFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/produk/${produkId}` : "/api/produk", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data.");
        return;
      }
      router.push("/admin/produk");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg space-y-4 p-6">
      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nama" className="field-label">
          Nama Produk
        </label>
        <input
          id="nama"
          className="field-input"
          placeholder="mis. Galon 19L, LPG 3kg"
          value={values.nama}
          onChange={(e) => update("nama", e.target.value)}
          required
        />
      </div>

      <div>
        <span className="field-label">Jenis</span>
        <div className="flex gap-2">
          {JENIS_PRODUK.map((jenis) => (
            <button
              key={jenis}
              type="button"
              onClick={() => update("jenis", jenis)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                values.jenis === jenis
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-line bg-paper-raised text-ink-soft hover:bg-paper"
              }`}
              aria-pressed={values.jenis === jenis}
            >
              {JENIS_LABEL[jenis]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="varian" className="field-label">
          Varian / Ukuran (opsional)
        </label>
        <input
          id="varian"
          className="field-input"
          placeholder="mis. 19 Liter"
          value={values.varian}
          onChange={(e) => update("varian", e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="harga" className="field-label">
          Harga Jual (Rp)
        </label>
        <input
          id="harga"
          className="field-input"
          inputMode="numeric"
          value={values.harga}
          onChange={(e) => update("harga", e.target.value)}
          required
        />
      </div>

      {values.jenis === "GALON" && (
        <div>
          <label htmlFor="depositGalon" className="field-label">
            Deposit Galon Kosong (Rp)
          </label>
          <input
            id="depositGalon"
            className="field-input"
            inputMode="numeric"
            value={values.depositGalon}
            onChange={(e) => update("depositGalon", e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-ink-soft">
            Nominal yang ditahan sebagai deposit galon kosong, dikembalikan saat galon kosong diambil.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Produk"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/produk")}>
          Batal
        </button>
      </div>
    </form>
  );
}
