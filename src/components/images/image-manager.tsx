import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ImageEntityType } from "@/api/image-types";
import { removeImage } from "@/api/delete-image";
import { uploadImage } from "@/api/post-image";
import { ImageDropzone } from "@/components/images/image-dropzone";
import { Label } from "@/components/ui/label";
import { fileToDataUrl } from "@/utils/image-utils";

type ImageManagerProps = {
  entityType: ImageEntityType;
  entityId: string;
  imageUrl?: string | null;
  label?: string;
  disabled?: boolean;
  shape?: "rect" | "round";
  sizeClass?: string;
  onUpdated?: (imageUrl: string | null) => void;
};

export function ImageManager({
  entityType,
  entityId,
  imageUrl,
  label = "Imagem",
  disabled = false,
  shape = "rect",
  sizeClass,
  onUpdated,
}: ImageManagerProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setPreview(imageUrl ?? null);
    setSelectedFiles([]);
  }, [imageUrl]);

  async function handleDropzoneChange(nextFiles: File[]) {
    setSelectedFiles(nextFiles);
    const file = nextFiles[0];

    if (!file || disabled || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      const dataUrl = await fileToDataUrl(file);
      const response = await uploadImage({
        entityType,
        entityId,
        image: dataUrl,
      });

      const nextUrl = response.imageUrl ?? dataUrl;
      setPreview(nextUrl);
      onUpdated?.(nextUrl);
      toast.success("Imagem atualizada com sucesso!");
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Não foi possível atualizar a imagem.");
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRemove() {
    try {
      setIsBusy(true);
      await removeImage({ entityType, entityId });
      setPreview(null);
      setSelectedFiles([]);
      onUpdated?.(null);
      toast.success("Imagem removida com sucesso!");
    } catch (error) {
      toast.error("Não foi possível remover a imagem.");
      console.error(error);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <ImageDropzone
        value={selectedFiles}
        onChange={handleDropzoneChange}
        maxFiles={1}
        maxSizeMB={4}
        disabled={disabled || isBusy}
        previewUrl={preview}
        previewName={label}
        onRemovePreview={preview && !disabled ? handleRemove : undefined}
        shape={shape}
        sizeClass={sizeClass}
        label="Arraste e solte a imagem aqui, ou clique para selecionar"
        helper="PNG, JPG, WEBP ou GIF"
      />
    </div>
  );
}
