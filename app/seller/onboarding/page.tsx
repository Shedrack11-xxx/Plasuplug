"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/marketplace/image-uploader";
import { ShieldCheck } from "lucide-react";

export default function SellerOnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", description: "", whatsapp: "", phone: "" });
  const [idDocs, setIdDocs] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/seller/onboarding");
  }

  const inputClass = "w-full mt-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/seller/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, idDocumentUrl: idDocs[0] }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 sm:py-20 text-center">
        <ShieldCheck className="mx-auto text-brand mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2 dark:text-gray-100">Application submitted</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your seller profile is under review. An admin will verify your account before your products go live —
          this usually takes 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-12">
      <h1 className="text-2xl font-bold mb-1 dark:text-gray-100">Become a verified seller</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Tell us about your business. An admin reviews every application before you can list products —
        this keeps PLASU Plug safe for buyers.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Business / seller name</label>
          <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Description (optional)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium dark:text-gray-200">WhatsApp number</label>
            <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium dark:text-gray-200">Phone number</label>
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1 dark:text-gray-200">ID / proof of identity</label>
          <ImageUploader images={idDocs} onChange={setIdDocs} max={1} />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-brand text-white font-semibold py-2.5 rounded-lg hover:bg-brand-dark disabled:opacity-60">
          {loading ? "Submitting..." : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
