-- Run with ON_ERROR_STOP and --single-transaction against a migrated, disposable database.
-- The smoke test deletes its synthetic accounts before returning.
DO $$
DECLARE
 alice uuid := gen_random_uuid();
 bob uuid := gen_random_uuid();
 activity_a uuid := gen_random_uuid();
 activity_b uuid := gen_random_uuid();
 workout_a uuid := gen_random_uuid();
 workout_b uuid := gen_random_uuid();
 activity_j uuid := gen_random_uuid();
 journal_id uuid;
 alice_technique uuid := gen_random_uuid();
 bob_technique uuid := gen_random_uuid();
 payload jsonb;
 result training_records%ROWTYPE;
 BEGIN
 INSERT INTO users (id,email,password) VALUES (alice,alice || '@example.test','test'),(bob,bob || '@example.test','test');
 payload := '{"title":"Squat day","category":"strength","date":"2026-11-24","timeZone":"Europe/Berlin","durationMinutes":45,"status":"planned"}';
 result := save_training_record(alice, activity_a, 'activities', NULL, payload);
 IF result.state <> 'planned' OR result.version <> 1 THEN RAISE EXCEPTION 'Activity create failed'; END IF;
 result := save_training_record(alice, activity_a, 'activities', 1, payload || '{"notes":"Warm up"}');
 IF result.version <> 2 OR result.data ->> 'notes' <> 'Warm up' THEN RAISE EXCEPTION 'Activity update failed'; END IF;
 BEGIN
   PERFORM save_training_record(bob, activity_a, 'activities', 2, payload);
   RAISE EXCEPTION 'Cross-owner update succeeded';
 EXCEPTION WHEN SQLSTATE 'BJ404' THEN NULL;
 END;
 BEGIN
   PERFORM save_training_record(alice, activity_a, 'activities', 1, payload);
   RAISE EXCEPTION 'Stale update succeeded';
 EXCEPTION WHEN SQLSTATE 'BJ409' THEN NULL;
 END;
 payload := jsonb_build_object('title','Squat day','category','strength','status','in_progress','startedAt','2026-11-24T10:00:00.000Z','plannedActivityId',activity_a,'elapsedSeconds',5,'exercises','[]'::jsonb);
 result := save_training_record(alice, workout_a, 'workouts', NULL, payload);
 IF result.id <> workout_a OR result.state <> 'in_progress' THEN RAISE EXCEPTION 'Workout create failed'; END IF;
 result := save_training_record(alice, workout_b, 'workouts', NULL, payload);
 IF result.id <> workout_a THEN RAISE EXCEPTION 'Scheduled workout was duplicated'; END IF;
 result := save_training_record(alice, workout_a, 'workouts', 1, payload || '{"elapsedSeconds":300}');
 IF result.version <> 2 THEN RAISE EXCEPTION 'Workout edit failed'; END IF;
 result := complete_training_workout(alice, workout_a, 2);
 IF result.state <> 'completed' OR result.data ->> 'durationMinutes' <> '5' THEN RAISE EXCEPTION 'Workout completion failed'; END IF;
 result := complete_training_workout(alice, workout_a, 2);
 IF result.version <> 3 THEN RAISE EXCEPTION 'Repeated completion changed the result'; END IF;
 IF (SELECT state FROM training_records WHERE id = activity_a) <> 'completed' THEN RAISE EXCEPTION 'Planner was not updated'; END IF;

 payload := '{"title":"Open Mat","category":"open_mat","date":"2026-11-25","timeZone":"Europe/Berlin","durationMinutes":90,"status":"planned"}';
 PERFORM save_training_record(alice, activity_j, 'activities', NULL, payload);
 result := complete_training_journal_activity(alice, activity_j, 1, NULL, '{"entryDate":"2026-11-25","sessionType":"open_mat","durationMinutes":90,"sessionRpe":0,"techniques":[{"name":"Escape"}]}');
 IF result.state <> 'completed' OR NOT (result.data ? 'journalEntryId') THEN RAISE EXCEPTION 'Mat completion failed'; END IF;
 IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE user_id = alice AND session_rpe = 0) THEN
   RAISE EXCEPTION 'Explicit RPE zero was lost';
 END IF;
 result := complete_training_journal_activity(alice, activity_j, 1, NULL, '{"entryDate":"2026-11-25","sessionType":"open_mat","durationMinutes":90}');
 IF (SELECT count(*) FROM journal_entries WHERE user_id = alice) <> 1 THEN RAISE EXCEPTION 'Mat journal was duplicated'; END IF;
 journal_id := (result.data ->> 'journalEntryId')::uuid;
 INSERT INTO review_techniques (id,user_id,name)
   VALUES (alice_technique,alice,'Guard recovery'),(bob_technique,bob,'Half guard sweep');
 IF save_journal_training_details(alice, journal_id, 0, '{"sparringRounds":2}', ARRAY[alice_technique]) IS DISTINCT FROM true THEN
   RAISE EXCEPTION 'Owned journal details were not saved';
 END IF;
 IF save_journal_training_details(bob, journal_id, 6, '{"sparringRounds":3}', ARRAY[bob_technique]) IS NOT NULL THEN
   RAISE EXCEPTION 'Another user edited journal details';
 END IF;
 IF save_journal_training_details(alice, journal_id, 8, '{"sparringRounds":4}', ARRAY[bob_technique]) IS DISTINCT FROM false THEN
   RAISE EXCEPTION 'Cross-owner technique link was accepted';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM journal_entries WHERE id = journal_id AND session_rpe = 0 AND training_details ->> 'sparringRounds' = '2')
   OR NOT EXISTS (SELECT 1 FROM journal_technique_links
     WHERE owner_id = alice AND journal_entry_id = journal_id AND review_technique_id = alice_technique) THEN
   RAISE EXCEPTION 'Journal details or links changed after a rejected write';
 END IF;
 DELETE FROM journal_entries WHERE id = journal_id;
 IF EXISTS (SELECT 1 FROM journal_technique_links WHERE journal_entry_id = journal_id) THEN
   RAISE EXCEPTION 'Journal removal left a personal technique link';
 END IF;
 IF (SELECT state FROM training_records WHERE id = activity_j) <> 'planned' THEN RAISE EXCEPTION 'Journal deletion left a stale completion'; END IF;

 PERFORM save_training_record(alice, gen_random_uuid(), 'recovery', NULL, '{"date":"2026-11-24","sleepHours":6}');
 BEGIN
   PERFORM save_training_record(alice, gen_random_uuid(), 'recovery', NULL, '{"date":"2026-11-24","sleepHours":7}');
   RAISE EXCEPTION 'Duplicate daily recovery succeeded';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
 activity_b := gen_random_uuid();
 BEGIN
   PERFORM saved.id FROM jsonb_to_recordset(jsonb_build_array(
     jsonb_build_object('id',activity_b,'data','{"date":"2026-11-24","status":"planned"}'::jsonb),
     jsonb_build_object('id',gen_random_uuid(),'data',jsonb_build_object('date','2026-11-24','status','planned','seriesId',gen_random_uuid()))
   )) AS item(id uuid, data jsonb)
   CROSS JOIN LATERAL public.save_training_record(alice, item.id, 'activities', NULL, item.data) AS saved;
   RAISE EXCEPTION 'Partial batch should fail';
 EXCEPTION WHEN SQLSTATE 'BJ404' THEN NULL;
 END;
 IF EXISTS (SELECT 1 FROM training_records WHERE id = activity_b) THEN RAISE EXCEPTION 'Failed batch left a partial write'; END IF;
 DELETE FROM users WHERE id = alice;
 IF EXISTS (SELECT 1 FROM training_records WHERE user_id = alice) THEN RAISE EXCEPTION 'Account deletion left training records'; END IF;
 DELETE FROM users WHERE id = bob;
END;
$$;
