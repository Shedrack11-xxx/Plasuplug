"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Trash2, CheckCircle2, XCircle } from "lucide-react";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { name: string; email: string };
  product: { id: string; title: string } | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/reports?status=OPEN");
    const data = await res.json();
    setReports(data.reports ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string, status: "RESOLVED" | "DISMISSED", removeProduct = false) {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, removeProduct }),
    });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 dark:text-gray-100">Reports & moderation</h1>

      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No open reports.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    <Flag size={14} /> {r.reason}
                  </div>
                  {r.details && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{r.details}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Reported by {r.reporter.name} ({r.reporter.email})</p>
                  {r.product && (
                    <Link href={`/product/${r.product.id}`} className="text-sm text-brand mt-1 inline-block">
                      View listing: {r.product.title}
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-3 flex-wrap">
                <button onClick={() => resolve(r.id, "RESOLVED", true)} className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40">
                  <Trash2 size={16} /> Remove listing
                </button>
                <button onClick={() => resolve(r.id, "DISMISSED")} className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 dark:text-gray-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <XCircle size={16} /> Dismiss
                </button>
                <button onClick={() => resolve(r.id, "RESOLVED")} className="flex items-center gap-1 bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700">
                  <CheckCircle2 size={16} /> Mark resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
