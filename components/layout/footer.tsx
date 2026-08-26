import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-white text-lg mb-2">
            <Logo size={24} />
            PLASU Plug
          </div>
          <p className="text-gray-400">The trusted campus marketplace — buy and sell with verified sellers.</p>
        </div>
        <div>
          <div className="font-semibold text-white mb-2">Marketplace</div>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/marketplace" className="hover:text-white">Browse products</Link></li>
            <li><Link href="/seller/onboarding" className="hover:text-white">Become a seller</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-2">Trust & Safety</div>
          <ul className="space-y-1 text-gray-400">
            <li>Verified Seller program</li>
            <li>Report a listing</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} PLASU Plug. All rights reserved.
      </div>
    </footer>
  );
}
