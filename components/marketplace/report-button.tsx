"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ReportButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    if (!session) return router.push("/login");
    if (!reason.trim()) return;
    await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, reason }),
    });
    setSubmitted(true);
  }

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1">
          <Flag size={14} /> Report this listing
        </button>
      ) : submitted ? (
        <p className="text-sm text-green-600 dark:text-green-400">Thanks — our team will review this listing.</p>
      ) : (
        <div className="flex flex-col gap-2 max-w-sm">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for reporting"
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={submit} className="self-start text-sm font-semibold text-red-600 dark:text-red-400">
            Submit report
          </button>
        </div>
      )}
    </div>
  );
}
