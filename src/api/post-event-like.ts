import { api } from "@/lib/axios";

export async function postEventLike(eventId: string) {
  const response = await api.post(`/events/${eventId}/like`);
  return response.data;
}
