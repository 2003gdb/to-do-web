"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Welcome</h1>
        <p className="text-sm text-text-secondary">Sign in to continue</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm text-text-secondary">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-text-secondary">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-sm bg-danger-muted px-4 py-3 text-sm font-medium text-danger"
        >
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

      <p className="text-center text-sm text-text-secondary">
        No account?{" "}
        <Link
          href="/register"
          className="rounded-xs font-medium text-text-primary underline-offset-4 hover:underline outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
