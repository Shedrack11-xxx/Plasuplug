"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchFilters({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/marketplace?${next.toString()}`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", q);
        }}
        className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"
      >
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          className="flex-1 outline-none text-sm bg-transparent dark:text-gray-100 min-w-0"
        />
        <button type="submit" className="text-sm font-semibold text-brand shrink-0">Search</button>
      </form>

      <div className="flex gap-3">
        <select
          value={params.get("category") ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="flex-1 md:flex-none border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
        <input
          type="number"
          placeholder="Min ₦"
          defaultValue={params.get("minPrice") ?? ""}
          onBlur={(e) => updateParam("minPrice", e.target.value)}
          className="w-16 sm:w-20 outline-none text-sm bg-transparent dark:text-gray-100"
        />
        <span className="text-gray-300 dark:text-gray-600">–</span>
        <input
          type="number"
          placeholder="Max ₦"
          defaultValue={params.get("maxPrice") ?? ""}
          onBlur={(e) => updateParam("maxPrice", e.target.value)}
          className="w-16 sm:w-20 outline-none text-sm bg-transparent dark:text-gray-100"
        />
      </div>
    </div>
  );
}
