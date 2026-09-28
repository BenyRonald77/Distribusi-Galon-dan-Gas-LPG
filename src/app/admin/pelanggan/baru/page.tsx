import PelangganForm from "@/components/pelanggan-form";

export default function PelangganBaruPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Tambah Pelanggan Tetap</h1>
      <div className="mt-6">
        <PelangganForm />
      </div>
    </div>
  );
}
