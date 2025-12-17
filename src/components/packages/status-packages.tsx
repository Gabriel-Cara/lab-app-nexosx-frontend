import { AlertTriangle, Ban, CircleCheckBig, Clock } from "lucide-react";

type StatusVariant = "pending" | "retrieved" | "cancelled" | "delayed";

interface StatusPackagesProps {
  variant?: StatusVariant;
}

const variants = {
  pending: "bg-secondary text-secondary-foreground",
  retrieved: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  delayed: "bg-amber-100 text-amber-800",
};

const labels = {
  pending: "Pendente",
  retrieved: "Retirada",
  cancelled: "Cancelada",
  delayed: "Atrasada",
};

const icons = {
  pending: <Clock className="w-4 h-4 text-inherit" />,
  retrieved: <CircleCheckBig className="w-4 h-4 text-inherit" />,
  cancelled: <Ban className="w-4 h-4 text-inherit" />,
  delayed: <AlertTriangle className="w-4 h-4 text-inherit" />,
};

export function StatusPackages({ variant = "pending" }: StatusPackagesProps) {
  return (
    <div>
      <span className={`px-2 py-1 rounded-full text-sm font-medium flex gap-2 justify-center items-center mx-auto w-fit ${variants[variant]}`}>
        {icons[variant]}
        {labels[variant]}
      </span>
    </div>
  );
}
