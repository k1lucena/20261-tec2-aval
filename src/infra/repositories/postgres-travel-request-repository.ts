import type {
  PersistedTravelRequest,
  TravelRequestRepository,
} from "../../application/ports/travel-request-repository.js";
import { getPgPool, type QueryClient } from "../database/pg-client.js";

type TravelRequestRow = {
  id: string;
  requester_name: string;
  requester_type: PersistedTravelRequest["requesterType"];
  destination: string;
  departure_date: string;
  return_date: string;
  reason: string;
  status: PersistedTravelRequest["status"];
  travel_days: number;
  daily_amount_in_cents: number;
  subtotal_in_cents: number;
  transport_cost_in_cents: number;
  total_amount_in_cents: number;
  errors: unknown;
  warnings: unknown;
  created_at: string;
};

function parseStoredMessages(value: unknown): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = JSON.parse(value) as unknown;

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed;
    }
  }

  throw new Error("Stored messages must be a string array");
}

function mapRowToPersistedTravelRequest(
  row: TravelRequestRow,
): PersistedTravelRequest {
  return {
    id: row.id,
    requesterName: row.requester_name,
    requesterType: row.requester_type,
    destination: row.destination,
    departureDate: row.departure_date,
    returnDate: row.return_date,
    reason: row.reason,
    status: row.status,
    travelDays: row.travel_days,
    dailyAmountInCents: row.daily_amount_in_cents,
    subtotalInCents: row.subtotal_in_cents,
    transportCostInCents: row.transport_cost_in_cents,
    totalAmountInCents: row.total_amount_in_cents,
    errors: parseStoredMessages(row.errors),
    warnings: parseStoredMessages(row.warnings),
    createdAt: row.created_at,
  };
}

function buildSaveParameters(
  request: PersistedTravelRequest,
): readonly unknown[] {
  return [
    request.id,
    request.requesterName,
    request.requesterType,
    request.destination,
    request.departureDate,
    request.returnDate,
    request.reason,
    request.status,
    request.travelDays,
    request.dailyAmountInCents,
    request.subtotalInCents,
    request.transportCostInCents,
    request.totalAmountInCents,
    JSON.stringify(request.errors),
    JSON.stringify(request.warnings),
    request.createdAt,
  ];
}

const RETURNING_COLUMNS = `
  id,
  requester_name,
  requester_type,
  destination,
  departure_date,
  return_date,
  reason,
  status,
  travel_days,
  daily_amount_in_cents,
  subtotal_in_cents,
  transport_cost_in_cents,
  total_amount_in_cents,
  errors,
  warnings,
  created_at
`;

export class PostgresTravelRequestRepository
  implements TravelRequestRepository
{
  constructor(private readonly queryClient: QueryClient = getPgPool()) {}

  async save(
    request: PersistedTravelRequest,
  ): Promise<PersistedTravelRequest> {
    const result = await this.queryClient.query<TravelRequestRow>(
      `
        INSERT INTO travel_requests (
          id,
          requester_name,
          requester_type,
          destination,
          departure_date,
          return_date,
          reason,
          status,
          travel_days,
          daily_amount_in_cents,
          subtotal_in_cents,
          transport_cost_in_cents,
          total_amount_in_cents,
          errors,
          warnings,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14::jsonb,
          $15::jsonb,
          $16
        )
        ON CONFLICT (id) DO UPDATE
        SET
          requester_name = EXCLUDED.requester_name,
          requester_type = EXCLUDED.requester_type,
          destination = EXCLUDED.destination,
          departure_date = EXCLUDED.departure_date,
          return_date = EXCLUDED.return_date,
          reason = EXCLUDED.reason,
          status = EXCLUDED.status,
          travel_days = EXCLUDED.travel_days,
          daily_amount_in_cents = EXCLUDED.daily_amount_in_cents,
          subtotal_in_cents = EXCLUDED.subtotal_in_cents,
          transport_cost_in_cents = EXCLUDED.transport_cost_in_cents,
          total_amount_in_cents = EXCLUDED.total_amount_in_cents,
          errors = EXCLUDED.errors,
          warnings = EXCLUDED.warnings
        RETURNING ${RETURNING_COLUMNS}
      `,
      buildSaveParameters(request),
    );

    const savedRow = result.rows[0];

    if (!savedRow) {
      throw new Error("Failed to save travel request");
    }

    return mapRowToPersistedTravelRequest(savedRow);
  }

  async findById(id: string): Promise<PersistedTravelRequest | null> {
    const result = await this.queryClient.query<TravelRequestRow>(
      `
        SELECT ${RETURNING_COLUMNS}
        FROM travel_requests
        WHERE id = $1
      `,
      [id],
    );

    const row = result.rows[0];

    return row ? mapRowToPersistedTravelRequest(row) : null;
  }
}
