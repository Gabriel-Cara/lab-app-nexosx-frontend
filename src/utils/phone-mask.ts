export function maskPhone(value?: string | null) {
  const rawDigits = (value ?? "").replace(/\D/g, "");
  const normalized = rawDigits.startsWith("55") && rawDigits.length > 11
    ? rawDigits.slice(2)
    : rawDigits;
  const digits = normalized.slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  const areaCode = digits.slice(0, 2);

  if (digits.length <= 2) {
    return `(${areaCode}`;
  }

  if (digits.length <= 6) {
    return `(${areaCode}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${areaCode}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${areaCode}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function sanitizePhone(value?: string | null) {
  const rawDigits = (value ?? "").replace(/\D/g, "");

  if (!rawDigits) {
    return "";
  }

  const local =
    rawDigits.startsWith("55") && rawDigits.length > 11
      ? rawDigits.slice(2)
      : rawDigits;

  if (local.length !== 10 && local.length !== 11) {
    return "";
  }

  return `+55${local}`;
}
