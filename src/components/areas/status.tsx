import { CalendarCheck, CircleCheckBig, CircleDashed, CircleX } from "lucide-react";

interface StatusProps {
  variant?: "available" | "scheduled" | "pending" | "confirmed" | "denied";
}

const variants = {
  available: "bg-secondary text-secondary-foreground",
  scheduled: "bg-blue-100 text-blue-800",
  pending: "bg-secondary text-secondary-foreground",
  confirmed: "bg-emerald-100 text-emerald-800",
  denied: "bg-rose-100 text-rose-800",
}

const labels = {
  available: "Disponível",
  scheduled: "Agendado",
  pending: "Pendente",
  confirmed: "Confirmado",
  denied: "Indisponível"
}

const icons = {
  available: <CircleCheckBig className="w-4 h-4 text-inherit" />,
  scheduled: <CalendarCheck className="w-4 h-4 text-inherit" />,
  pending: <CircleDashed className="w-4 h-4 text-inherit" />,
  confirmed: <CircleCheckBig className="w-4 h-4 text-inherit" />,
  denied: <CircleX className="w-4 h-4 text-inherit" />
}

export function Status({ variant = "pending" }: StatusProps) {
  return (
    <div>
      <span className={`px-2 py-1 rounded-full text-sm font-medium flex gap-2 justify-center items-center mx-auto w-fit ${
        variant === "pending" ? variants.pending :
        variant === "confirmed" ? variants.confirmed :
        variant === "denied" ? variants.denied :
        variant === "available" ? variants.available :
        variants.scheduled
      }`}>
        {icons[variant]}
        {labels[variant]}
      </span>
    </div>
  )
}