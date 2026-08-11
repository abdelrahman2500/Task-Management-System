import { AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";

interface TaskErrorStateProps { isRetrying: boolean; onRetry: () => void; }

export function TaskErrorState({ isRetrying, onRetry }: TaskErrorStateProps) {
  return <section role="alert" className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center"><span className="rounded-full bg-red-100 p-3 text-red-600"><AlertCircle size={28} aria-hidden="true" /></span><h2 className="mt-4 text-lg font-semibold text-slate-900">We couldn’t load your tasks</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Check your connection, then try again. Your changes have not been lost.</p><Button variant="outline" className="mt-6 w-full border-red-200 bg-white sm:w-auto" loading={isRetrying} onClick={onRetry}>Try again</Button></section>;
}
