import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-6 text-sm font-medium overflow-x-auto">
          <Link href="/admin/dashboard" className="py-3 border-b-2 border-transparent hover:border-brand dark:text-gray-200 whitespace-nowrap">
            Seller verification
          </Link>
          <Link href="/admin/reports" className="py-3 border-b-2 border-transparent hover:border-brand dark:text-gray-200 whitespace-nowrap">
            Reports & moderation
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
