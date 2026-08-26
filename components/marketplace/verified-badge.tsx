import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold text-brand bg-brand-light dark:bg-brand/20 dark:text-emerald-300 px-2 py-0.5 rounded-full",
        className
      )}
      title="Verified by PLASU Plug"
    >
      <BadgeCheck size={14} className="fill-brand text-white dark:fill-emerald-300 dark:text-gray-900" />
      Verified Seller
    </span>
  );
}
