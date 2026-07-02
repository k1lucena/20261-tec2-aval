import type { RequesterType } from "./travel-types.js";

const DAILY_AMOUNT_BY_REQUESTER_TYPE: Record<RequesterType, number> = {
  student: 9000,
  employee: 18000,
  professor: 25000,
  manager: 30000,
};

export function getDailyAmountInCents(requesterType: string): number {
  if (requesterType in DAILY_AMOUNT_BY_REQUESTER_TYPE) {
    return DAILY_AMOUNT_BY_REQUESTER_TYPE[requesterType as RequesterType];
  }

  return 0;
}

export function calculateSubtotalInCents(travelDays: number, dailyAmountInCents: number): number {
  return travelDays * dailyAmountInCents;
}

export function calculateTotalAmountInCents(
  subtotalInCents: number,
  transportCostInCents: number,
): number {
  return subtotalInCents + transportCostInCents;
}
