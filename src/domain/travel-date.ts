const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 86_400_000;

export function isValidTravelDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearChunk, monthChunk, dayChunk] = value.split("-");
  const year = Number(yearChunk);
  const month = Number(monthChunk);
  const day = Number(dayChunk);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function toUtcDayNumber(value: string): number {
  const [yearChunk, monthChunk, dayChunk] = value.split("-");

  return Date.UTC(Number(yearChunk), Number(monthChunk) - 1, Number(dayChunk));
}

export function calculateInclusiveTravelDays(
  departureDate: string,
  returnDate: string,
): number {
  return Math.floor((toUtcDayNumber(returnDate) - toUtcDayNumber(departureDate)) / DAY_IN_MS) + 1;
}
