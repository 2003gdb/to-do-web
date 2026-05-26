"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { Card } from "@/components/ds/Card";
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="mb-1 text-4xl font-bold text-neutral-900">Create account</h1>
        <p className="text-neutral-500">Sign up to get started</p>
      </div>

      <Card>
        <label className="mb-1 block text-xs font-semibold text-neutral-500">NAME</label>
        <Input
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
          autoFocus
        />
        <div className="my-4 h-px bg-neutral-100" />
        <label className="mb-1 block text-xs font-semibold text-neutral-500">EMAIL</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <div className="my-4 h-px bg-neutral-100" />
        <label className="mb-1 block text-xs font-semibold text-neutral-500">PASSWORD</label>
        <Input
          type="password"
          placeholder="8+ chars, upper, lower, digit"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </Card>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
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

      <p className="text-center text-sm text-neutral-500">
        Have an account?{" "}
        <Link href="/login" className="font-semibold text-neutral-900">
          Sign in
        </Link>
      </p>
    </form>
  );
}
