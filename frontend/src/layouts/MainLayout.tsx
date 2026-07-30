import { Outlet } from "react-router-dom";
import Sidebar from "../shared/components/Sidebar/Sidebar";
import Navbar from "../shared/components/Navbar/Navbar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
