import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { ShieldCheck, Search, MessagesSquare, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
    prisma.product.findMany({
      where: { status: "ACTIVE", sellerProfile: { verificationStatus: "VERIFIED" } },
      include: { category: true, sellerProfile: { select: { businessName: true, verificationStatus: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight">
              Buy & sell on campus, <span className="text-accent">safely</span>.
            </h1>
            <p className="mt-4 text-white/90 text-sm sm:text-base md:text-lg">
              PLASU Plug connects students with verified sellers for the products you actually need — no guesswork, no scams.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Link href="/marketplace" className="bg-white text-brand-dark font-semibold px-5 sm:px-6 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm sm:text-base">
                Browse marketplace <ArrowRight size={18} />
              </Link>
              <Link href="/seller/onboarding" className="border border-white/60 font-semibold px-5 sm:px-6 py-3 rounded-lg hover:bg-white/10 text-sm sm:text-base">
                Become a seller
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-accent" />
                <span className="font-semibold">Verified Seller Program</span>
              </div>
              <p className="text-sm text-white/80">
                Every seller badge is manually reviewed by our admin team before they can list a single product — enforced at the server, not just the UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          { icon: ShieldCheck, title: "Verified Sellers", body: "Every seller is ID-checked and admin-approved before they can post." },
          { icon: Search, title: "Easy Discovery", body: "Search and filter by category, price, and campus location." },
          { icon: MessagesSquare, title: "Direct Contact", body: "Message sellers in-app or reach them instantly on WhatsApp." },
        ].map((f) => (
          <div key={f.title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6">
            <f.icon className="text-brand mb-3" size={28} />
            <h3 className="font-semibold mb-1 dark:text-gray-100">{f.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{f.body}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h2 className="text-xl font-bold mb-4 dark:text-gray-100">Browse categories</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/marketplace?category=${c.slug}`}
                className="px-3 sm:px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-gray-200 text-sm font-medium hover:border-brand hover:text-brand"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold dark:text-gray-100">Latest listings</h2>
          <Link href="/marketplace" className="text-brand text-sm font-semibold flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No listings yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p as any} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
