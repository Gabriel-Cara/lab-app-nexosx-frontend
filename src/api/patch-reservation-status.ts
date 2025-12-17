import { api } from "@/lib/axios";

export async function approveReservation(id: string) {
  await api.patch(`/reservations/${id}/approve`);
}

export async function rejectReservation(id: string) {
  await api.patch(`/reservations/${id}/reject`);
}
