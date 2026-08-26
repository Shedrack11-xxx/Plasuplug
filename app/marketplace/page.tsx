import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { SearchFilters } from "@/components/marketplace/search-filters";

export const dynamic = "force-dynamic";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; minPrice?: string; maxPrice?: string };
}) {
  const { q, category, minPrice, maxPrice } = searchParams;

  const where: any = {
    status: "ACTIVE",
    sellerProfile: { verificationStatus: "VERIFIED" },
  };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = { slug: category };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, sellerProfile: { select: { businessName: true, verificationStatus: true } } },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 dark:text-gray-100">Marketplace</h1>
      <SearchFilters categories={categories} />
      {products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-8">No products match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mt-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  );
}
