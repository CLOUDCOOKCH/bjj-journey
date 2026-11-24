CREATE TABLE IF NOT EXISTS "review_technique_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_technique_id" uuid NOT NULL,
	"youtube_url" text NOT NULL,
	"title" varchar(200),
	"thumbnail_url" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "review_techniques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category" varchar(50),
	"belt_level" varchar(20),
	"difficulty" varchar(20),
	"training_type" varchar(20),
	"notes" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed" timestamp,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- Older installations commonly obtained the technique tables via drizzle-kit push.
-- Verify pre-existing structures before reconciling the migration ledger.
DO $$
DECLARE
  mismatch text;
  expected record;
  actual text;
BEGIN
  WITH expected_columns(table_name,column_name,column_type,required) AS (
    VALUES
      ('review_techniques','id','uuid',true),
      ('review_techniques','user_id','uuid',true),
      ('review_techniques','name','character varying(200)',true),
      ('review_techniques','description','text',false),
      ('review_techniques','category','character varying(50)',false),
      ('review_techniques','belt_level','character varying(20)',false),
      ('review_techniques','difficulty','character varying(20)',false),
      ('review_techniques','training_type','character varying(20)',false),
      ('review_techniques','notes','text',false),
      ('review_techniques','view_count','integer',true),
      ('review_techniques','last_reviewed','timestamp without time zone',false),
      ('review_techniques','is_favorite','boolean',true),
      ('review_techniques','created_at','timestamp without time zone',false),
      ('review_techniques','updated_at','timestamp without time zone',false),
      ('review_technique_videos','id','uuid',true),
      ('review_technique_videos','review_technique_id','uuid',true),
      ('review_technique_videos','youtube_url','text',true),
      ('review_technique_videos','title','character varying(200)',false),
      ('review_technique_videos','thumbnail_url','text',false),
      ('review_technique_videos','order_index','integer',true),
      ('review_technique_videos','created_at','timestamp without time zone',false)
  )
  SELECT string_agg(e.table_name || '.' || e.column_name, ', ')
    INTO mismatch
    FROM expected_columns AS e
    LEFT JOIN pg_attribute AS a
      ON a.attrelid = to_regclass('public.' || e.table_name)
      AND a.attname = e.column_name AND NOT a.attisdropped
    WHERE a.attnum IS NULL OR format_type(a.atttypid, a.atttypmod) <> e.column_type
      OR a.attnotnull <> e.required;
  IF mismatch IS NOT NULL THEN
    RAISE EXCEPTION 'Unexpected technique schema: %', mismatch;
  END IF;

  FOR expected IN SELECT * FROM (VALUES
    ('review_techniques','review_techniques_pkey','PRIMARY KEY (id)'),
    ('review_technique_videos','review_technique_videos_pkey','PRIMARY KEY (id)'),
    ('review_techniques','review_techniques_user_id_users_id_fk','FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'),
    ('review_technique_videos','review_technique_videos_review_technique_id_review_techniques_id_fk','FOREIGN KEY (review_technique_id) REFERENCES review_techniques(id) ON DELETE CASCADE')
  ) AS checks(table_name,constraint_name,definition)
  LOOP
    SELECT pg_get_constraintdef(oid) INTO actual FROM pg_constraint
      WHERE conrelid = to_regclass('public.' || expected.table_name) AND conname = expected.constraint_name::name;
    IF actual IS NULL AND expected.definition LIKE 'FOREIGN KEY%' THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I %s', expected.table_name, expected.constraint_name, expected.definition);
    ELSIF actual IS DISTINCT FROM expected.definition THEN
      RAISE EXCEPTION 'Unexpected technique constraint: %', expected.constraint_name;
    END IF;
  END LOOP;

  FOR expected IN SELECT * FROM (VALUES
    ('review_techniques','id','gen_random_uuid()'),
    ('review_techniques','view_count','0'),
    ('review_techniques','is_favorite','false'),
    ('review_techniques','created_at','now()'),
    ('review_techniques','updated_at','now()'),
    ('review_technique_videos','id','gen_random_uuid()'),
    ('review_technique_videos','order_index','0'),
    ('review_technique_videos','created_at','now()')
  ) AS checks(table_name,column_name,default_value)
  LOOP
    SELECT pg_get_expr(d.adbin,d.adrelid) INTO actual
      FROM pg_attrdef d JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
      WHERE d.adrelid = to_regclass('public.' || expected.table_name) AND a.attname = expected.column_name;
    IF actual IS DISTINCT FROM expected.default_value THEN
      RAISE EXCEPTION 'Unexpected technique default: %.%', expected.table_name, expected.column_name;
    END IF;
  END LOOP;
END;
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_technique_videos_technique_id_idx" ON "review_technique_videos" ("review_technique_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_techniques_user_id_idx" ON "review_techniques" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_techniques_category_idx" ON "review_techniques" ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "review_techniques_belt_level_idx" ON "review_techniques" ("belt_level");
--> statement-breakpoint
DO $$
DECLARE
  expected record;
BEGIN
  FOR expected IN SELECT * FROM (VALUES
    ('review_technique_videos','review_technique_videos_technique_id_idx','review_technique_id'),
    ('review_techniques','review_techniques_user_id_idx','user_id'),
    ('review_techniques','review_techniques_category_idx','category'),
    ('review_techniques','review_techniques_belt_level_idx','belt_level')
  ) AS checks(table_name,index_name,column_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = expected.table_name
        AND indexname = expected.index_name
        AND indexdef = format('CREATE INDEX %I ON public.%I USING btree (%I)', expected.index_name, expected.table_name, expected.column_name)
    ) THEN
      RAISE EXCEPTION 'Unexpected technique index: %', expected.index_name;
    END IF;
  END LOOP;
END;
$$;

--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_id_owner_key" UNIQUE("id","user_id");
--> statement-breakpoint
CREATE TABLE "training_journal_links" (
	"activity_id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"journal_entry_id" uuid NOT NULL,
	CONSTRAINT "training_journal_links_journal_entry_id_unique" UNIQUE("journal_entry_id")
);
--> statement-breakpoint
CREATE TABLE "training_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"collection" varchar(40) NOT NULL,
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"parent_id" uuid,
	"template_id" uuid,
	"record_key" varchar(200),
	"state" varchar(20),
	"activity_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_records_owner_key" UNIQUE("id","user_id"),
	CONSTRAINT "training_records_collection_check" CHECK ("training_records"."collection" in ('workouts','activities','templates','exercises','exercise_favourites','preferences','recovery','discomfort','benchmarks','benchmark-results','goals','competitions','reflections','programmes')),
	CONSTRAINT "training_records_version_check" CHECK ("training_records"."version" > 0),
	CONSTRAINT "training_records_data_check" CHECK (jsonb_typeof("training_records"."data") = 'object')
);
--> statement-breakpoint
ALTER TABLE "training_journal_links" ADD CONSTRAINT "training_journal_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_journal_links" ADD CONSTRAINT "training_journal_links_activity_owner_fk" FOREIGN KEY ("activity_id","user_id") REFERENCES "public"."training_records"("id","user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_journal_links" ADD CONSTRAINT "training_journal_links_journal_owner_fk" FOREIGN KEY ("journal_entry_id","user_id") REFERENCES "public"."journal_entries"("id","user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_parent_owner_fk" FOREIGN KEY ("parent_id","user_id") REFERENCES "public"."training_records"("id","user_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "training_records" ADD CONSTRAINT "training_records_template_owner_fk" FOREIGN KEY ("template_id","user_id") REFERENCES "public"."training_records"("id","user_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "training_records_collection_key" ON "training_records" USING btree ("user_id","collection","record_key") WHERE "training_records"."record_key" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "training_records_list_idx" ON "training_records" USING btree ("user_id","collection","created_at","id");
--> statement-breakpoint
CREATE INDEX "training_records_activity_date_idx" ON "training_records" USING btree ("user_id","collection","activity_date","state");
--> statement-breakpoint
CREATE INDEX "training_records_parent_idx" ON "training_records" USING btree ("parent_id");
--> statement-breakpoint
CREATE INDEX "training_records_template_idx" ON "training_records" USING btree ("template_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "training_records_activity_workout_key" ON "training_records" USING btree ("parent_id") WHERE "training_records"."collection" = 'workouts' AND "training_records"."parent_id" IS NOT NULL;
--> statement-breakpoint
CREATE FUNCTION public.save_training_record(
  owner uuid, record_id uuid, kind text, expected_version integer, payload jsonb
) RETURNS public.training_records
LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$
DECLARE
  current_row training_records%ROWTYPE;
  linked_row training_records%ROWTYPE;
  parent uuid;
  template uuid;
  value_key text;
  value_date date;
  value_state text;
  parent_kind text;
BEGIN
  SELECT * INTO current_row FROM training_records
    WHERE id = record_id AND user_id = owner AND collection = kind
    FOR UPDATE;

  IF FOUND THEN
    IF expected_version IS NULL THEN
      IF kind = 'activities' AND payload ? 'seriesId' AND current_row.data <> payload THEN
        RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Occurrence was already scheduled';
      END IF;
      RETURN current_row;
    END IF;
    IF current_row.version <> expected_version THEN
      RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Version conflict';
    END IF;
  ELSIF expected_version IS NOT NULL THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Training record unavailable';
  END IF;

  CASE kind
    WHEN 'workouts' THEN
      parent := (payload ->> 'plannedActivityId')::uuid;
      parent_kind := 'activities';
      value_state := 'in_progress';
      template := (payload ->> 'templateId')::uuid;
      value_date := ((payload ->> 'startedAt')::timestamptz AT TIME ZONE 'UTC')::date;
      IF payload ->> 'status' IS DISTINCT FROM value_state OR payload ? 'completedAt' THEN
        RAISE SQLSTATE 'BJ422' USING MESSAGE = 'Use the completion action to finish training';
      END IF;
      IF current_row.id IS NOT NULL AND (
          current_row.state <> value_state OR current_row.parent_id IS DISTINCT FROM parent OR
          current_row.data ->> 'category' IS DISTINCT FROM payload ->> 'category' OR
          current_row.data ->> 'startedAt' IS DISTINCT FROM payload ->> 'startedAt' OR
          current_row.template_id IS DISTINCT FROM template
        ) THEN
        RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Workout state cannot be changed';
      END IF;
      IF parent IS NOT NULL AND current_row.id IS NULL THEN
        SELECT * INTO linked_row FROM training_records
          WHERE id = parent AND user_id = owner AND collection = 'activities'
          FOR UPDATE;
        IF NOT FOUND THEN
          RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Training record unavailable';
        END IF;
        SELECT * INTO current_row FROM training_records
          WHERE user_id = owner AND collection = 'workouts' AND parent_id = parent;
        IF FOUND THEN
          RETURN current_row;
        END IF;
        IF linked_row.state <> 'planned' OR linked_row.data ? 'repeat' OR
            linked_row.data ->> 'category' IS DISTINCT FROM payload ->> 'category' THEN
          RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Activity cannot be started';
        END IF;
      END IF;
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(coalesce(payload -> 'reviewTechniqueIds', '[]'::jsonb)) AS requested(id)
        WHERE NOT EXISTS (
          SELECT 1 FROM review_techniques
          WHERE id = requested.id::uuid AND user_id = owner
        )
      ) THEN
        RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Technique unavailable';
      END IF;
    WHEN 'activities' THEN
      parent := (payload ->> 'seriesId')::uuid;
      parent_kind := 'activities';
      IF parent IS NOT NULL THEN
        value_key := parent::text || ':' || (payload ->> 'occurrenceDate');
      END IF;
      template := (payload ->> 'workoutTemplateId')::uuid;
      value_state := payload ->> 'status';
      value_date := (payload ->> 'date')::date;
      IF payload ? 'journalEntryId' OR value_state = 'in_progress'
          OR (value_state = 'completed' AND payload ->> 'category' <> 'rest') THEN
        RAISE SQLSTATE 'BJ422' USING MESSAGE = 'Use a workout or journal to complete an activity';
      END IF;
      IF current_row.id IS NOT NULL AND (
          current_row.state IN ('in_progress','completed') OR
          current_row.parent_id IS DISTINCT FROM parent OR
          current_row.record_key IS DISTINCT FROM value_key
        ) THEN
        RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Activity state cannot be changed';
      END IF;
    WHEN 'benchmark-results', 'goals' THEN
      parent := (payload ->> 'benchmarkId')::uuid;
      parent_kind := 'benchmarks';
      value_date := (payload ->> 'date')::date;
    WHEN 'recovery' THEN
      value_key := payload ->> 'date';
      value_date := value_key::date;
    WHEN 'preferences' THEN
      value_key := payload ->> 'key';
    WHEN 'exercise_favourites' THEN
      value_key := payload ->> 'exerciseSlug';
    WHEN 'reflections' THEN
      value_key := payload ->> 'weekStart';
      value_date := value_key::date;
    WHEN 'competitions' THEN
      value_date := (payload ->> 'date')::date;
    WHEN 'discomfort' THEN
      value_date := (payload ->> 'onsetDate')::date;
    ELSE
      NULL;
  END CASE;

  IF parent IS NOT NULL AND (parent = record_id OR NOT EXISTS (
      SELECT 1 FROM training_records WHERE id = parent AND user_id = owner AND collection = parent_kind
        AND (kind <> 'activities' OR data ? 'repeat')
    )) THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Training record unavailable';
  END IF;
  IF template IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM training_records WHERE id = template AND user_id = owner AND collection = 'templates'
      AND data ->> 'category' = payload ->> 'category'
  ) THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Template unavailable';
  END IF;

  IF current_row.id IS NULL THEN
    INSERT INTO training_records AS r (id, user_id, collection, data, parent_id, template_id, record_key, state, activity_date)
      VALUES (record_id, owner, kind, payload, parent, template, value_key, value_state, value_date)
      ON CONFLICT (id) DO NOTHING
      RETURNING * INTO current_row;
    IF NOT FOUND THEN
      SELECT * INTO current_row FROM training_records
        WHERE id = record_id AND user_id = owner AND collection = kind;
      IF NOT FOUND THEN
        RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Record ID unavailable';
      END IF;
      IF kind = 'activities' AND payload ? 'seriesId' AND current_row.data <> payload THEN
        RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Occurrence was already scheduled';
      END IF;
    END IF;
    IF kind = 'workouts' AND parent IS NOT NULL THEN
      UPDATE training_records AS r SET data = jsonb_set(r.data, '{status}', '"in_progress"'), state = 'in_progress',
          version = r.version + 1, updated_at = now()
        WHERE id = parent AND user_id = owner AND collection = 'activities';
    END IF;
  ELSE
    UPDATE training_records AS r SET data = payload, parent_id = parent, template_id = template,
        record_key = value_key, state = value_state,
        activity_date = value_date, version = r.version + 1, updated_at = now()
      WHERE id = record_id AND user_id = owner AND collection = kind
      RETURNING * INTO current_row;
  END IF;
  RETURN current_row;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.complete_training_workout(owner uuid, record_id uuid, expected_version integer)
RETURNS public.training_records
LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$
DECLARE
  workout training_records%ROWTYPE;
  duration integer;
BEGIN
  SELECT * INTO workout FROM training_records WHERE id = record_id AND user_id = owner
    AND collection = 'workouts' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Workout unavailable';
  END IF;
  IF workout.state = 'completed' THEN
    RETURN workout;
  END IF;
  IF workout.version <> expected_version OR workout.state <> 'in_progress' THEN
    RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Version conflict';
  END IF;

  duration := coalesce((workout.data ->> 'durationMinutes')::integer,
    greatest(1, ceil(coalesce((workout.data ->> 'elapsedSeconds')::integer, 0) / 60.0)::integer));

  UPDATE training_records AS r
    SET data = (r.data - 'runningSince' - 'stepRunningSince' - 'restEndsAt') ||
        jsonb_build_object('status', 'completed', 'completedAt', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'durationMinutes', duration),
      state = 'completed', version = r.version + 1, updated_at = now()
    WHERE id = workout.id RETURNING * INTO workout;

  IF workout.parent_id IS NOT NULL THEN
    UPDATE training_records AS r SET data = jsonb_set(r.data, '{status}', '"completed"'), state = 'completed',
        version = r.version + 1, updated_at = now()
      WHERE id = workout.parent_id AND user_id = owner AND collection = 'activities' AND state = 'in_progress';
    IF NOT FOUND THEN
      RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Planned activity is no longer active';
    END IF;
  END IF;
  RETURN workout;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.delete_training_record(owner uuid, record_id uuid, kind text, expected_version integer)
RETURNS boolean
LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$
DECLARE
  current_row training_records%ROWTYPE;
BEGIN
  SELECT * INTO current_row FROM training_records WHERE id = record_id AND user_id = owner AND collection = kind FOR UPDATE;
  IF NOT FOUND THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Training record unavailable';
  END IF;
  IF current_row.version <> expected_version THEN
    RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Version conflict';
  END IF;
  IF kind = 'activities' AND current_row.state IN ('in_progress','completed') THEN
    RAISE SQLSTATE 'BJ409' USING MESSAGE = 'An activity with a workout cannot be removed';
  END IF;
  IF kind = 'templates' THEN
    UPDATE training_records AS r
      SET template_id = NULL, data = r.data - 'templateId' - 'workoutTemplateId',
        version = r.version + 1, updated_at = now()
      WHERE template_id = current_row.id AND user_id = owner;
  END IF;
  DELETE FROM training_records WHERE id = record_id AND user_id = owner;
  IF kind = 'workouts' AND current_row.parent_id IS NOT NULL THEN
    UPDATE training_records AS r SET data = jsonb_set(r.data, '{status}', '"planned"'), state = 'planned',
        version = r.version + 1, updated_at = now()
      WHERE id = current_row.parent_id AND user_id = owner AND collection = 'activities';
  END IF;
  RETURN true;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.complete_training_journal_activity(
  owner uuid, activity_id uuid, expected_version integer, existing_entry_id uuid, payload jsonb
) RETURNS public.training_records
LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$
DECLARE
  activity training_records%ROWTYPE;
  journal_id uuid;
BEGIN
  SELECT * INTO activity FROM training_records WHERE id = activity_id AND user_id = owner
    AND collection = 'activities' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Planned activity unavailable';
  END IF;
  IF activity.state = 'completed' AND activity.data ? 'journalEntryId' THEN
    IF existing_entry_id IS NULL OR existing_entry_id = (activity.data ->> 'journalEntryId')::uuid THEN
      RETURN activity;
    END IF;
    RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Activity already has a journal entry';
  END IF;
  IF activity.version <> expected_version OR activity.state NOT IN ('planned','in_progress') OR activity.data ? 'repeat' THEN
    RAISE SQLSTATE 'BJ409' USING MESSAGE = 'Planned activity is no longer available';
  END IF;
  IF activity.data ->> 'category' NOT IN ('bjj_gi','bjj_no_gi','open_mat','private_lesson','competition') THEN
    RAISE SQLSTATE 'BJ422' USING MESSAGE = 'Only a mat session can use a journal entry';
  END IF;

  IF existing_entry_id IS NOT NULL THEN
    SELECT id INTO journal_id FROM journal_entries WHERE id = existing_entry_id AND user_id = owner;
    IF NOT FOUND THEN
      RAISE SQLSTATE 'BJ404' USING MESSAGE = 'Journal entry unavailable';
    END IF;
  ELSE
    INSERT INTO journal_entries (user_id, entry_date, session_type, title, focus_areas, intensity_level, duration_minutes, notes)
      VALUES (owner, (payload ->> 'entryDate')::date, payload ->> 'sessionType', payload ->> 'title',
        payload ->> 'focusAreas', (payload ->> 'intensityLevel')::integer, (payload ->> 'durationMinutes')::integer,
        payload ->> 'notes')
      RETURNING id INTO journal_id;

    -- Session RPE is additive in the subsequent journal details migration.
    IF payload ? 'sessionRpe' THEN
      UPDATE journal_entries SET session_rpe = (payload ->> 'sessionRpe')::integer WHERE id = journal_id AND user_id = owner;
    END IF;

    INSERT INTO techniques (journal_entry_id, name, youtube_url, notes)
      SELECT journal_id, value ->> 'name', value ->> 'youtubeUrl', value ->> 'notes'
      FROM jsonb_array_elements(coalesce(payload -> 'techniques', '[]'::jsonb));
  END IF;

  INSERT INTO training_journal_links (activity_id, user_id, journal_entry_id) VALUES (activity.id, owner, journal_id);
  UPDATE training_records AS r
    SET data = r.data || jsonb_build_object('status','completed','journalEntryId',journal_id), state = 'completed',
      version = r.version + 1, updated_at = now()
    WHERE id = activity.id RETURNING * INTO activity;
  RETURN activity;
END;
$$;
--> statement-breakpoint
CREATE FUNCTION public.reset_training_journal_activity()
RETURNS trigger
LANGUAGE plpgsql SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE training_records AS r SET data = jsonb_set(r.data - 'journalEntryId', '{status}', '"planned"'),
      state = 'planned', version = r.version + 1, updated_at = now()
    FROM training_journal_links l WHERE l.journal_entry_id = OLD.id AND l.activity_id = r.id AND l.user_id = r.user_id;
  RETURN OLD;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER journal_entry_training_link_delete
  BEFORE DELETE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.reset_training_journal_activity();
