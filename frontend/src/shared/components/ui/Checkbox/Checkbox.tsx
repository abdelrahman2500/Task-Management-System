import { useId, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "../../../lib/cn";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export default function Checkbox({
  className,
  label,
  checked,
  disabled,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <div className="relative">
        <input
          id={checkboxId}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <div
          className={cn(
            "w-5 h-5 rounded border-2 border-slate-300 bg-white transition-all",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100 peer-focus-visible:border-blue-500",
            "peer-checked:bg-blue-600 peer-checked:border-blue-600",
          )}
        />
        <Check
          size={14}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity",
            checked && "opacity-100",
          )}
          strokeWidth={3}
        />
      </div>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

export { Checkbox };
