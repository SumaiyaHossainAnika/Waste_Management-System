-- Migration: Add location assignment to managers
-- Allows managers to be scoped to specific waste collection zones

ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_location_id INT REFERENCES locations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_users_assigned_location ON users(assigned_location_id);
UPDATE users SET assigned_location_id = 2 WHERE role = 'manager' AND assigned_location_id IS NULL;
