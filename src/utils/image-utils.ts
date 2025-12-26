export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export type ImageValidationOptions = {
  accept?: string[];
  maxBytes?: number;
  maxSizeMB?: number;
};

export function validateImageFile(
  file: File,
  { accept, maxBytes, maxSizeMB }: ImageValidationOptions = {}
) {
  if (Array.isArray(accept) && accept.length > 0) {
    if (!accept.includes(file.type)) {
      return `Tipo inválido: ${file.name}. Aceitos: ${accept.join(", ")}`;
    }
  } else if (!file.type.startsWith("image/")) {
    return "O arquivo deve ser uma imagem.";
  }

  const resolvedMaxBytes =
    maxBytes ?? (maxSizeMB ? maxSizeMB * 1024 * 1024 : MAX_IMAGE_SIZE_BYTES);

  if (file.size > resolvedMaxBytes) {
    const limitLabel = maxSizeMB ?? Math.round((resolvedMaxBytes / (1024 * 1024)) * 10) / 10;
    return `A imagem deve ter no máximo ${limitLabel}MB.`;
  }

  return null;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error("Falha ao ler o arquivo."));
    };

    reader.readAsDataURL(file);
  });
}
