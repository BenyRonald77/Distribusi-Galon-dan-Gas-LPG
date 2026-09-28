"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StatusPesanan } from "@/lib/constants";

type Props = {
  pesananId: string;
  status: StatusPesanan;
  punyaItemGalon: boolean;
  depositGalonDefault: number;
};

export default function PesananStatusAction({ pesananId, status, punyaItemGalon, depositGalonDefault }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [galonKosong, setGalonKosong] = useState("0");
  const [deposit, setDeposit] = useState(String(depositGalonDefault));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(nextStatus: string, extra?: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pesanan/${pesananId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui status.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "BARU") {
    return <p className="text-sm text-ink-soft">Pesanan ini belum dirutekan ke kurir manapun.</p>;
  }

  if (status === "SELESAI") {
    return <p className="text-sm font-medium text-status-selesai">Pesanan sudah selesai.</p>;
  }

  if (status === "DIPROSES") {
    return (
      <div className="space-y-2">
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn-primary" disabled={loading} onClick={() => submit("DIANTAR")}>
          {loading ? "Memproses..." : "Tandai Diantar"}
        </button>
      </div>
    );
  }

  // status === "DIANTAR"
  if (!punyaItemGalon) {
    return (
      <div className="space-y-2">
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn-primary" disabled={loading} onClick={() => submit("SELESAI")}>
          {loading ? "Memproses..." : "Selesaikan Pesanan"}
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="space-y-2">
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          Selesaikan Pesanan
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("SELESAI", {
          galonKosongDiambil: Number(galonKosong) || 0,
          depositDiterima: Number(deposit) || 0,
        });
      }}
      className="max-w-sm space-y-3 rounded-md border border-line bg-paper p-4"
    >
      {error && <p className="text-sm text-danger">{error}</p>}
      <p className="text-sm font-medium text-ink">Pelacakan Galon Kosong &amp; Deposit</p>
      <div>
        <label htmlFor="galonKosong" className="field-label">
          Galon kosong diambil kembali
        </label>
        <input
          id="galonKosong"
          type="number"
          min={0}
          className="field-input"
          value={galonKosong}
          onChange={(e) => setGalonKosong(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="deposit" className="field-label">
          Deposit diterima (Rp, isi negatif jika dikembalikan)
        </label>
        <input
          id="deposit"
          type="number"
          className="field-input"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan & Selesaikan"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
          Batal
        </button>
      </div>
    </form>
  );
}
