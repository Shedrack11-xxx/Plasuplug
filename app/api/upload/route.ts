import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUser, withErrorHandling } from "@/lib/authz";

// Generic authenticated image upload used by both:
//  - seller verification documents (private-ish, but Blob is used simply here;
//    swap to a private bucket/ACL in production if docs are sensitive)
//  - product listing photos
// Auth only requires a signed-in user; the *product creation* endpoint is
// what actually enforces seller-verified status, so an unverified seller
// uploading an image alone doesn't get them a live listing.
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    await requireUser();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Max file size is 5MB" }, { status: 400 });
    }

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  });
}
