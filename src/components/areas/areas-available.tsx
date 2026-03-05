import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Volleyball } from "lucide-react";
import { getAreas } from "@/api/get-areas";

import { ScheduleCard } from "./schedule-card";
import { AreasAvailableSkeleton } from "@/components/areas/areas-available-skeleton";
import { EmptyState } from "@/components/ui/empty";

export function AreasAvailable() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["areas"],
    queryFn: getAreas,
    staleTime: 1000 * 60 * 5,
  });

  const areas = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return <AreasAvailableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex w-auto min-h-60 flex-wrap gap-4 rounded-xl border p-4 mt-2">
        <p className="text-sm text-destructive">
          Não foi possível carregar as áreas.{" "}
          {error instanceof Error ? error.message : ""}
        </p>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <EmptyState
        icon={Volleyball}
        title="Nenhuma área cadastrada"
        description="Cadastre uma área para começar a receber reservas."
        size="sm"
        className="mt-2 min-h-60"
      />
    );
  }

  return (
    <div className="flex gap-4 w-auto border rounded-xl mt-2 p-4 flex-wrap min-h-60">
      {areas.map((area) => {
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
      })}
    </div>
  );
}
