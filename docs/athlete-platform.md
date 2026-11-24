# Athlete platform architecture

BJJ Journey runs as a Next.js App Router application backed by Neon PostgreSQL. NextAuth credentials establish the athlete's session. Browser components use TanStack Query and the existing API clients. Route handlers derive ownership from the session and validate request fields with Zod.

## Training records

Journal entries remain the source for completed mat training, and belt promotions remain in the original achievements records. A training activity represents a scheduled occurrence. Its completed result links to an original journal entry or a workout. Dashboard and Progress views read from those sources so scheduling a session does not count it as training.

The training API uses an indexed record table with a collection discriminator, version, owner and validated JSONB payload. Parent references and separate link tables enforce ownership, and PostgreSQL functions coordinate related writes. Workout steps, set targets and results live in the workout payload and represent a historical snapshot. Curated exercises are version-controlled under `lib/training/catalog/`. Private exercises and templates are athlete-owned records. The PostgreSQL catalog projection can be seeded repeatedly by stable slug.

A live workout saves versioned drafts to the server. The browser keeps edits for an already-open workout on the device while disconnected. On reconnect it retries the update and surfaces version conflicts for review. The database links a workout to its planner occurrence during completion and returns the original result for retries.

## Planner and analytics

Planner activities use a local date and an IANA time zone. Recurrence expands against the event’s time zone. Individual changes use occurrence overrides. Original journal dates stay date-only. Storage uses kilograms, and the workout interface converts units for display.

Training load sums completed duration multiplied by explicit session RPE. Original categorical intensity remains visible in the journal. Sessions without an explicit RPE are omitted from load calculations. Estimated strength values and self-reported readiness remain labelled in the interface. Fitness milestones derive from canonical training results and may change when a historical result is deleted.

## Privacy

Recovery and discomfort records are private to the signing-in athlete. They are used to explain optional readiness recommendations and to filter exercise suggestions. Account export includes athlete records and omits authentication secrets. Deletion requires the current password and removes owned data from the database.

## Integration readiness

Future data connections should attach a provider and stable external reference to each imported activity and reuse the existing completion model. Obtain explicit permission for each data category, minimise the retained payload and verify duplicate, revocation, export and deletion behaviour.

Apple Health and Health Connect require evaluation of native platform APIs, entitlements and data access on supported devices. Garmin, Oura and WHOOP require confirmation of official developer access, requested scopes and provider review where applicable. External calendars require a separate decision on read-only export or two-way synchronisation and conflict handling. These integrations require provider feasibility checks before implementation.

## Content and licensing

Exercise position diagrams, the body maps and catalog text are original BJJ Journey content. Each exercise includes provenance. Verify form, programming advice, safety copy and asset rights before public release. Video references are optional and must be verified before adding them. Geist and Geist Mono are bundled from Vercel's `geist` 1.7.0 package under the SIL Open Font License in `app/fonts/OFL.txt`.
