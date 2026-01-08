import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { validateImageFile } from "@/utils/image-utils";

type ImageDropzoneProps = {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string[]; // ex: ["image/png","image/jpeg"]
  disabled?: boolean;
  previewUrl?: string | null;
  previewName?: string;
  onRemovePreview?: () => void;
  shape?: "rect" | "round";
  sizeClass?: string;
  label?: string;
  helper?: string;
};

type PreviewItem = {
  file: File;
  url: string;
  id: string;
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function ImageDropzone({
  value,
  onChange,
  maxFiles = 6,
  maxSizeMB = 5,
  accept = ["image/png", "image/jpeg", "image/webp", "image/gif"],
  disabled = false,
  previewUrl = null,
  previewName,
  onRemovePreview,
  shape = "rect",
  sizeClass,
  label = "Arraste e solte imagens aqui, ou clique para selecionar",
  helper = "PNG, JPG, WEBP ou GIF",
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>(value ?? []);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Se for "controlado" por props, sincroniza
  useEffect(() => {
    if (Array.isArray(value)) setFiles(value);
  }, [value]);

  const fileLabel = maxFiles === 1 ? "arquivo" : "arquivos";
  const hasFilePreview = maxFiles === 1 && files.length === 1;
  const showSinglePreview =
    maxFiles === 1 && (hasFilePreview || (!!previewUrl && files.length === 0));
  const radiusClass = shape === "round" ? "rounded-full" : "rounded-2xl";
  const dimensionClass =
    sizeClass ?? (shape === "round" ? "h-32 w-32" : "w-full");
  const emptyStateClass =
    shape === "round"
      ? "flex flex-col items-center justify-center gap-1 p-3 text-center"
      : "flex flex-col items-center justify-center gap-2 p-6";
  const labelClass =
    shape === "round"
      ? "text-xs font-medium text-foreground"
      : "text-sm font-medium text-foreground";
  const helperClass =
    shape === "round"
      ? "text-[10px] text-muted-foreground"
      : "text-xs text-muted-foreground";

  const previews: PreviewItem[] = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${file.lastModified}`,
    }));
  }, [files]);

  const singlePreview = hasFilePreview ? previews[0] : null;
  const singlePreviewUrl = hasFilePreview ? singlePreview?.url : previewUrl ?? "";
  const singlePreviewAlt =
    hasFilePreview ? singlePreview?.file.name : previewName ?? "Imagem selecionada";
  const canRemoveSinglePreview =
    !disabled && (hasFilePreview || Boolean(onRemovePreview));

  // Libera URLs quando atualizar/desmontar
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const updateFiles = useCallback(
    (next: File[]) => {
      setFiles(next);
      onChange?.(next);
    },
    [onChange]
  );

  const validateAndMerge = useCallback(
    (incoming: File[]) => {
      setError("");
      if (!incoming?.length) return;

      const shouldReplace = maxFiles === 1;
      const current = shouldReplace ? [] : files;
      const remainingSlots = Math.max(0, maxFiles - current.length);

      if (!shouldReplace && remainingSlots === 0) {
        setError(`Você já atingiu o limite de ${maxFiles} ${fileLabel}.`);
        return;
      }

      const sliced = shouldReplace ? incoming.slice(0, 1) : incoming.slice(0, remainingSlots);

      const valid: File[] = [];
      for (const f of sliced) {
        const validationError = validateImageFile(f, { accept, maxSizeMB });
        if (validationError) {
          setError(validationError);
          continue;
        }
        valid.push(f);
      }

      if (valid.length) updateFiles(shouldReplace ? valid.slice(0, 1) : [...current, ...valid]);
    },
    [accept, files, fileLabel, maxFiles, maxSizeMB, updateFiles]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const incoming = Array.from(e.target.files ?? []);
    validateAndMerge(incoming);
    e.target.value = ""; // permite escolher o mesmo arquivo novamente
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files ?? []);
    validateAndMerge(incoming);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    updateFiles(next);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        multiple={maxFiles > 1}
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openPicker();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "group relative overflow-hidden border-2 border-dashed transition",
          radiusClass,
          dimensionClass,
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted/40",
          isDragging ? "border-foreground bg-muted/50" : "border-border bg-background",
          showSinglePreview
            ? shape === "round"
              ? ""
              : "min-h-[180px]"
            : emptyStateClass,
        ].join(" ")}
      >
        {showSinglePreview ? (
          <>
            <img
              src={singlePreviewUrl}
              alt={singlePreviewAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/0 transition group-hover:bg-foreground/10" />
            {canRemoveSinglePreview && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={(event) => {
                  event.stopPropagation();
                  if (hasFilePreview) {
                    removeAt(0);
                  } else {
                    onRemovePreview?.();
                  }
                }}
                className={[
                  "absolute bg-destructive/80 text-destructive-foreground opacity-0 transition hover:bg-destructive/90 group-hover:opacity-100",
                  shape === "round"
                    ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    : "right-3 top-3",
                ].join(" ")}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>

            {shape !== "round" && (
              <div className="text-center">
                <p className={labelClass}>{label}</p>
                <p className={helperClass}>
                  {helper} • até {maxFiles} {fileLabel} • max {maxSizeMB}MB cada
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}

      {!showSinglePreview && files.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((p, idx) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={p.url} alt={p.file.name} className="h-28 w-full object-cover" />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2">
                <p className="truncate text-xs font-medium text-foreground">{p.file.name}</p>
                <p className="text-[11px] text-foreground/80">{formatBytes(p.file.size)}</p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={() => removeAt(idx)}
                className="absolute right-2 top-2 bg-destructive/80 text-destructive-foreground opacity-0 transition hover:bg-destructive/90 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover</span>
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
