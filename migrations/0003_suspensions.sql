-- A suspension blocks every sign-in until suspended_until (or until lifted when it's NULL).
-- Unlike a ban it can be lifted and deletes nothing.
ALTER TABLE users ADD COLUMN suspended_at INTEGER;
ALTER TABLE users ADD COLUMN suspended_until INTEGER;
ALTER TABLE users ADD COLUMN suspend_reason TEXT;
