import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validation";
import { requireUser, requireAdmin, withErrorHandling } from "@/lib/authz";

// Any signed-in user can file a report.
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const report = await prisma.report.create({
      data: { ...parsed.data, reporterId: user.id },
    });
    return NextResponse.json({ report }, { status: 201 });
  });
}

// Only admins can see the moderation queue.
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;
    const reports = await prisma.report.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        reporter: { select: { name: true, email: true } },
        product: { select: { id: true, title: true, sellerId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ reports });
  });
}
