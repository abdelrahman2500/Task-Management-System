import { Select } from "../../../shared/components/ui/Select";
import { Switch } from "../../../shared/components/ui/Switch";
import type { ListUsersParams } from "../types";
import type { UserRole } from "../../auth/types";

interface UserFiltersProps {
  filters: ListUsersParams;
  onChange: (filters: ListUsersParams) => void;
}

export function UserFilters({ filters, onChange }: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="w-auto min-w-[160px]">
        <Select
          label="Role"
          id="user-role-filter"
          value={filters.role ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              page: 1,
              role: (e.target.value as UserRole) || undefined,
            })
          }
        >
          <option value="">All roles</option>
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MEMBER">Member</option>
          <option value="VIEWER">Viewer</option>
        </Select>
      </div>

      <div className="pb-1">
        <Switch
          label="Active only"
          checked={filters.isActive ?? false}
          onChange={(checked) =>
            onChange({
              ...filters,
              page: 1,
              isActive: checked ? true : undefined,
            })
          }
        />
      </div>
    </div>
  );
}
