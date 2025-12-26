import { api } from "@/lib/axios";
import type { UploadImagePayload, UploadImageResponse } from "@/api/image-types";

export async function uploadImage(payload: UploadImagePayload) {
  const response = await api.post<UploadImageResponse>("/images", payload);
  return response.data;
}
