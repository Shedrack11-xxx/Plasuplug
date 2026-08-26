import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { requireVerifiedSeller, withErrorHandling } from "@/lib/authz";

// GET /api/products?q=&category=&minPrice=&maxPrice=&page=
// Public. Only ever returns ACTIVE products from VERIFIED sellers —
// this is a second, read-side enforcement of the "unverified sellers are
// invisible on the marketplace" rule, independent of the write-side guard.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category") ?? undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 24;

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

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        sellerProfile: { select: { businessName: true, verificationStatus: true, whatsapp: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, pageSize });
}

// POST /api/products
// Creates a product listing. Gated entirely by requireVerifiedSeller(),
// which re-checks the DB — there is no way to reach product creation
// as an unverified seller, regardless of what the client sends.
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const { sellerProfileId, user } = await requireVerifiedSeller();

    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        sellerId: user.id,
        sellerProfileId,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  });
}
