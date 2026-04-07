-- Clear "Profile pending" placeholder bios written by prior API routes.
-- The UI now hides this text anyway, but clearing them makes the DB clean.

UPDATE ambassadors
SET bio = NULL
WHERE bio ILIKE 'Profile pending%';

UPDATE profiles
SET bio = NULL
WHERE bio ILIKE 'Profile pending%';

NOTIFY pgrst, 'reload schema';
