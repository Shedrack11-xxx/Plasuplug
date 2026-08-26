"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { MessageCircle, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg sm:text-xl shrink-0">
          <Logo size={30} />
          <span className="hidden xs:inline">
            PLASU <span className="text-brand">Plug</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/marketplace" className="hover:text-brand dark:text-gray-200 dark:hover:text-accent">
            Marketplace
          </Link>
          {role === "SELLER" && (
            <Link href="/seller/dashboard" className="hover:text-brand dark:text-gray-200 dark:hover:text-accent flex items-center gap-1">
              <LayoutDashboard size={16} /> Seller Dashboard
            </Link>
          )}
          {role === "ADMIN" && (
            <Link href="/admin/dashboard" className="hover:text-brand dark:text-gray-200 dark:hover:text-accent flex items-center gap-1">
              <LayoutDashboard size={16} /> Admin
            </Link>
          )}
          {session && (
            <Link href="/messages" className="hover:text-brand dark:text-gray-200 dark:hover:text-accent flex items-center gap-1">
              <MessageCircle size={16} /> Messages
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <ThemeToggle />
          {!session ? (
            <>
              <Link href="/login" className="text-sm font-medium hover:text-brand dark:text-gray-200 dark:hover:text-accent">
                Log in
              </Link>
              <Link href="/register" className="text-sm font-semibold bg-brand text-white px-4 py-2 rounded-lg hover:bg-brand-dark">
                Sign up
              </Link>
            </>
          ) : (
            <>
              {role === "BUYER" && (
                <Link href="/seller/onboarding" className="text-sm font-semibold bg-brand text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-brand-dark whitespace-nowrap">
                  Become a seller
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1"
              >
                <LogOut size={16} /> Sign out
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="p-2 dark:text-gray-200"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-col gap-3 text-sm font-medium dark:text-gray-200">
          <Link href="/marketplace" onClick={() => setOpen(false)}>Marketplace</Link>
          {role === "SELLER" && <Link href="/seller/dashboard" onClick={() => setOpen(false)}>Seller Dashboard</Link>}
          {role === "ADMIN" && <Link href="/admin/dashboard" onClick={() => setOpen(false)}>Admin</Link>}
          {session && <Link href="/messages" onClick={() => setOpen(false)}>Messages</Link>}
          {!session ? (
            <div className="flex gap-3 pt-2">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1 text-center border border-gray-300 dark:border-gray-700 rounded-lg py-2">
                Log in
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="flex-1 text-center bg-brand text-white rounded-lg py-2">
                Sign up
              </Link>
            </div>
          ) : (
            <>
              {role === "BUYER" && (
                <Link href="/seller/onboarding" onClick={() => setOpen(false)} className="text-center bg-brand text-white rounded-lg py-2">
                  Become a seller
                </Link>
              )}
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-red-600 dark:text-red-400 pt-2">
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
