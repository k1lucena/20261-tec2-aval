CREATE TABLE IF NOT EXISTS travel_requests (
  id TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL,
  requester_type TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date TEXT NOT NULL,
  return_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  travel_days INTEGER NOT NULL,
  daily_amount_in_cents INTEGER NOT NULL,
  subtotal_in_cents INTEGER NOT NULL,
  transport_cost_in_cents INTEGER NOT NULL,
  total_amount_in_cents INTEGER NOT NULL,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL
);

ALTER TABLE travel_requests
ADD COLUMN IF NOT EXISTS errors JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE travel_requests
ADD COLUMN IF NOT EXISTS warnings JSONB NOT NULL DEFAULT '[]'::jsonb;
