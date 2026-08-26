import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sellerOnboardingSchema } from "@/lib/validation";
import { requireRole, withErrorHandling } from "@/lib/authz";

// A SELLER-role user submits (or resubmits) their business info + docs for
// review. This ALWAYS lands in PENDING (or stays UNSUBMITTED on failure) —
// there is no client input that can set verificationStatus to VERIFIED.
// Only /api/admin/sellers/[id]/verify, called by an ADMIN, can do that.
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireRole("SELLER");

    const body = await req.json();
    const parsed = sellerOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...parsed.data,
        verificationStatus: "PENDING",
        submittedAt: new Date(),
      },
      update: {
        ...parsed.data,
        // Resubmission after a rejection goes back to PENDING for re-review.
        verificationStatus: "PENDING",
        verificationNote: null,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ sellerProfile: profile }, { status: 201 });
  });
}
