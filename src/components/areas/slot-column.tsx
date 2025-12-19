import { Loader2 } from "lucide-react";

import { type AreaSlot } from "@/api/get-area-slots";

import { Label } from "../ui/label";
import { SlotButton } from "./slot-button";

interface SlotColumnProps {
  title: string;
  slots: AreaSlot[];
  selectedId: string | null;
  onSelect: (slot: AreaSlot) => void;
  isLoading: boolean;
  hint?: string;
  isSlotDisabled: (slot: AreaSlot) => boolean;
  isSlotInRange?: (slot: AreaSlot) => boolean;
  variant: "start" | "end";
}

export function SlotColumn({
  title,
  slots,
  selectedId,
  onSelect,
  isLoading,
  isSlotDisabled,
  isSlotInRange,
  variant,
}: SlotColumnProps) {
  return (
    <div className="space-y-2 p-4 md:px-2">
      <Label>{title}</Label>
      <div className="md:h-[248px] max-w-[200px] sm:w-fit overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Carregando horários disponíveis
          </div>
        ) : slots.length === 0 ? (
          <p className="px-2 pt-4 text-center text-sm text-muted-foreground">
            Nenhum horário configurado para esta área.
          </p>
        ) : (
          <div className="flex md:flex-col gap-2">
            {slots.map((slot) => (
              <SlotButton
                key={`${title}-${slot.id}`}
                disabled={isSlotDisabled(slot)}
                selected={selectedId === slot.id}
                inRange={isSlotInRange ? isSlotInRange(slot) : false}
                label={variant === "start" ? slot.startsAt : slot.endsAt}
                startsAt={slot.startsAt}
                endsAt={slot.endsAt}
                onClick={() => onSelect(slot)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
