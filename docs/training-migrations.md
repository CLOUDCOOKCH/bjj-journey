# Upgrading the training database

Use a disposable Neon database for rehearsals. For a live upgrade, confirm the target, take a recoverable backup, and obtain release approval before any write. Supply `DATABASE_URL` securely in the process environment.

## Inspect and upgrade

```bash
node scripts/migrate-training.mjs --check
node scripts/migrate-training.mjs --apply
node scripts/migrate-training.mjs --check
```

The runner follows the Drizzle migration journal, verifies ledger hashes and applies each migration transactionally. The journalled belt migration is the historical source. The duplicate belt migration file sits outside the journal. The forward reconciliation adds missing legacy technique review tables or validates the existing equivalents before extending the schema.

When a verified legacy database was originally managed with `db:push` and has an empty migration ledger, the check reports that the legacy baseline must be recorded. Review the schema and backup first, then run `node scripts/migrate-training.mjs --baseline-legacy` once and repeat the check and apply commands. Unexpected schema or ledger differences require investigation before proceeding. Use the migration runner for shared environments.

## Verify data preservation

Rehearse on an empty disposable database and on a disposable database populated with synthetic legacy users, journal entries, techniques, videos, profiles and belt achievements. Compare row counts, IDs, timestamps and relationships before and after. Verify that re-running the migration makes no changes. On a migrated disposable database with PostgreSQL client access, run the SQL regression cases:

```bash
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 --single-transaction -f scripts/test-training-database.sql
```

The SQL cases cover cross-user access, optimistic version conflicts, atomic activity batches, replaying workout and mat-session completion, daily recovery uniqueness, journal details and owned technique links, explicit RPE zero, and account cascades.

Validate and seed the repository's canonical curated content:

```bash
node scripts/seed-training-catalog.mjs --check
node scripts/seed-training-catalog.mjs --apply
node scripts/seed-training-catalog.mjs --apply
```

The second apply should report zero changed rows. The seed keeps stable exercise IDs and leaves their timestamps intact when content is identical. Use synthetic accounts to verify authentication and account export and deletion in the application.

## Recover

For an application regression, restore the previous application version and retain the additive database migrations. Investigate unexpected state on the database branch before rerunning the migration. Restore a tested backup only when needed for database recovery, taking into account records written after the backup.
