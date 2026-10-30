"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordInput from "@/components/PasswordInput";
import { DEMO_CREDENTIALS, getDemoPassword, getDemoProfile, setDemoSession } from "@/lib/demo-store";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);

  useEffect(() => {
    setEmail(getDemoProfile().email);
    setPassword(getDemoPassword());
  }, []);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    if (email !== getDemoProfile().email.toLowerCase() || password !== getDemoPassword()) {
      setError("That email and password do not match the demo admin account.");
      setLoading(false);
      return;
    }
    setDemoSession({ ...getDemoProfile(), email, role: "admin" });
    router.push("/admin");
  }

  const field = "mt-2 w-full rounded-md border border-neutral-300 px-4 py-3 text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <>
      <Header />
      <main className="bg-site relative isolate flex min-h-[68vh] items-center justify-center px-4 py-16">
        <div className="absolute inset-0 -z-10 bg-black/75" />
        <section className="w-full max-w-md rounded-2xl bg-white p-7 text-neutral-900 shadow-2xl sm:p-9">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-brand">Admin demo</p>
          <h1 className="mt-2 font-serif text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-neutral-600">Sign in to manage the demo website.</p>
          <form onSubmit={handleLogin} className="mt-7">
            <label htmlFor="login-email" className="block text-sm font-bold">Email</label>
            <input id="login-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className={field} />
            <label htmlFor="login-password" className="mt-5 block text-sm font-bold">Password</label>
            <PasswordInput id="login-password" name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className={field} />
            {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
            <button disabled={loading} className="mt-6 w-full rounded-full bg-brand py-3 font-bold uppercase text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in…" : "Login"}</button>
          </form>
          <aside className="mt-6 rounded-lg bg-neutral-100 p-4 text-sm">
            <p className="font-bold">Demo credentials</p>
            <p className="mt-1">Email: {email}</p>
            <p>Password: {password}</p>
          </aside>
          <Link href="/" className="mt-5 inline-block text-sm font-bold text-brand hover:underline">← Back to website</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
