"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({
  url,
  confirmMessage,
  onDeleted,
}: {
  url: string;
  confirmMessage: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Gagal menghapus data.");
        return;
      }
      if (onDeleted) onDeleted();
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={handleDelete} disabled={loading} className="btn-danger px-3 py-1.5 text-xs">
        {loading ? "Menghapus..." : "Hapus"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
