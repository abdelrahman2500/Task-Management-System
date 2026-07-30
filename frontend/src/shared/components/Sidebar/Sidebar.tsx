import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { navigation } from "./navigation.ts";
import { NavItem } from "./NavItem.tsx";

import { authServices } from "../../../features/auth/api/auth.service";
import { Button } from "../../../shared/components/ui/Button";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authServices.logout();
    navigate("/auth/login", { replace: true });
  };

  return (
    <aside className="flex w-72 flex-col border-r border-slate-200 bg-white p-6">
      {/* Logo */}

      <div>
        <h1 className="text-2xl font-bold text-blue-600">Task Manager</h1>

        <p className="mt-1 text-sm text-slate-500">Project Management</p>
      </div>

      {/* Navigation */}

      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navigation.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* Logout */}

      <Button
        variant="outline"
        onClick={handleLogout}
        className="justify-start"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </Button>
    </aside>
  );
}
