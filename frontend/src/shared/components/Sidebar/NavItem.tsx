import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

interface NavItemProps {
  label: string;
  path: string;
  icon: LucideIcon;
}

export function NavItem({ label, path, icon: Icon }: NavItemProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          isActive
            ? "bg-blue-600 text-white shadow-lg"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )
      }
    >
      <Icon size={20} />

      <span>{label}</span>
    </NavLink>
  );
}
