import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/settings": "Settings",
};

export default function Navbar() {
  const location = useLocation();

  const title = pageTitles[location.pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Left */}

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

        <p className="text-sm text-slate-500">Welcome back 👋</p>
      </div>

      {/* Right */}

      <div className="flex items-center gap-4">
        {/* Search */}

        <div className="relative hidden md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="h-11 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Notification */}

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100">
          <Bell size={20} />
        </button>

        {/* User */}

        <button className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            AK
          </div>

          <div className="hidden text-left lg:block">
            <p className="font-medium text-slate-900">AbdelRahman</p>

            <p className="text-sm text-slate-500">Frontend Developer</p>
          </div>
        </button>
      </div>
    </header>
  );
}
