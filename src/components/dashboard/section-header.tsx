import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  accessLabel: string;
};

export function SectionHeader({
  title,
  description,
  icon: Icon,
  accessLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="rounded-full border bg-background p-2 text-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-lg font-semibold leading-tight">{title}</p>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
      <Badge variant="outline" className="shrink-0">
        {accessLabel}
      </Badge>
    </div>
  );
}
