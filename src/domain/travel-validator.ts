import { isValidTravelDate, toUtcDayNumber } from "./travel-date.js";
import type { TravelRequestInput } from "./travel-types.js";

type DateValidationResult = {
  errors: string[];
  departureDateIsValid: boolean;
  returnDateIsValid: boolean;
};

export function validateRequiredFields(input: TravelRequestInput): string[] {
  const errors: string[] = [];

  if (!input.requestId) {
    errors.push("requestId is required");
  }
  if (!input.requesterName) {
    errors.push("requesterName is required");
  }
  if (!input.requesterType) {
    errors.push("requesterType is required");
  }
  if (!input.destination) {
    errors.push("destination is required");
  }
  if (!input.departureDate) {
    errors.push("departureDate is required");
  }
  if (!input.returnDate) {
    errors.push("returnDate is required");
  }

  return errors;
}

export function validateTravelDates(
  input: TravelRequestInput,
): DateValidationResult {
  const errors: string[] = [];
  let departureDateIsValid = true;
  let returnDateIsValid = true;

  if (input.departureDate) {
    if (!isValidTravelDate(input.departureDate)) {
      errors.push("departureDate must be a valid YYYY-MM-DD date");
      departureDateIsValid = false;
    }
  } else {
    departureDateIsValid = false;
  }

  if (input.returnDate) {
    if (!isValidTravelDate(input.returnDate)) {
      errors.push("returnDate must be a valid YYYY-MM-DD date");
      returnDateIsValid = false;
    }
  } else {
    returnDateIsValid = false;
  }

  if (
    departureDateIsValid &&
    returnDateIsValid &&
    toUtcDayNumber(input.returnDate) < toUtcDayNumber(input.departureDate)
  ) {
    errors.push("returnDate cannot be before departureDate");
  }

  return {
    errors,
    departureDateIsValid,
    returnDateIsValid,
  };
}
