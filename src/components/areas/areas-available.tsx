import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { getAreas } from "@/api/get-areas";

import { ScheduleCard } from "./schedule-card";

export function AreasAvailable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    staleTime: 1000 * 60 * 5,
  });

  const areas = useMemo(() => data ?? [], [data]);

  return (
    
    <div className="flex gap-4 w-auto border rounded-xl mt-2 p-4 flex-wrap min-h-60">
      {isLoading ? (
        <div className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando áreas disponíveis...
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Não foi possível carregar as áreas.{" "}
          {error instanceof Error ? error.message : ""}
        </p>
      ) : areas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma área cadastrada até o momento.
        </p>
      ) : (
        areas.map((area) => {
          const slots = area.timeSlots ?? [];
          const openTime = slots[0]?.startsAt ?? "08:00";
          const closeTime = slots[slots.length - 1]?.endsAt ?? "18:00";

          return (
            <ScheduleCard
              key={area.id}
              id={area.id}
              name={area.name}
              status={area.available ? "available" : "denied"}
              description={area.description ?? "Sem descrição"}
              capacity={area.capacity ?? 0}
              openTime={openTime}
              closeTime={closeTime}
            />
          );
        })
      )}
    </div>
  );
}
