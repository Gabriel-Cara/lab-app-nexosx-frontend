import {
  Hamburger,
  Loader,
  Mail,
  Package,
} from "lucide-react";

interface TypePackagesProps {
  variant?: "box" | "envelope" | "food" | "others";
}

const variants = {
  box: "bg-amber-100 text-amber-800",
  envelope: "bg-teal-100 text-teal-800",
  food: "bg-rose-200 text-rose-800",
  others: "bg-secondary text-secondary-foreground",
};

const labels = {
  box: "Caixa",
  envelope: "Envelope",
  food: "Comida",
  others: "Outros",
};

const icons = {
  box: <Package className="w-4 h-4 text-inherit" />,
  envelope: <Mail className="w-4 h-4 text-inherit" />,
  food: <Hamburger className="w-4 h-4 text-inherit" />,
  others: <Loader className="w-4 h-4 text-inherit" />,
};

export function TypePackages({ variant = "others" }: TypePackagesProps) {
  return (
    <div>
      <span
        className={`px-2 py-1 rounded-full text-sm font-medium flex gap-2 justify-center items-center mx-auto w-fit ${
          variant === "box" ? 
          variants.box : 
          variant === "envelope" ? 
          variants.envelope :
          variant === "food" ?
          variants.food :
          variants.others
        }`}
      >
        {icons[variant]}
        {labels[variant]}
      </span>
    </div>
  );
}
