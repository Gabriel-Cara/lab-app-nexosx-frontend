import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "../ui/card";
import { ScheduleModal } from "./schedule-modal";
import { Status } from "./status";

import { Clock, MapPin } from "lucide-react";
import { EditModal } from "./edit-modal";
import { DeleteModal } from "./delete-modal";

interface ScheduleCardProps {
  id: string;
  name: string;
  status: "available" | "scheduled" | "pending" | "confirmed" | "denied";
  description: string;
  capacity: number;
  openTime: string;
  closeTime: string;
}

export function ScheduleCard({
  id,
  name,
  status,
  description,
  capacity,
  openTime,
  closeTime,
}: ScheduleCardProps) {
  const { session } = useAuth();

  return (
    <Card className="w-full not-md:min-w-full md:min-w-1/3 md:max-w-1/2 xl:min-w-1/5 xl:max-w-1/4 flex-1">
      <CardHeader>
        <CardTitle className="font-normal flex flex-wrap items-center justify-between gap-4">
          {name} <Status variant={status} />
        </CardTitle>
        <CardDescription className="mt-4">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2" size={16} />
            <span className="text-sm">{capacity} pessoas</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2" size={16} />
            <span className="text-sm">
              {openTime} às {closeTime}
            </span>
          </div>
        </div>
        <CardAction>
          {session?.user.role === "resident" && (
            <ScheduleModal areaId={id} status={status} />
          )}
          {session?.user.role !== "resident" && (
            <div className="flex gap-2 flex-col">
              <EditModal areaId={id} />
              <DeleteModal areaId={id} name={name} />
            </div>
          )}
        </CardAction>
      </CardContent>
    </Card>
  );
}
