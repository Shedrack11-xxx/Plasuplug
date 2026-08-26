"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/utils";
import { NewProductForm } from "@/components/marketplace/new-product-form";
import { AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";

type SellerProfile = {
  id: string;
  businessName: string;
  verificationStatus: "UNSUBMITTED" | "PENDING" | "VERIFIED" | "REJECTED";
  verificationNote: string | null;
  products: any[];
};

export default function SellerDashboardPage() {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    const res = await fetch("/api/seller/me");
    const data = await res.json();
    setProfile(data.sellerProfile);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-gray-400 dark:text-gray-500">Loading...</div>;

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't started seller onboarding yet.</p>
        <Link href="/seller/onboarding" className="bg-brand text-white font-semibold px-6 py-2.5 rounded-lg">
          Start onboarding
        </Link>
      </div>
    );
  }

  const statusBanner = {
    PENDING: {
      icon: Clock,
      color: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      text: "Your seller profile is pending admin review. You can't post products until you're verified.",
    },
    REJECTED: {
      icon: AlertCircle,
      color: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      text: profile.verificationNote
        ? `Your application was rejected: ${profile.verificationNote}. You can resubmit from onboarding.`
        : "Your application was rejected. You can resubmit from onboarding.",
    },
    VERIFIED: {
      icon: CheckCircle2,
      color: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
      text: "You're a verified seller — your listings are live on the marketplace.",
    },
    UNSUBMITTED: {
      icon: AlertCircle,
      color: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      text: "Complete onboarding to start selling.",
    },
  }[profile.verificationStatus];

  const Icon = statusBanner.icon;
  const canPost = profile.verificationStatus === "VERIFIED";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-100">{profile.businessName}</h1>
        <button
          onClick={() => setShowForm(true)}
          disabled={!canPost}
          title={!canPost ? "You must be verified before posting a product" : undefined}
          className="flex items-center gap-1 bg-brand text-white font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> New listing
        </button>
      </div>

      <div className={`border rounded-xl p-4 flex items-start gap-3 mb-8 ${statusBanner.color}`}>
        <Icon size={20} className="shrink-0 mt-0.5" />
        <p className="text-sm">{statusBanner.text}</p>
      </div>

      {showForm && canPost && (
        <NewProductForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <h2 className="font-semibold mb-3 dark:text-gray-100">Your listings ({profile.products.length})</h2>
      {profile.products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No listings yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.products.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm dark:text-gray-100">{p.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">{p.status}</span>
              </div>
              <p className="text-brand font-bold mt-1">{formatNaira(p.price)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
