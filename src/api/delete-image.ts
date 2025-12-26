import { api } from "@/lib/axios";
import type { RemoveImagePayload, UploadImageResponse } from "@/api/image-types";

export async function removeImage(payload: RemoveImagePayload) {
  const response = await api.delete<UploadImageResponse>("/images", {
    data: payload,
  });

  return response.data;
}
