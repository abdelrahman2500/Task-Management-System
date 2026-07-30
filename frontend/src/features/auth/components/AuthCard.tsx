import type { PropsWithChildren } from "react";
import { Card } from "../../../shared/components/ui/Card";

export default function AuthCard({ children }: PropsWithChildren) {
  return (
    <Card className="w-full max-w-md rounded-3xl p-10 shadow-2xl">
      {children}
    </Card>
  );
}
