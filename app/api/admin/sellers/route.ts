import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withErrorHandling } from "@/lib/authz";

// GET /api/admin/sellers?status=PENDING — admin-only list for the review queue.
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const sellers = await prisma.sellerProfile.findMany({
      where: status ? { verificationStatus: status as any } : undefined,
      include: { user: { select: { name: true, email: true, createdAt: true } } },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json({ sellers });
  });
}
