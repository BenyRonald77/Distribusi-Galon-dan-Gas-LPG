import AdminShell from "@/components/admin-shell";

// Otorisasi sesungguhnya sudah ditegakkan oleh middleware.ts (redirect ke
// /login bila sesi tidak valid). Layout ini hanya menyusun tampilan.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
