export function sanitizeVehiclePlate(value?: string | null) {
  return (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

export function formatVehiclePlate(value?: string | null) {
  const normalized = sanitizeVehiclePlate(value);

  if (
    normalized.length > 3 &&
    /^[A-Z]{3}\d{1,4}$/.test(normalized)
  ) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  }

  return normalized;
}

export function sanitizeParkingSpot(value?: string | null) {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export function formatParkingSpot(value?: string | null) {
  return sanitizeParkingSpot(value);
}
