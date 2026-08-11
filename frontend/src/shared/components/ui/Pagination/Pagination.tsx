import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../../../lib/cn";
import Button from "../Button/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(1, page - 1);
      const right = Math.min(totalPages, page + 1);

      pages.push(1);
      if (left > 2) pages.push("ellipsis");
      for (let i = left; i <= right; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }
      if (right < totalPages - 1) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4", className)}>
      {total !== undefined && pageSize !== undefined && (
        <p className="text-sm text-slate-600">
          Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} results
        </p>
      )}

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-auto h-9 px-2"
          onClick={() => onPageChange(1)}
          disabled={!canGoBack}
          aria-label="Go to first page"
        >
          <ChevronsLeft size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-auto h-9 px-2"
          onClick={() => onPageChange(page - 1)}
          disabled={!canGoBack}
          aria-label="Go to previous page"
        >
          <ChevronLeft size={16} />
        </Button>

        {getPageNumbers().map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <Button
              key={p}
              type="button"
              variant={p === page ? "primary" : "outline"}
              size="sm"
              className="w-auto h-9 min-w-[36px] px-3"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-auto h-9 px-2"
          onClick={() => onPageChange(page + 1)}
          disabled={!canGoForward}
          aria-label="Go to next page"
        >
          <ChevronRight size={16} />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-auto h-9 px-2"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoForward}
          aria-label="Go to last page"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
}
