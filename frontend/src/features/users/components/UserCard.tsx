import { Card } from "../../../shared/components/ui/Card";
import { Avatar } from "../../../shared/components/ui/Avatar";
import { Badge } from "../../../shared/components/ui/Badge";
import { ROLE_LABELS } from "../schemas/user.schema";
import type { User } from "../types";
import { Mail, Calendar, Shield, Activity } from "lucide-react";

interface UserCardProps {
  user: User;
  className?: string;
}

export function UserCard({ user, className }: UserCardProps) {
  const roleVariants: Record<string, "default" | "info" | "success" | "warning" | "danger" | "secondary"> = {
    OWNER: "danger",
    ADMIN: "warning",
    MEMBER: "info",
    VIEWER: "secondary",
  };

  return (
    <Card className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <Avatar name={user.name} size="xl" />
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={roleVariants[user.role] ?? "default"}>
                <Shield size={12} className="mr-1" />
                {ROLE_LABELS[user.role]}
              </Badge>
              <Badge variant={user.isActive ? "success" : "default"}>
                <Activity size={12} className="mr-1" />
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail size={16} className="text-slate-400" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              <span>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
