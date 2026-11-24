CREATE OR REPLACE FUNCTION public.complete_training_journal_activity(
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
    INSERT INTO journal_entries (user_id, entry_date, session_type, title, focus_areas, intensity_level, duration_minutes, notes, session_rpe, training_details)
      VALUES (owner, (payload ->> 'entryDate')::date, payload ->> 'sessionType', payload ->> 'title',
        payload ->> 'focusAreas', (payload ->> 'intensityLevel')::integer, (payload ->> 'durationMinutes')::integer,
        payload ->> 'notes', (payload ->> 'sessionRpe')::integer, payload -> 'trainingDetails')
      RETURNING id INTO journal_id;

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
