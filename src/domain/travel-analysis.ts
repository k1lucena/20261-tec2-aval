import { calculateInclusiveTravelDays } from "./travel-date.js";
import {
  calculateSubtotalInCents,
  calculateTotalAmountInCents,
  getDailyAmountInCents,
} from "./travel-pricing.js";
import { determineTravelRequestStatus } from "./travel-status.js";
import type {
  TravelRequestInput,
  TravelRequestOutput,
} from "./travel-types.js";
import {
  validateRequiredFields,
  validateTravelDates,
} from "./travel-validator.js";

export function analyzeTravelRequest(
  input: TravelRequestInput,
): TravelRequestOutput {
  const errors = [...validateRequiredFields(input)];
  const warnings: string[] = [];
  const dateValidation = validateTravelDates(input);

  errors.push(...dateValidation.errors);

  let travelDays = 0;

  if (
    dateValidation.departureDateIsValid &&
    dateValidation.returnDateIsValid &&
    !errors.includes("returnDate cannot be before departureDate")
  ) {
    travelDays = calculateInclusiveTravelDays(
      input.departureDate,
      input.returnDate,
    );
  }

  const dailyAmountInCents = getDailyAmountInCents(input.requesterType);
  const subtotalInCents = calculateSubtotalInCents(
    travelDays,
    dailyAmountInCents,
  );
  const totalAmountInCents = calculateTotalAmountInCents(
    subtotalInCents,
    input.transportCostInCents,
  );

  if (travelDays > 5 && input.reason.length < 30) {
    warnings.push("long travel requests should include a detailed reason");
  }

  const status = determineTravelRequestStatus({
    errors,
    travelDays,
    totalAmountInCents,
  });

  return {
    requestId: input.requestId,
    status,
    travelDays,
    dailyAmountInCents,
    subtotalInCents,
    totalAmountInCents,
    errors,
    warnings,
  };
}
