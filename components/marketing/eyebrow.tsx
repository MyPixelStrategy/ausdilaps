import { cn } from "@/lib/utils";

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-heading text-xs font-medium uppercase tracking-[0.18em]",
        className
      )}
    >
      <span className="h-px w-6 bg-current opacity-50" />
      {children}
    </span>
  );
}
