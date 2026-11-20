-- School accounts (SCHOOL_DOMAINS): the school's key, e.g. 'bwd'. Names follow the address and are set on the next sign-in.
ALTER TABLE users ADD COLUMN org TEXT;
UPDATE users SET org = 'bwd' WHERE lower(email) LIKE '%@bwdbern.ch';
