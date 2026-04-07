-- Clear "Profile pending" placeholder bios written by prior API routes.
-- The UI now hides this text anyway, but clearing them makes the DB clean.
-- The `bio` column lives on `ambassadors` and `members` (NOT `profiles`).

UPDATE ambassadors
SET bio = NULL
WHERE bio ILIKE 'Profile pending%';

UPDATE members
SET bio = NULL
WHERE bio ILIKE 'Profile pending%';

NOTIFY pgrst, 'reload schema';
