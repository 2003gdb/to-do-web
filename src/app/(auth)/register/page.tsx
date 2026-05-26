"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Input } from "@/components/ds/Input";
import { register, mapAuthError } from "@/services/authService";
import { errorMessage } from "@/utils/errorMessage";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Complete all fields");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ fullName, email, password });
      router.replace("/home");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code ? mapAuthError(err) : errorMessage(err, "Could not create account."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">Create account</h1>
        <p className="text-sm text-text-secondary">Sign up to get started</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm text-text-secondary">
            Name
          </label>
          <Input
            id="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            autoFocus
          />
        </div>
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
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm text-text-secondary">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="8+ chars, upper, lower, digit"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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
        label="Create account"
        loading={loading}
        loadingLabel="Creating…"
        fullWidth
      />

      <p className="text-center text-sm text-text-secondary">
        Have an account?{" "}
        <Link
          href="/login"
          className="rounded-xs font-medium text-text-primary underline-offset-4 hover:underline outline-none focus-visible:shadow-[var(--shadow-focus)]"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
