"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PelangganFormValues = {
  nama: string;
  alamat: string;
  latitude: string;
  longitude: string;
  noHp: string;
};

export default function PelangganForm({
  initialValues,
  pelangganId,
}: {
  initialValues?: PelangganFormValues;
  pelangganId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<PelangganFormValues>(
    initialValues ?? { nama: "", alamat: "", latitude: "", longitude: "", noHp: "" }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const isEdit = Boolean(pelangganId);

  function update<K extends keyof PelangganFormValues>(key: K, value: PelangganFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleUseCurrentLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("Browser ini tidak mendukung deteksi lokasi.");
      return;
    }
    setGeoStatus("Mendeteksi lokasi...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update("latitude", position.coords.latitude.toFixed(6));
        update("longitude", position.coords.longitude.toFixed(6));
        setGeoStatus("Lokasi berhasil diisi dari GPS perangkat ini.");
      },
      () => {
        setGeoStatus("Gagal mendapatkan lokasi. Isi koordinat secara manual.");
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(isEdit ? `/api/pelanggan/${pelangganId}` : "/api/pelanggan", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menyimpan data.");
        return;
      }
      router.push("/admin/pelanggan");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4 p-6">
      {error && (
        <div role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nama" className="field-label">
          Nama Pelanggan
        </label>
        <input
          id="nama"
          className="field-input"
          value={values.nama}
          onChange={(e) => update("nama", e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="alamat" className="field-label">
          Alamat
        </label>
        <textarea
          id="alamat"
          className="field-input"
          rows={2}
          value={values.alamat}
          onChange={(e) => update("alamat", e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="noHp" className="field-label">
          No HP
        </label>
        <input
          id="noHp"
          className="field-input"
          value={values.noHp}
          onChange={(e) => update("noHp", e.target.value)}
          required
        />
      </div>

      <div className="rounded-md border border-line bg-paper p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">Koordinat Lokasi</p>
          <button type="button" onClick={handleUseCurrentLocation} className="btn-secondary px-3 py-1.5 text-xs">
            Gunakan lokasi saat ini
          </button>
        </div>
        <p className="mb-2 text-xs text-ink-soft">
          Salin koordinat dari aplikasi peta di HP Anda, atau tekan tombol di atas jika sedang berada di lokasi
          pelanggan.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="latitude" className="field-label">
              Latitude
            </label>
            <input
              id="latitude"
              className="field-input"
              value={values.latitude}
              onChange={(e) => update("latitude", e.target.value)}
              inputMode="decimal"
              placeholder="-6.175392"
              required
            />
          </div>
          <div>
            <label htmlFor="longitude" className="field-label">
              Longitude
            </label>
            <input
              id="longitude"
              className="field-input"
              value={values.longitude}
              onChange={(e) => update("longitude", e.target.value)}
              inputMode="decimal"
              placeholder="106.827153"
              required
            />
          </div>
        </div>
        {geoStatus && <p className="mt-2 text-xs text-ink-soft">{geoStatus}</p>}
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Pelanggan"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/pelanggan")}>
          Batal
        </button>
      </div>
    </form>
  );
}
