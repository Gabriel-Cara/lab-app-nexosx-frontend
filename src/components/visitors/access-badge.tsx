import { Badge } from "../ui/badge";

type VisitorAccessBadgeProps = {
  unlimitedAccess: boolean;
  allowedHours: number | null;
};

export function VisitorAccessBadge({
  unlimitedAccess,
  allowedHours,
}: VisitorAccessBadgeProps) {
  const label = unlimitedAccess
    ? "Sem limite"
    : allowedHours
      ? `${allowedHours}h`
      : "Não informada";
  const className = unlimitedAccess
    ? "border-sky-200 bg-sky-100 text-sky-900"
    : "border-amber-200 bg-amber-100 text-amber-900";

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
