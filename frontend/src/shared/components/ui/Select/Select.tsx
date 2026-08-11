import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Accept either options array OR children (for inline <option> usage)
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options, placeholder, children, id, ...props },
    ref,
  ) => {
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

        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition-all outline-none appearance-none",
            "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {/* Support both explicit options array and children */}
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
export { Select };
