import { cn } from "@/lib/utils";

interface SlotButtonProps {
  label: string;
  startsAt: string;
  endsAt: string;
  selected?: boolean;
  inRange?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SlotButton({
  label,
  selected = false,
  inRange = false,
  disabled = false,
  onClick,
}: SlotButtonProps) {
  const rangeClass = inRange
    ? "border-primary/60 bg-primary/10 text-primary"
    : "bg-background hover:border-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border px-4 py-2 text-left text-sm transition-all",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : rangeClass
      )}
    >
      <span className="block font-medium">{label}</span>
    </button>
  );
}
