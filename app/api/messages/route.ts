import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validation";
import { requireUser, withErrorHandling } from "@/lib/authz";

// GET /api/messages?with=<userId> — thread with one other user
// GET /api/messages — list of conversations (most recent message per counterpart)
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const withId = searchParams.get("with");

    if (withId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: withId },
            { senderId: withId, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    }

    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, title: true } },
      },
      take: 100,
    });
    return NextResponse.json({ messages });
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    if (parsed.data.receiverId === user.id) {
      return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { ...parsed.data, senderId: user.id },
    });
    return NextResponse.json({ message }, { status: 201 });
  });
}
