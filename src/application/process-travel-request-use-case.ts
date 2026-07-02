import { analyzeTravelRequest } from "../domain/travel-analysis.js";
import type {
  TravelRequestInput,
  TravelRequestOutput,
} from "../domain/travel-types.js";

export function processTravelRequest(
  input: TravelRequestInput,
): TravelRequestOutput {
  return analyzeTravelRequest(input);
}
