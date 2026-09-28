export default function AdminLoading() {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-ink-soft">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand-500"
      />
      Memuat data...
    </div>
  );
}
