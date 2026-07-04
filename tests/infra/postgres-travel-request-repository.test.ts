import { describe, expect, it } from "vitest";

import type { PersistedTravelRequest } from "../../src/application/ports/travel-request-repository";
import { getDatabaseUrl } from "../../src/infra/database/pg-client";
import { PostgresTravelRequestRepository } from "../../src/infra/repositories/postgres-travel-request-repository";

type FakeQuery<Row> = {
  rows: Row[];
};

type CapturedQuery = {
  text: string;
  values?: readonly unknown[];
};

function makePersistedTravelRequest(
  overrides: Partial<PersistedTravelRequest> = {},
): PersistedTravelRequest {
  return {
    id: "TR-001",
    requesterName: "Ada Lovelace",
    requesterType: "employee",
    destination: "Teresina",
    departureDate: "2026-08-10",
    returnDate: "2026-08-12",
    reason: "Attend institutional technical meeting",
    status: "approved",
    travelDays: 3,
    dailyAmountInCents: 18000,
    subtotalInCents: 54000,
    transportCostInCents: 12000,
    totalAmountInCents: 66000,
    errors: [],
    warnings: [],
    createdAt: "2026-07-02T22:00:00.000Z",
    ...overrides,
  };
}

function createFakeQueryClient() {
  const queries: CapturedQuery[] = [];
  const queuedResults: Array<FakeQuery<unknown>> = [];

  return {
    queries,
    queueResult<Row>(rows: Row[]) {
      queuedResults.push({ rows });
    },
    async query<Row>(
      text: string,
      values?: readonly unknown[],
    ): Promise<FakeQuery<Row>> {
      queries.push({ text, values });

      return (
        (queuedResults.shift() as FakeQuery<Row> | undefined) ?? { rows: [] }
      );
    },
  };
}

describe("PostgresTravelRequestRepository", () => {
  it("serializes errors and warnings when saving a processed request", async () => {
    const fakeQueryClient = createFakeQueryClient();
    const repository = new PostgresTravelRequestRepository(fakeQueryClient);
    const request = makePersistedTravelRequest({
      errors: ["requestId is required"],
      warnings: ["long travel requests should include a detailed reason"],
    });

    fakeQueryClient.queueResult([
      {
        id: request.id,
        requester_name: request.requesterName,
        requester_type: request.requesterType,
        destination: request.destination,
        departure_date: request.departureDate,
        return_date: request.returnDate,
        reason: request.reason,
        status: request.status,
        travel_days: request.travelDays,
        daily_amount_in_cents: request.dailyAmountInCents,
        subtotal_in_cents: request.subtotalInCents,
        transport_cost_in_cents: request.transportCostInCents,
        total_amount_in_cents: request.totalAmountInCents,
        errors: request.errors,
        warnings: request.warnings,
        created_at: request.createdAt,
      },
    ]);

    const saved = await repository.save(request);

    expect(saved).toEqual(request);
    expect(fakeQueryClient.queries).toHaveLength(1);
    expect(fakeQueryClient.queries[0]?.text).toContain(
      "ON CONFLICT (id) DO UPDATE",
    );
    expect(fakeQueryClient.queries[0]?.values).toEqual([
      "TR-001",
      "Ada Lovelace",
      "employee",
      "Teresina",
      "2026-08-10",
      "2026-08-12",
      "Attend institutional technical meeting",
      "approved",
      3,
      18000,
      54000,
      12000,
      66000,
      '["requestId is required"]',
      '["long travel requests should include a detailed reason"]',
      "2026-07-02T22:00:00.000Z",
    ]);
  });

  it("maps and deserializes a persisted row when finding by id", async () => {
    const fakeQueryClient = createFakeQueryClient();
    const repository = new PostgresTravelRequestRepository(fakeQueryClient);

    fakeQueryClient.queueResult([
      {
        id: "TR-002",
        requester_name: "Grace Hopper",
        requester_type: "manager",
        destination: "Parnaiba",
        departure_date: "2026-12-01",
        return_date: "2026-12-05",
        reason: "Attend a strategic institutional planning meeting",
        status: "pending-review",
        travel_days: 5,
        daily_amount_in_cents: 30000,
        subtotal_in_cents: 150000,
        transport_cost_in_cents: 60000,
        total_amount_in_cents: 210000,
        errors: "[]",
        warnings: '["long travel requests should include a detailed reason"]',
        created_at: "2026-07-03T10:00:00.000Z",
      },
    ]);

    const found = await repository.findById("TR-002");

    expect(found).toEqual({
      id: "TR-002",
      requesterName: "Grace Hopper",
      requesterType: "manager",
      destination: "Parnaiba",
      departureDate: "2026-12-01",
      returnDate: "2026-12-05",
      reason: "Attend a strategic institutional planning meeting",
      status: "pending-review",
      travelDays: 5,
      dailyAmountInCents: 30000,
      subtotalInCents: 150000,
      transportCostInCents: 60000,
      totalAmountInCents: 210000,
      errors: [],
      warnings: ["long travel requests should include a detailed reason"],
      createdAt: "2026-07-03T10:00:00.000Z",
    });
    expect(fakeQueryClient.queries[0]?.values).toEqual(["TR-002"]);
  });

  it("returns null when the repository cannot find the requested id", async () => {
    const fakeQueryClient = createFakeQueryClient();
    const repository = new PostgresTravelRequestRepository(fakeQueryClient);

    fakeQueryClient.queueResult([]);

    await expect(repository.findById("TR-404")).resolves.toBeNull();
  });
});

describe("getDatabaseUrl", () => {
  it("throws a clear error when DATABASE_URL is missing", () => {
    expect(() => getDatabaseUrl({} as NodeJS.ProcessEnv)).toThrow(
      "DATABASE_URL is required",
    );
  });
});
