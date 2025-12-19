export type TimeRangeValue = {
  start: string;
  end: string;
};

export const MIN_TIME = "06:00";
export const MAX_TIME = "23:00";
export const TIME_STEP_SECONDS = 30 * 60;
export const DEFAULT_RANGE: TimeRangeValue = { start: "08:00", end: "18:00" };
export const FULL_DAY_RANGE: TimeRangeValue = { start: MIN_TIME, end: MAX_TIME };

function isHalfHourIncrement(time: string) {
  const [, minutesPart] = time.split(":");
  const minutes = Number(minutesPart);
  return !Number.isNaN(minutes) && minutes % 30 === 0;
}

export function isValidTimeRange(range: TimeRangeValue | undefined) {
  if (!range || !range.start || !range.end) {
    return false;
  }

  if (
    !isHalfHourIncrement(range.start) ||
    !isHalfHourIncrement(range.end)
  ) {
    return false;
  }

  return (
    range.start >= MIN_TIME &&
    range.start < MAX_TIME &&
    range.end <= MAX_TIME &&
    range.end > range.start
  );
}
