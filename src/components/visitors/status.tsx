import { CircleCheckBig, CircleX, Clock, LogIn, LogOut } from "lucide-react";

interface StatusProps {
  variant?: "pending" | "authorized" | "denied" | "entry" |"left";
}

const variants = {
  pending: "bg-secondary text-secondary-foreground",
  authorized: "bg-emerald-100 text-emerald-800",
  denied: "bg-rose-100 text-rose-800",
  entry: "bg-blue-100 text-blue-800",
  left: "bg-primary text-primary-foreground"
}

const labels = {
  pending: "Pendente",
  authorized: "Autorizado",
  denied: "Negado",
  entry: "Entrou",
  left: "Saiu"
}

const icons = {
  pending: <Clock className="w-4 h-4 text-inherit" />,
  authorized: <CircleCheckBig className="w-4 h-4 text-inherit" />,
  denied: <CircleX className="w-4 h-4 text-inherit" />,
  entry: <LogIn className="w-4 h-4 text-inherit" />,
  left: <LogOut className="w-4 h-4 text-inherit" />
}

export function Status({ variant = "pending" }: StatusProps) {
  return (
    <div>
      <span className={`px-2 py-1 rounded-full text-sm font-medium flex gap-2 justify-center items-center mx-auto w-fit ${
        variant === "pending" ? variants.pending :
        variant === "authorized" ? variants.authorized :
        variant === "denied" ? variants.denied :
        variant === "entry" ? variants.entry :
        variants.left
      }`}>
        {icons[variant]}
        {labels[variant]}
      </span>
    </div>
  )
}