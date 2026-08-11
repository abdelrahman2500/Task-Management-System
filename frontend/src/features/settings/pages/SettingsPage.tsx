import { NavLink, Outlet } from "react-router-dom";
import { User, Shield, SlidersHorizontal, UserCircle2 } from "lucide-react";
import { cn } from "../../../shared/lib/cn";

const tabs = [
  { label: "Profile", path: "/settings/profile", icon: User },
  { label: "Account", path: "/settings/account", icon: UserCircle2 },
  { label: "Security", path: "/settings/security", icon: Shield },
  {
    label: "Preferences",
    path: "/settings/preferences",
    icon: SlidersHorizontal,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account, security, and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar navigation */}
        <nav
          aria-label="Settings navigation"
          className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:w-52 lg:flex-col"
        >
          {tabs.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Content area */}
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
