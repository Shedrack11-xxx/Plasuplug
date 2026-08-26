import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/utils";
import { VerifiedBadge } from "./verified-badge";

export type ProductCardData = {
  id: string;
  title: string;
  price: number | string;
  images: string[];
  category?: { name: string } | null;
  sellerProfile: { businessName: string; verificationStatus: string };
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = product.images?.[0];
  return (
    <Link
      href={`/product/${product.id}`}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md dark:hover:shadow-black/40 transition-shadow"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        {img ? (
          <Image src={img} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">No image</div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/90 dark:bg-gray-900/90 dark:text-gray-200 text-xs font-medium px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1 dark:text-gray-100">{product.title}</h3>
        <p className="text-brand font-bold mt-1">{formatNaira(product.price)}</p>
        <div className="flex items-center justify-between mt-2 gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{product.sellerProfile.businessName}</span>
          {product.sellerProfile.verificationStatus === "VERIFIED" && <VerifiedBadge className="shrink-0" />}
        </div>
      </div>
    </Link>
  );
}
