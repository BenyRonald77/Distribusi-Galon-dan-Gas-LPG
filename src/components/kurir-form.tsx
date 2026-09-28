"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function KurirForm() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/kurir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama, noHp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data.");
        return;
      }
      setNama("");
      setNoHp("");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-wrap items-end gap-3 p-4">
      {error && (
        <div role="alert" className="w-full rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      <div className="min-w-[10rem] flex-1">
        <label htmlFor="kurir-nama" className="field-label">
          Nama Kurir
        </label>
        <input
          id="kurir-nama"
          className="field-input"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
      </div>
      <div className="min-w-[10rem] flex-1">
        <label htmlFor="kurir-hp" className="field-label">
          No HP
        </label>
        <input
          id="kurir-hp"
          className="field-input"
          value={noHp}
          onChange={(e) => setNoHp(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Menyimpan..." : "+ Tambah Kurir"}
      </button>
    </form>
  );
}
