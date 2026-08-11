import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, rows = 4, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          className={cn(
            "w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 transition-all outline-none",
            "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
export { Textarea };
