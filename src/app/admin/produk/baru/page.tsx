import ProdukForm from "@/components/produk-form";

export default function ProdukBaruPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-ink">Tambah Produk</h1>
      <div className="mt-6">
        <ProdukForm />
      </div>
    </div>
  );
}
