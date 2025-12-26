import { api } from "@/lib/axios";

type PostEventBookingBody = {
  eventId: string;
  notes?: string;
};

export async function postEventBooking(payload: PostEventBookingBody) {
  const response = await api.post("/events/book", payload);
  return response.data;
}
