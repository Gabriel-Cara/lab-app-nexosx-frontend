import { api } from "@/lib/axios";

export type EventBookingResident = {
  name: string;
  apartment: string | null;
};

export async function getEventBookings(eventId: string) {
  const response = await api.get<EventBookingResident[]>(
    `/events/${eventId}/bookings`
  );
  return response.data;
}
