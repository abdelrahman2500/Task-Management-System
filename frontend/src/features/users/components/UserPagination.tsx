import { Pagination } from "../../../shared/components/ui/Pagination";
import type { ListUsersResponse } from "../types";

interface UserPaginationProps {
  data: ListUsersResponse | undefined;
  onPageChange: (page: number) => void;
}

export function UserPagination({ data, onPageChange }: UserPaginationProps) {
  if (!data || data.totalPages <= 1) return null;

  return (
    <Pagination
      page={data.page}
      totalPages={data.totalPages}
      total={data.total}
      pageSize={data.limit}
      onPageChange={onPageChange}
    />
  );
}
