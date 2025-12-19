export function maskPhone(value?: string | null) {
  const digits = (value ?? "").replace(/\D/g, "").slice(0, 11);

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
  return (value ?? "").replace(/\D/g, "");
}
