import { LogOut, Users } from "lucide-react";
import { navigation } from "./navigation.ts";
import { NavItem } from "./NavItem.tsx";
import { Button } from "../../../shared/components/ui/Button";
import { useLogout } from "../../../features/auth/hooks/useLogout";
import { useCurrentUser } from "../../../features/auth/hooks/useCurrentUser";
import { Avatar } from "../ui/Avatar";
import { can } from "../../permissions/can";

export default function Sidebar() {
  const { mutate: logout, isPending } = useLogout();
  const { data: currentUser } = useCurrentUser();

  const isAdmin = can(currentUser, "manage", "users");

  return (
    <aside className="flex w-72 flex-col border-r border-slate-200 bg-white p-6">
      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold text-blue-600">Task Manager</h1>
        <p className="mt-1 text-sm text-slate-500">Project Management</p>
      </div>

      {/* Navigation */}
      <nav
        className="mt-10 flex flex-1 flex-col gap-2"
        aria-label="Main navigation"
      >
        {navigation.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
        {isAdmin && <NavItem label="Users" path="/users" icon={Users} />}
      </nav>

      {/* Current user */}
      {currentUser && (
        <div className="mb-4 flex items-center gap-3 rounded-xl px-3 py-2">
          <Avatar name={currentUser.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {currentUser.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {currentUser.email}
            </p>
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        onClick={() => logout()}
        loading={isPending}
        className="justify-start"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </aside>
  );
}
