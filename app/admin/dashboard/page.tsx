"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

type Seller = {
  id: string;
  businessName: string;
  whatsapp: string;
  phone: string;
  idDocumentUrl: string | null;
  verificationStatus: string;
  submittedAt: string | null;
  user: { name: string; email: string };
};

export default function AdminDashboardPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/sellers?status=PENDING");
    const data = await res.json();
    setSellers(data.sellers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, decision: "VERIFIED" | "REJECTED") {
    await fetch(`/api/admin/sellers/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, note: note[id] }),
    });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 dark:text-gray-100">Seller verification queue</h1>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
      ) : sellers.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No pending applications 🎉</p>
      ) : (
        <div className="space-y-4">
          {sellers.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="font-semibold dark:text-gray-100">{s.businessName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.user.name} · {s.user.email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp: {s.whatsapp} · Phone: {s.phone}</p>
                  {s.idDocumentUrl && (
                    <a href={s.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand flex items-center gap-1 mt-1">
                      View ID document <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <span className="text-xs flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full shrink-0">
                  <Clock size={12} /> Pending
                </span>
              </div>

              <input
                placeholder="Optional note (e.g. reason for rejection)"
                value={note[s.id] ?? ""}
                onChange={(e) => setNote({ ...note, [s.id]: e.target.value })}
                className="w-full mt-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
              />

              <div className="flex gap-3 mt-3 flex-wrap">
                <button onClick={() => decide(s.id, "VERIFIED")} className="flex items-center gap-1 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700">
                  <CheckCircle2 size={16} /> Verify
                </button>
                <button onClick={() => decide(s.id, "REJECTED")} className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
