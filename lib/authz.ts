/**
 * lib/authz.ts
 * ------------------------------------------------------------------
 * SINGLE SOURCE OF TRUTH for "is this seller allowed to write?"
 *
 * Why this file exists:
 * The JWT session carries a `sellerVerified` convenience flag so the UI
 * can show/hide buttons without an extra round trip. That flag is NOT
 * sufficient for authorization — it can be stale (verified mid-session,
 * rejected mid-session) and a client can send any request it wants
 * directly to the API regardless of what the UI allows.
 *
 * Every mutation that a seller performs (create/update/delete a product,
 * upload a product image, etc.) MUST call `requireVerifiedSeller()` here,
 * which re-reads SellerProfile.verificationStatus from Postgres on every
 * call. There is no client-supplied input, header, or cookie that can
 * satisfy this check other than an admin having actually set the DB row
 * to VERIFIED.
 * ------------------------------------------------------------------
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { NextResponse } from "next/server";

export class AuthzError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

/** Returns the current session's user, or throws 401. */
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthzError("You must be signed in.", 401);
  }
  return session.user as {
    id: string;
    email: string;
    role: "BUYER" | "SELLER" | "ADMIN";
  };
}

/** Requires the signed-in user to have a specific role. */
export async function requireRole(role: "BUYER" | "SELLER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role) {
    throw new AuthzError(`This action requires the ${role} role.`, 403);
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

/**
 * THE critical gate. Re-reads the seller's verification status directly
 * from the database — never trusts the JWT/session for this decision.
 * Throws 403 for anyone who is not a SELLER with an up-to-the-second
 * VERIFIED row in SellerProfile.
 */
export async function requireVerifiedSeller() {
  const user = await requireUser();

  if (user.role !== "SELLER") {
    throw new AuthzError("Only sellers can perform this action.", 403);
  }

  const profile = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, verificationStatus: true },
  });

  if (!profile) {
    throw new AuthzError(
      "You need to complete seller onboarding before listing products.",
      403
    );
  }

  if (profile.verificationStatus !== "VERIFIED") {
    throw new AuthzError(
      "Your seller account is not verified yet. An admin must approve your " +
        "verification before you can post products.",
      403
    );
  }

  return { user, sellerProfileId: profile.id };
}

/** Wraps a route handler body; converts AuthzError into a proper JSON response. */
export async function withErrorHandling(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthzError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
