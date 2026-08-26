import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, withErrorHandling } from "@/lib/authz";
import { z } from "zod";

const resolveSchema = z.object({
  status: z.enum(["REVIEWING", "RESOLVED", "DISMISSED"]),
  resolutionNote: z.string().max(500).optional(),
  removeProduct: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return withErrorHandling(async () => {
    await requireAdmin();
    const body = await req.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        resolutionNote: parsed.data.resolutionNote,
        resolvedAt: parsed.data.status === "RESOLVED" || parsed.data.status === "DISMISSED" ? new Date() : undefined,
      },
    });

    if (parsed.data.removeProduct && report.productId) {
      await prisma.product.update({
        where: { id: report.productId },
        data: { status: "REMOVED" },
      });
    }

    return NextResponse.json({ report });
  });
}
