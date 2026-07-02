import type { TravelRequestStatus } from "./travel-types.js";

type TravelStatusInput = {
  errors: string[];
  travelDays: number;
  totalAmountInCents: number;
};

export function determineTravelRequestStatus({
  errors,
  travelDays,
  totalAmountInCents,
}: TravelStatusInput): TravelRequestStatus {
  if (errors.length > 0) {
    return "rejected";
  }

  if (travelDays > 5) {
    return "pending-review";
  }

  if (totalAmountInCents > 200000) {
    return "pending-review";
  }

  return "approved";
}
