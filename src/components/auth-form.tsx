"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/journey");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const input =
    "w-full rounded-xl border border-line bg-obsidian-3 px-4 py-3 text-[13.5px] text-ivory outline-none transition-colors focus:border-gold/50";

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-4">
      {mode === "register" && (
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Name</label>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Email</label>
        <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ivory-dim">Password</label>
        <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {mode === "register" && <p className="mt-1.5 text-[11.5px] text-ivory-dim/70">8+ characters. Saved temple lists sync to your journey.</p>}
      </div>

      {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[12.5px] text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-saffron/90 to-gold px-5 py-3 text-sm font-semibold text-obsidian transition-all hover:brightness-110 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-[12.5px] text-ivory-dim">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-gold-bright hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Have an account?{" "}
            <Link href="/login" className="font-medium text-gold-bright hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}