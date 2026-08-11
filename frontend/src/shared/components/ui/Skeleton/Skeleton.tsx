import type { HTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-slate-200";

  const variantStyles = {
    text: "h-4 rounded w-full",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
      }}
      {...props}
    />
  );
}
