import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export type OverviewCard = {
  id: string;
  title: string;
  value: number;
  trend: string;
  icon: React.ElementType;
  color: string;
};

type OverviewCardsProps = {
  cards: OverviewCard[];
};

const colorClasses = {
  sky: {
    bg: "from-sky-500 to-sky-600",
    light: "bg-sky-50",
    text: "text-sky-600",
  },
  emerald: {
    bg: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-50",
    text: "text-emerald-600",
  },
  indigo: {
    bg: "from-indigo-500 to-indigo-600",
    light: "bg-indigo-50",
    text: "text-indigo-600",
  },
  amber: {
    bg: "from-amber-500 to-amber-600",
    light: "bg-amber-50",
    text: "text-amber-600",
  },
};

export function OverviewCards({ cards }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorClasses[card.color as keyof typeof colorClasses];

        return (
          <Card
            key={card.id}
            className="relative overflow-hidden border bg-background backdrop-blur-sm hover:shadow-lg transition-all duration-300 group"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors.bg} opacity-10 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-300`}
            />
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-foreground">
                  {card.title}
                </p>
                <div
                  className={`p-3 rounded-xl ${colors.light} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
              </div>
              <div className="mb-3">
                <h3 className="text-3xl font-bold text-foreground">
                  {card.value}
                </h3>
              </div>
              {card.trend && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className={`w-3 h-3 mr-1 ${colors.text}`} />
                  <span>{card.trend}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
