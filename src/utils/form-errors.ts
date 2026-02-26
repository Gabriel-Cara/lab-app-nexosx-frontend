import type { FieldErrors } from "react-hook-form";

export function formatFieldErrors<T extends Record<string, unknown>>(
  errors: FieldErrors<T>,
  labels: Record<string, string>
) {
  const uniqueLabels = new Set<string>();

  Object.keys(errors).forEach((key) => {
    const label = labels[key] ?? key;
    if (label) {
      uniqueLabels.add(label);
    }
  });

  const fields = Array.from(uniqueLabels);

  if (fields.length === 0) {
    return "Verifique os campos destacados.";
  }

  if (fields.length === 1) {
    return `Campo inválido: ${fields[0]}.`;
  }

  return `Campos inválidos: ${fields.join(", ")}.`;
}
