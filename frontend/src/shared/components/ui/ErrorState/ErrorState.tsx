import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../Button/Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading data. Please try again.",
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle size={36} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} loading={isRetrying} className="w-auto">
          <RefreshCw size={16} className="mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
