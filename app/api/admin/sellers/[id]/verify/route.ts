import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySellerSchema } from "@/lib/validation";
import { requireAdmin, withErrorHandling } from "@/lib/authz";

// POST /api/admin/sellers/:id/verify
// THE ONLY place in the codebase that can set verificationStatus to VERIFIED.
// Gated by requireAdmin(), which re-checks the caller's role from the DB.
// :id here is the SellerProfile id, not the User id.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    const admin = await requireAdmin();

    const body = await req.json();
    const parsed = verifySellerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const profile = await prisma.sellerProfile.update({
      where: { id: params.id },
      data: {
        verificationStatus: parsed.data.decision,
        verificationNote: parsed.data.note,
        verifiedAt: new Date(),
        verifiedById: admin.id,
      },
    });

    return NextResponse.json({ sellerProfile: profile });
  });
}
