import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, withErrorHandling } from "@/lib/authz";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireRole("SELLER");
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
      include: { products: { orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json({ sellerProfile: profile });
  });
}
