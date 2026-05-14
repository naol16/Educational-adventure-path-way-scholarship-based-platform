-- Migration 007: Add counselor balance columns

ALTER TABLE counselors
  ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS pending_balance_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_earned_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- Ensure defaults and NOT NULL constraints are enforced for existing databases
ALTER TABLE counselors ALTER COLUMN total_earned SET DEFAULT 0.00;
ALTER TABLE counselors ALTER COLUMN total_earned SET NOT NULL;
ALTER TABLE counselors ALTER COLUMN pending_balance SET DEFAULT 0.00;
ALTER TABLE counselors ALTER COLUMN pending_balance SET NOT NULL;
ALTER TABLE counselors ALTER COLUMN pending_balance_usd SET DEFAULT 0.00;
ALTER TABLE counselors ALTER COLUMN pending_balance_usd SET NOT NULL;
ALTER TABLE counselors ALTER COLUMN total_earned_usd SET DEFAULT 0.00;
ALTER TABLE counselors ALTER COLUMN total_earned_usd SET NOT NULL;
