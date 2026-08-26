"use client";

import { useEffect, useState } from "react";
import { ImageUploader } from "./image-uploader";

export function NewProductForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ title: "", description: "", price: "", categoryId: "" });
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
  }, []);

  const inputClass = "w-full mt-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId || undefined,
        images,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 mb-8 space-y-4">
      <h2 className="font-semibold dark:text-gray-100">New listing</h2>
      <div>
        <label className="text-sm font-medium dark:text-gray-200">Title</label>
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium dark:text-gray-200">Description</label>
        <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Price (₦)</label>
          <input required type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium dark:text-gray-200">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
            <option value="">Select</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1 dark:text-gray-200">Photos</label>
        <ImageUploader images={images} onChange={setImages} />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-brand text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60">
          {loading ? "Posting..." : "Post listing"}
        </button>
        <button type="button" onClick={onCancel} className="text-gray-500 dark:text-gray-400 font-medium px-5 py-2">Cancel</button>
      </div>
    </form>
  );
}
