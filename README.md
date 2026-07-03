# TEC2 Final Assessment

This repository contains the refactored solution for the final assessment of Topicos Especiais em Computacao II. The official assignment statement remains available in [docs/tec2-aval.md](docs/tec2-aval.md), and this README documents the delivered solution, implemented architecture, PostgreSQL persistence, and validation process.

## Team Members

- Douglas Adones de Sousa Nascimento
- Kauan Lucena de Almeida Amorim

## Activity Summary

The activity starts from a legacy implementation that processes institutional travel requests. The goal of the delivery was to preserve the public behavior validated by the original tests, reorganize the solution into domain, application, and infrastructure layers, add unit tests, and implement PostgreSQL persistence without coupling business rules to database details.

## Implemented Solution

The solution was refactored into well-separated layers:

- `src/domain/` contains the pure business rules: validations, travel day calculation, pricing, status definition, and output analysis.
- `src/application/` contains the main use case and the repository port that isolates persistence concerns.
- `src/infra/` contains PostgreSQL connection code, SQL mapping, and the concrete repository implementation.
- `src/main.ts` remains the public contract used by the behavior-preservation tests in `tests/original/`.

The public flow still delegates synchronously from `src/main.ts` to the application use case, which then uses the domain layer. Persistence was implemented as a separate asynchronous capability to preserve compatibility with the assignment requirements.

## Project Structure

```text
src/
  application/
    ports/
      travel-request-repository.ts
    process-travel-request-use-case.ts
  domain/
    travel-analysis.ts
    travel-date.ts
    travel-pricing.ts
    travel-status.ts
    travel-types.ts
    travel-validator.ts
  infra/
    database/
      pg-client.ts
    repositories/
      postgres-travel-request-repository.ts
  original/
    process-travel-request.ts
  main.ts

tests/
  application/
    process-travel-request-use-case.test.ts
  domain/
    travel-analysis.test.ts
  infra/
    postgres-travel-request-repository.test.ts
  original/
    process-travel-request.test.ts

database/
  init.sql

docs/
  dependency-diagram.pdf
  tec2-aval.md
  tec2-aval.pdf
```

## Architecture

### Domain

`src/domain/` contains the pure business logic. This layer validates required fields and dates, calculates the inclusive travel duration, resolves the daily amount, calculates subtotal and total values, defines request status, and generates warnings when needed. The domain does not depend on PostgreSQL, `process.env`, Docker, or any infrastructure detail.

### Application

`src/application/process-travel-request-use-case.ts` contains the main use case for the refactored solution. It keeps the public flow synchronous and delegates processing to the domain analysis. The same layer also defines `src/application/ports/travel-request-repository.ts`, which establishes the asynchronous persistence contract without forcing the public API to become `async`.

### Infrastructure

`src/infra/` contains the technical details:

- `database/pg-client.ts` reads `DATABASE_URL` and creates the PostgreSQL pool.
- `repositories/postgres-travel-request-repository.ts` implements the application port using explicit SQL and the `pg` driver.

Infrastructure depends on the port defined by the application and on PostgreSQL. The domain does not depend on infrastructure.

## Public Contract in `src/main.ts`

`src/main.ts` remains the only public entry point expected by the original tests. It exports:

- the public types `RequesterType`, `TravelRequestInput`, `TravelRequestOutput`, and `TravelRequestStatus`;
- the synchronous function `processTravelRequest(input): TravelRequestOutput`.

The tests in `tests/original/` still import only from `src/main.ts`. This guarantees that the public behavior remained stable even after the internal refactoring.

## Installation

Install dependencies with:

```bash
npm install
```

If you want to keep the connection string in a local file, copy `.env.example` to `.env` and adjust `DATABASE_URL` if needed.

## Typecheck

```bash
npm run typecheck
```

## Tests

```bash
npm test
```

The suite includes:

- original behavior-preservation tests;
- domain unit tests;
- application unit tests;
- infrastructure unit tests with fake query clients.

## Database

Start PostgreSQL:

```bash
npm run db:up
```

Initialize the schema:

```bash
npm run db:init
```

Stop PostgreSQL and remove the volume:

```bash
npm run db:down
```

## PostgreSQL Persistence and `DATABASE_URL`

Persistence uses the database infrastructure already provided by the project:

- `docker-compose.yml` starts a local PostgreSQL container;
- `.env.example` defines the expected `DATABASE_URL` format;
- `scripts/init-database.ts` applies `database/init.sql`;
- `src/infra/database/pg-client.ts` reads `DATABASE_URL` and creates the pool;
- `src/infra/repositories/postgres-travel-request-repository.ts` saves and retrieves persisted travel requests.

The `travel_requests` table stores the request input data and the main fields of the processed analysis. The `errors` and `warnings` arrays are persisted as `JSONB`, which allows the full analysis to be stored without pushing business rules into the infrastructure layer. No credential is hardcoded in the codebase, and the `.env` file should not be versioned.

Persistence is asynchronous by design, but it is intentionally kept outside the public synchronous contract. This preserves the assignment requirement that `processTravelRequest` must not become `async`.

## Main Technical Decisions

- Keep `src/main.ts` as the stable public contract for the original tests.
- Keep `processTravelRequest` synchronous and focused on behavior preservation.
- Move business rules into `src/domain/` as pure and testable functions.
- Isolate persistence behind `TravelRequestRepository` in `src/application/ports/`.
- Implement PostgreSQL access only in `src/infra/`, using `pg` and explicit SQL.
- Map `camelCase` fields in the application layer to `snake_case` fields in the database.
- Store `errors` and `warnings` as `JSONB` to preserve the persisted analysis.
- Test the infrastructure layer with fake query clients so that `npm test` does not depend on Docker or a running database.

## AI Usage

### Tool Used

- Codex / GPT-5 coding assistant

### How It Was Used

- to inspect the repository and summarize the existing structure;
- to suggest the separation of the solution into domain, application, and infrastructure;
- to help write and review tests for the new layers;
- to propose persistence boundaries and the repository contract;
- to support the production of the final documentation and dependency diagram.

### Accepted Suggestions

- separate business rules into focused domain modules;
- keep `src/main.ts` as the public contract for the original tests;
- introduce an application use case as the synchronous orchestration point;
- define a repository port in the application layer and a PostgreSQL implementation in the infrastructure layer;
- test the infrastructure layer with fake query clients instead of requiring a real database in `npm test`.

### Modified or Rejected Suggestions

- persistence was not connected directly to the public synchronous flow to avoid contract changes and the introduction of `async`;
- documentation was adjusted to reflect the real state of the code, including the fact that persistence exists as a separate capability and is not automatically executed by `processTravelRequest`;
- any suggestion that required changing `src/original/`, `tests/original/`, or the public contract was rejected.

### How Responses Were Validated

- every relevant change was checked against the assignment constraints;
- the described structure was compared against the real files in the repository;
- public behavior was validated with `npm run typecheck` and `npm test`;
- architectural claims were checked against the current imports and dependencies in the code.

## Final Validation Checklist

- [x] `src/original/` was preserved.
- [x] `tests/original/` was preserved.
- [x] `src/main.ts` remains the public entry point.
- [x] The solution is separated into `domain`, `application`, and `infra`.
- [x] Domain rules were implemented and tested.
- [x] The application use case was implemented and tested.
- [x] PostgreSQL persistence was implemented in `src/infra/`.
- [x] Persistence uses `DATABASE_URL`.
- [x] Database commands were documented.
- [x] The dependency diagram was delivered in `docs/dependency-diagram.pdf`.
- [x] `npm run typecheck` is part of the validation flow.
- [x] `npm test` is part of the validation flow.
- [x] AI usage was documented with accepted, modified, and rejected suggestions.
