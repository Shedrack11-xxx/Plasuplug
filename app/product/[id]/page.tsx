import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatNaira } from "@/lib/utils";
import { VerifiedBadge } from "@/components/marketplace/verified-badge";
import { ContactSellerButtons } from "@/components/marketplace/contact-seller-buttons";
import { ReportButton } from "@/components/marketplace/report-button";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      sellerProfile: true,
      seller: { select: { id: true, name: true } },
    },
  });

  if (!product || product.status === "REMOVED") notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid md:grid-cols-2 gap-6 sm:gap-10">
      <div>
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          {product.images[0] ? (
            <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">No image</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {product.images.slice(1).map((img, i) => (
              <div key={i} className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{product.category.name}</span>
        )}
        <h1 className="text-xl sm:text-2xl font-bold mt-1 dark:text-gray-100">{product.title}</h1>
        <p className="text-2xl sm:text-3xl font-extrabold text-brand mt-2">{formatNaira(product.price.toString())}</p>

        <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold dark:text-gray-100">{product.sellerProfile.businessName}</span>
            {product.sellerProfile.verificationStatus === "VERIFIED" && <VerifiedBadge />}
          </div>
          <ContactSellerButtons
            sellerId={product.seller.id}
            productId={product.id}
            whatsapp={product.sellerProfile.whatsapp}
            phone={product.sellerProfile.phone}
            productTitle={product.title}
          />
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-2 dark:text-gray-100">Description</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line text-sm">{product.description}</p>
        </div>

        <ReportButton productId={product.id} />
      </div>
    </div>
  );
}
