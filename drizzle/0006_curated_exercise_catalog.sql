CREATE TABLE "training_exercise_catalog" (
	"slug" varchar(160) PRIMARY KEY NOT NULL,
	"category" varchar(20) NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "training_exercise_catalog_category_check" CHECK ("training_exercise_catalog"."category" IN ('mobility','strength','conditioning','solo','recovery')),
	CONSTRAINT "training_exercise_catalog_data_check" CHECK (jsonb_typeof("training_exercise_catalog"."data") = 'object')
);
--> statement-breakpoint
CREATE INDEX "training_exercise_catalog_category_idx" ON "training_exercise_catalog" USING btree ("category");