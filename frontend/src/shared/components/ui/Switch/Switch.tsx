import { useId } from "react";
import { cn } from "../../../lib/cn";

interface SwitchProps {
  checked: boolean;
  /** Called with the new boolean value when the switch is toggled */
  onChange?: (checked: boolean) => void;
  /** Alias for onChange — kept for compatibility */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  id?: string;
}

function Switch({
  checked,
  onChange,
  onCheckedChange,
  disabled = false,
  label,
  className,
  id,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id ?? generatedId;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.checked;
    onChange?.(value);
    onCheckedChange?.(value);
  };

  return (
    <label
      htmlFor={switchId}
      className={cn(
        "inline-flex items-center gap-3 cursor-pointer select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <div
          className={cn(
            "w-11 h-6 rounded-full bg-slate-200 transition-colors",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-blue-100",
            checked && "bg-blue-600",
          )}
        />
        <div
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </div>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

export { Switch };
export default Switch;
