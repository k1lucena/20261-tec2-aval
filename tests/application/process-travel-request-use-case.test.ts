import { describe, expect, it } from "vitest";

import { processTravelRequest } from "../../src/application/process-travel-request-use-case";
import type { RequesterType, TravelRequestInput } from "../../src/main";

function makeInput(
  overrides: Partial<TravelRequestInput> = {},
): TravelRequestInput {
  return {
    requestId: "TR-001",
    requesterName: "Ada Lovelace",
    requesterType: "employee",
    destination: "Teresina",
    departureDate: "2026-08-10",
    returnDate: "2026-08-12",
    reason: "Attend institutional technical meeting",
    transportCostInCents: 12000,
    ...overrides,
  };
}

describe("processTravelRequest use case", () => {
  it("returns approved for a valid request", () => {
    const output = processTravelRequest(makeInput());

    expect(output.status).toBe("approved");
    expect(output.errors).toEqual([]);
    expect(output.warnings).toEqual([]);
  });

  it("assembles the full travel request output shape", () => {
    const output = processTravelRequest(
      makeInput({
        requesterType: "professor",
        departureDate: "2026-10-05",
        returnDate: "2026-10-08",
        transportCostInCents: 34567,
      }),
    );

    expect(output).toEqual({
      requestId: "TR-001",
      status: "approved",
      travelDays: 4,
      dailyAmountInCents: 25000,
      subtotalInCents: 100000,
      totalAmountInCents: 134567,
      errors: [],
      warnings: [],
    });
  });

  it("returns rejected with exact messages when required fields are missing", () => {
    const output = processTravelRequest(
      makeInput({
        requestId: "",
        requesterName: "",
        requesterType: "" as RequesterType,
        destination: "",
        departureDate: "",
        returnDate: "",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual([
      "requestId is required",
      "requesterName is required",
      "requesterType is required",
      "destination is required",
      "departureDate is required",
      "returnDate is required",
    ]);
  });

  it("returns rejected with exact messages when dates are invalid", () => {
    const output = processTravelRequest(
      makeInput({
        departureDate: "2026/08/10",
        returnDate: "2026-02-30",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual([
      "departureDate must be a valid YYYY-MM-DD date",
      "returnDate must be a valid YYYY-MM-DD date",
    ]);
  });

  it("returns rejected when returnDate is before departureDate", () => {
    const output = processTravelRequest(
      makeInput({
        departureDate: "2026-08-15",
        returnDate: "2026-08-14",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual([
      "returnDate cannot be before departureDate",
    ]);
  });

  it("returns pending-review for trips longer than five days", () => {
    const output = processTravelRequest(
      makeInput({
        departureDate: "2026-11-01",
        returnDate: "2026-11-06",
        reason: "Participate in a scheduled institutional workshop",
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.travelDays).toBe(6);
  });

  it("returns pending-review for totals greater than 200000", () => {
    const output = processTravelRequest(
      makeInput({
        requesterType: "manager",
        departureDate: "2026-12-01",
        returnDate: "2026-12-05",
        transportCostInCents: 60000,
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.totalAmountInCents).toBe(210000);
  });

  it("returns the exact warning for long trips with a short reason", () => {
    const output = processTravelRequest(
      makeInput({
        departureDate: "2027-01-10",
        returnDate: "2027-01-16",
        reason: "Meeting",
      }),
    );

    expect(output.warnings).toEqual([
      "long travel requests should include a detailed reason",
    ]);
  });
});
