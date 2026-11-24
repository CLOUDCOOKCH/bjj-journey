CREATE TABLE "journal_technique_links" (
	"owner_id" uuid NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	"review_technique_id" uuid NOT NULL,
	CONSTRAINT "journal_technique_links_unique" UNIQUE("journal_entry_id","review_technique_id")
);
--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "session_rpe" integer;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD COLUMN "training_details" jsonb;--> statement-breakpoint
ALTER TABLE "review_techniques" ADD CONSTRAINT "review_techniques_owner_key" UNIQUE("id","user_id");--> statement-breakpoint
ALTER TABLE "journal_technique_links" ADD CONSTRAINT "journal_technique_links_journal_owner_fk" FOREIGN KEY ("journal_entry_id","owner_id") REFERENCES "public"."journal_entries"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_technique_links" ADD CONSTRAINT "journal_technique_links_review_owner_fk" FOREIGN KEY ("review_technique_id","owner_id") REFERENCES "public"."review_techniques"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "journal_technique_links_review_idx" ON "journal_technique_links" USING btree ("review_technique_id");--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_session_rpe_check" CHECK ("journal_entries"."session_rpe" between 0 and 10);
--> statement-breakpoint
CREATE FUNCTION public.save_journal_training_details(
  p_owner uuid, p_journal uuid, p_rpe integer, p_details jsonb, p_techniques uuid[]
) RETURNS boolean LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM 1 FROM journal_entries
    WHERE id = p_journal AND user_id = p_owner
    FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_techniques) AS requested(id)
    WHERE NOT EXISTS (
      SELECT 1 FROM review_techniques AS technique
      WHERE technique.id = requested.id AND technique.user_id = p_owner
    )
  ) THEN
    RETURN FALSE;
  END IF;

  UPDATE journal_entries
    SET session_rpe = p_rpe, training_details = p_details, updated_at = now()
    WHERE id = p_journal AND user_id = p_owner;

  DELETE FROM journal_technique_links
    WHERE journal_entry_id = p_journal AND owner_id = p_owner
      AND NOT (review_technique_id = ANY(p_techniques));

  INSERT INTO journal_technique_links (owner_id, journal_entry_id, review_technique_id)
    SELECT p_owner, p_journal, unnest(p_techniques)
    ON CONFLICT (journal_entry_id, review_technique_id) DO NOTHING;

  RETURN TRUE;
END;
$$;
