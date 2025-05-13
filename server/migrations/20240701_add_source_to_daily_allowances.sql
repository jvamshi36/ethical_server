-- Add source column to daily_allowances table
ALTER TABLE daily_allowances ADD COLUMN source VARCHAR(50) DEFAULT 'SCHEDULER';

-- Update existing records to have the default source
UPDATE daily_allowances SET source = 'SCHEDULER' WHERE source IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN daily_allowances.source IS 'Source of the daily allowance creation (SCHEDULER, TRAVEL_ALLOWANCE, etc)';