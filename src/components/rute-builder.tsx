"use client";

import { useEffect, useState } from "react";

type Kurir = { id: string; nama: string };
type PesananRingkas = {
  id: string;
  pelanggan: { nama: string; alamat: string };
  items: { jumlah: number; produk: { nama: string } }[];
};
type HasilRute = {
  kurir: string;
  totalJarakKm: number;
  langkah: { urutan: number; jarakDariSebelumnyaKm: number; pesananId: string; pelanggan: string; alamat: string }[];
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function RuteBuilder({ kurirList }: { kurirList: Kurir[] }) {
  const [tanggal, setTanggal] = useState(todayIsoDate());
  const [kurirId, setKurirId] = useState(kurirList[0]?.id ?? "");
  const [pesananList, setPesananList] = useState<PesananRingkas[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilRute | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    setListError(null);
    setHasil(null);
    fetch(`/api/pesanan?status=BARU&tanggal=${tanggal}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat daftar pesanan");
        return res.json();
      })
      .then((data: PesananRingkas[]) => {
        if (cancelled) return;
        setPesananList(data);
        setSelected(new Set());
      })
      .catch(() => {
        if (!cancelled) setListError("Gagal memuat daftar pesanan. Coba muat ulang halaman.");
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tanggal]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!pesananList) return;
    setSelected((prev) => (prev.size === pesananList.length ? new Set() : new Set(pesananList.map((p) => p.id))));
  }

  async function handleSubmit() {
    setSubmitError(null);
    if (!kurirId) {
      setSubmitError("Pilih kurir terlebih dahulu.");
      return;
    }
    if (selected.size === 0) {
      setSubmitError("Pilih minimal 1 pesanan untuk dirutekan.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/rute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kurirId, pesananIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Gagal membuat rute.");
        return;
      }
      setHasil(data);
      setPesananList((prev) => prev?.filter((p) => !selected.has(p.id)) ?? null);
      setSelected(new Set());
    } catch {
      setSubmitError("Tidak bisa terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  if (kurirList.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-ink">Belum ada kurir.</p>
        <p className="mt-1 text-sm text-ink-soft">Tambahkan kurir terlebih dahulu di halaman Kurir.</p>
        <a href="/admin/kurir" className="btn-primary mt-4 inline-flex">
          Kelola Kurir
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card grid gap-4 p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="tanggal" className="field-label">
            Tanggal Pengantaran
          </label>
          <input
            id="tanggal"
            type="date"
            className="field-input"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kurir" className="field-label">
            Kurir
          </label>
          <select id="kurir" className="field-input" value={kurirId} onChange={(e) => setKurirId(e.target.value)}>
            {kurirList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingList && (
        <div className="flex items-center gap-3 py-6 text-sm text-ink-soft">
          <span
            aria-hidden
            className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-500"
          />
          Memuat pesanan berstatus BARU...
        </div>
      )}

      {!loadingList && listError && (
        <div role="alert" className="card border-danger/30 p-4 text-sm text-danger">
          {listError}
        </div>
      )}

      {!loadingList && !listError && pesananList && pesananList.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-ink">Tidak ada pesanan berstatus BARU pada tanggal ini.</p>
          <p className="mt-1 text-sm text-ink-soft">Pilih tanggal lain, atau buat pesanan baru terlebih dahulu.</p>
        </div>
      )}

      {!loadingList && !listError && pesananList && pesananList.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-paper px-4 py-2">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={selected.size === pesananList.length}
                onChange={toggleAll}
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
              />
              Pilih semua ({pesananList.length})
            </label>
            <span className="text-sm text-ink-soft">{selected.size} dipilih</span>
          </div>
          <div className="divide-y divide-line">
            {pesananList.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-paper">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="mt-1 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-ink">{p.pelanggan.nama}</p>
                  <p className="text-sm text-ink-soft">{p.pelanggan.alamat}</p>
                  <p className="text-xs text-ink-soft/80">
                    {p.items.map((i) => `${i.produk.nama} x${i.jumlah}`).join(", ")}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {submitError && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {submitError}
        </div>
      )}

      {pesananList && pesananList.length > 0 && (
        <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
          {submitting ? "Menghitung rute..." : "Buat Rute Otomatis"}
        </button>
      )}

      {hasil && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink">
            Rute untuk {hasil.kurir} - total {hasil.totalJarakKm} km
          </h2>
          <ol className="mt-3 space-y-3">
            {hasil.langkah.map((step) => (
              <li key={step.pesananId} className="flex items-start gap-3 rounded-md border border-line bg-paper p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {step.urutan}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{step.pelanggan}</p>
                  <p className="text-sm text-ink-soft">{step.alamat}</p>
                  <p className="text-xs text-ink-soft/80">
                    +{step.jarakDariSebelumnyaKm} km dari titik sebelumnya
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
