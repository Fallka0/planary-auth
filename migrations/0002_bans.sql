-- Banned accounts keep their row, so the email can't sign up again; they just stop working everywhere.
ALTER TABLE users ADD COLUMN banned_at INTEGER;
