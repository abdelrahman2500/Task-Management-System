import { FolderKanban } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <FolderKanban className="h-8 w-8 text-blue-600" />
      <span className="text-xl font-bold text-slate-900">Task Manager</span>
    </div>
  );
}
