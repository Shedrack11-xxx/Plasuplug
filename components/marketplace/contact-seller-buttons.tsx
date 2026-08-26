"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { waLink } from "@/lib/utils";
import { useState } from "react";

export function ContactSellerButtons({
  sellerId,
  productId,
  whatsapp,
  phone,
  productTitle,
}: {
  sellerId: string;
  productId: string;
  whatsapp: string;
  phone: string;
  productTitle: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMessage() {
    if (!session) {
      router.push("/login");
      return;
    }
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: sellerId,
          productId,
          content: `Hi, I'm interested in "${productTitle}". Is it still available?`,
        }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      <a
        href={waLink(whatsapp, `Hi, I'm interested in "${productTitle}" on PLASU Plug.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700"
      >
        <MessageCircle size={18} /> Chat on WhatsApp
      </a>
      <a
        href={`tel:${phone}`}
        className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 dark:text-gray-200 font-semibold py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <Phone size={18} /> Call {phone}
      </a>
      <button
        onClick={sendMessage}
        disabled={sending || sent}
        className="text-sm font-medium text-brand hover:underline disabled:text-gray-400 dark:disabled:text-gray-600"
      >
        {sent ? "Message sent — check your inbox" : sending ? "Sending..." : "Or message on PLASU Plug"}
      </button>
    </div>
  );
}
