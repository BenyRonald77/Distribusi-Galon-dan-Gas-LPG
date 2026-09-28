"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="card space-y-3 border-danger/30 p-6">
      <p className="text-sm font-semibold text-danger">Terjadi kesalahan saat memuat halaman ini.</p>
      <p className="text-sm text-ink-soft">{error.message || "Kesalahan tidak diketahui."}</p>
      <button onClick={reset} className="btn-secondary">
        Coba lagi
      </button>
    </div>
  );
}
