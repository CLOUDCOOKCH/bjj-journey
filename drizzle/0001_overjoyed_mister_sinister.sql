ALTER TABLE "journal_entries" ADD COLUMN "session_type" varchar(20) DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "duration_minutes" integer DEFAULT 90;