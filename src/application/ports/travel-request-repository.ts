import type {
  RequesterType,
  TravelRequestStatus,
} from "../../domain/travel-types.js";

export type PersistedTravelRequest = {
  id: string;
  requesterName: string;
  requesterType: RequesterType;
  destination: string;
  departureDate: string;
  returnDate: string;
  reason: string;
  status: TravelRequestStatus;
  travelDays: number;
  dailyAmountInCents: number;
  subtotalInCents: number;
  transportCostInCents: number;
  totalAmountInCents: number;
  errors: string[];
  warnings: string[];
  createdAt: string;
};

export interface TravelRequestRepository {
  save(request: PersistedTravelRequest): Promise<PersistedTravelRequest>;
  findById(id: string): Promise<PersistedTravelRequest | null>;
}
