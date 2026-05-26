"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
import { Input } from "@/components/ds/Input";
import { login, mapAuthError } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Enter email and password");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/home");
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="mb-1 text-4xl font-bold text-neutral-900">Welcome</h1>
        <p className="text-neutral-500">Sign in to continue</p>
      </div>

      <Card>
        <label className="mb-1 block text-xs font-semibold text-neutral-500">EMAIL</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
        />
        <div className="my-4 h-px bg-neutral-100" />
        <label className="mb-1 block text-xs font-semibold text-neutral-500">PASSWORD</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </Card>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        label="Sign in"
        loading={loading}
        loadingLabel="Signing in…"
        fullWidth
      />

      <p className="text-center text-sm text-neutral-500">
        No account?{" "}
        <Link href="/register" className="font-semibold text-neutral-900">
          Create one
        </Link>
      </p>
    </form>
  );
}
