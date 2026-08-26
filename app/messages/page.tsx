"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "@/lib/format-time";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: { id: string; name: string; image: string | null };
  receiver: { id: string; name: string; image: string | null };
  product: { id: string; title: string } | null;
};

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/messages");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/messages").then((r) => r.json()).then((d) => {
      setMessages(d.messages ?? []);
      setLoading(false);
    });
  }, []);

  const myId = (session?.user as any)?.id;
  const conversations = new Map<string, Message>();
  for (const m of messages) {
    const otherId = m.senderId === myId ? m.receiverId : m.senderId;
    if (!conversations.has(otherId)) conversations.set(otherId, m);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 dark:text-gray-100">Messages</h1>
      {loading ? (
        <p className="text-gray-400 dark:text-gray-500">Loading...</p>
      ) : conversations.size === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet. Message a seller from a product page to start one.</p>
      ) : (
        <div className="space-y-2">
          {Array.from(conversations.entries()).map(([otherId, m]) => {
            const other = m.senderId === myId ? m.receiver : m.sender;
            return (
              <div key={otherId} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-baseline gap-2">
                  <span className="font-semibold text-sm dark:text-gray-100">{other.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDistanceToNow(m.createdAt)}</span>
                </div>
                {m.product && <p className="text-xs text-brand">Re: {m.product.title}</p>}
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">{m.content}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
