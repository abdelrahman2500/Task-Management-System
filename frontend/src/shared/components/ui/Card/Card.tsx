import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export default function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-xl backdrop-blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
