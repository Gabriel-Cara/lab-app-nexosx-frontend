import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, startOfMonth, startOfWeek } from "date-fns";

import { getReservations } from "@/api/get-reservations";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function ReservationsOverview() {
  const weekStart = useMemo(() => {
    const date = startOfWeek(new Date(), { weekStartsOn: 1 });
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const weekEnd = useMemo(() => {
    const end = addDays(weekStart, 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [weekStart]);

  const monthStart = useMemo(() => {
    const date = startOfMonth(new Date());
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const { data: pending } = useQuery({
    queryKey: ["reservations-overview", "pending"],
    queryFn: () => getReservations({ status: "pending" }),
    staleTime: 1000 * 60,
  });

  const { data: approvedThisWeek } = useQuery({
    queryKey: ["reservations-overview", "approved-week"],
    queryFn: () =>
      getReservations({
        status: "approved",
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      }),
    staleTime: 1000 * 60,
  });

  const { data: cancelledThisMonth } = useQuery({
    queryKey: ["reservations-overview", "cancelled-month"],
    queryFn: () =>
      getReservations({
        status: "cancelled",
        startDate: monthStart.toISOString(),
      }),
    staleTime: 1000 * 60,
  });

  const { data: weekRequests } = useQuery({
    queryKey: ["reservations-overview", "week-total"],
    queryFn: () =>
      getReservations({
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
      }),
    staleTime: 1000 * 60,
  });

  const stats = [
    {
      label: "Pendentes",
      value: pending?.length ?? 0,
      description: "Aguardando aprovação",
    },
    {
      label: "Confirmadas (semana)",
      value: approvedThisWeek?.length ?? 0,
      description: "Reservas aprovadas esta semana",
    },
    {
      label: "Canceladas (mês)",
      value: cancelledThisMonth?.length ?? 0,
      description: "Solicitações canceladas no mês",
    },
    {
      label: "Solicitações (semana)",
      value: weekRequests?.length ?? 0,
      description: "Total recebido nesta semana",
    },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="flex-1 min-w-[180px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
