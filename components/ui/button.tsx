import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ad-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ad-navy text-white hover:bg-ad-navy-deep",
        accent: "bg-ad-accent text-white hover:brightness-95",
        dark: "bg-ad-navy text-white hover:bg-ad-navy-deep",
        outline: "border border-ad-border text-ad-ink hover:bg-ad-surface",
        onDark: "bg-white text-ad-navy hover:bg-white/90",
        onDarkAccent: "bg-ad-accent text-white hover:brightness-95",
        onDarkOutline: "border border-ad-border-dark text-white hover:bg-white/10",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.95rem]",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  href?: string;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
};

export function Button({ variant, size, className, href, children, type, onClick }: ButtonProps) {
  const cls = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
