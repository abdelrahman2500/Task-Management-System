import { Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { Avatar } from "../ui/Avatar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Tasks",
  "/users": "Users",
  "/settings": "Settings",
};

export default function Navbar() {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();

  const pathSegment = "/" + location.pathname.split("/")[1];
  const title = pageTitles[pathSegment] ?? "Task Manager";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">Welcome back 👋</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
        >
          <Bell size={20} />
        </button>

        {/* User */}
        {currentUser && (
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100"
          >
            <Avatar name={currentUser.name} size="md" />
            <div className="hidden text-left lg:block">
              <p className="font-medium text-slate-900">{currentUser.name}</p>
              <p className="text-sm text-slate-500 capitalize">
                {currentUser.role?.toLowerCase() ?? "member"}
              </p>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}
