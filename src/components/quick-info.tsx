import type { ElementType } from "react";
import { SidebarMenuSubItem } from "./ui/sidebar";

interface QuickInfoProps {
  icon: ElementType;
  info: string;
  value: number;
  status: "pending" | "delivered" | "canceled";
}

const statusColors = {
  pending: "text-amber-500",
  delivered: "text-emerald-500",
  canceled: "text-rose-500",
};

export function QuickInfo({ icon: Icon, info, value, status }: QuickInfoProps) {
  return (
    <>
      <SidebarMenuSubItem className="flex items-center gap-2 text-sm">
        <Icon className={`${statusColors[status]} w-4 h-4`} />
        <span className="text-muted-foreground">{info}</span>
        <span className={`${statusColors[status]} ml-auto font-semibold`}>{value}</span>
      </SidebarMenuSubItem>
    </>
  );
}
