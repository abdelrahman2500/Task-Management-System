import type { LabelHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export default function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-slate-700",
        className,
      )}
      {...props}
    />
  );
}
