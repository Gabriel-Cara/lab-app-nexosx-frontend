export type ImageEntityType = "package" | "visit" | "user" | "area" | "event";

export type UploadImagePayload = {
  entityType: ImageEntityType;
  entityId: string;
  image: string;
};

export type UploadImageResponse = {
  imageUrl: string | null;
};

export type RemoveImagePayload = {
  entityType: ImageEntityType;
  entityId: string;
};
