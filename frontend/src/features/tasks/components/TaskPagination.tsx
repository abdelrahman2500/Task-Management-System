import { ChevronLeft, ChevronRight } from "lucide-react";

interface TaskPaginationProps { page: number; pageCount: number; total: number; pageSize: number; onPageChange: (page: number) => void; }

export function TaskPagination({ page, pageCount, total, pageSize, onPageChange }: TaskPaginationProps) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return <nav aria-label="Task pagination" className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
    <p>Showing <span className="font-medium text-slate-700">{start}–{end}</span> of <span className="font-medium text-slate-700">{total}</span> tasks</p>
    <div className="flex gap-2"><button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft size={16} />Previous</button><span className="inline-flex items-center px-2">Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Next<ChevronRight size={16} /></button></div>
  </nav>;
}
