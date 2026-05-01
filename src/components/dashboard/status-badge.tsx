import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/format";

const styles: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  active: "default",
  completed: "outline",
  open: "destructive",
  resolved: "outline",
  contacted: "outline",
};

export function StatusBadge({ value }: { value: string }) {
  const variant = styles[value] ?? "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {formatLabel(value)}
    </Badge>
  );
}
