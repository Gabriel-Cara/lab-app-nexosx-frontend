import { api } from "@/lib/axios";

export interface Reservation {
  id: string;
  areaId: string;
  residentId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  area: {
    id: string;
    name: string;
  };
  resident: {
    name: string;
    apartment: string | null;
  };
}

interface GetReservationsParams {
  areaId?: string;
  status?: Reservation["status"];
  startDate?: string;
  endDate?: string;
}

interface GetReservationsResponse {
  reservations: Reservation[];
}

export async function getReservations(params?: GetReservationsParams) {
  const response = await api.get<GetReservationsResponse>("/reservations", {
    params,
  });

  return response.data.reservations;
}
