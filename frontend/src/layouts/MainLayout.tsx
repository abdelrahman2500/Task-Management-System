import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar/Sidebar";
import Navbar from "../shared/components/Navbar/Navbar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
