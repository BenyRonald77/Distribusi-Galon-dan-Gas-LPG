import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Distribusi Galon &amp; Gas LPG
          </p>
          <h1 className="mt-1 text-xl font-semibold text-ink">Masuk ke Panel Dispatcher</h1>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
