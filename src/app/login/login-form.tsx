"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk, coba lagi.");
        return;
      }
      router.push(from);
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {error}
        </div>
      )}
      <div>
        <label htmlFor="username" className="field-label">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          className="field-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
