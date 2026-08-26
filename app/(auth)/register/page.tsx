"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", whatsapp: "", role: "BUYER" as "BUYER" | "SELLER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }

    router.push(form.role === "SELLER" ? "/seller/onboarding" : "/marketplace");
    router.refresh();
  }

  const inputClass = "w-full mt-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2";

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold mb-1 dark:text-gray-100">Create your account</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Join PLASU Plug to buy or sell on campus.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Full name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Password</label>
          <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium dark:text-gray-200">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-200">WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1 dark:text-gray-200">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "BUYER" })}
              className={`py-2.5 rounded-lg border font-medium text-sm ${form.role === "BUYER" ? "border-brand bg-brand-light dark:bg-brand/20 text-brand-dark dark:text-emerald-300" : "border-gray-300 dark:border-gray-700 dark:text-gray-300"}`}
            >
              Buy products
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: "SELLER" })}
              className={`py-2.5 rounded-lg border font-medium text-sm ${form.role === "SELLER" ? "border-brand bg-brand-light dark:bg-brand/20 text-brand-dark dark:text-emerald-300" : "border-gray-300 dark:border-gray-700 dark:text-gray-300"}`}
            >
              Sell products
            </button>
          </div>
          {form.role === "SELLER" && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Selling requires a quick verification step after signup — you won't be able to post products until an admin approves your seller profile.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-brand text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-60">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
        Already have an account? <Link href="/login" className="text-brand font-semibold">Log in</Link>
      </p>
    </div>
  );
}
