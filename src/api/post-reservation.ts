import { api } from "@/lib/axios";

interface PostReservationRequest {
  areaId: string;
  date: string;
  startSlotId: string;
  endSlotId: string;
  purpose?: string;
}

export async function postReservation(payload: PostReservationRequest) {
  const response = await api.post("/reservations", payload);
  return response.data;
}
