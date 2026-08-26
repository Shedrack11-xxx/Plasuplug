import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validation";
import { requireUser, requireVerifiedSeller, withErrorHandling, AuthzError } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      sellerProfile: { select: { businessName: true, verificationStatus: true, whatsapp: true, phone: true } },
    },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

// PATCH: only the owning, currently-verified seller may edit their listing.
// If a seller's verification is later revoked, this re-check blocks further
// edits even though the product already exists.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const { user } = await requireVerifiedSeller();

    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.sellerId !== user.id) {
      throw new AuthzError("You can only edit your own listings.", 403);
    }

    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json({ product });
  });
}

// DELETE: owner or admin.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const existing = await prisma.product.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.sellerId !== user.id && user.role !== "ADMIN") {
      throw new AuthzError("You don't have permission to delete this listing.", 403);
    }

    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  });
}
