CREATE TABLE "aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"alias" text NOT NULL,
	"normalized" text NOT NULL,
	"kind" text NOT NULL,
	CONSTRAINT "aliases_entity_normalized_kind_uq" UNIQUE("entity_type","entity_id","normalized","kind"),
	CONSTRAINT "aliases_entity_type_ck" CHECK ("aliases"."entity_type" in ('parent', 'brand', 'line', 'manufacturer')),
	CONSTRAINT "aliases_kind_ck" CHECK ("aliases"."kind" in ('name', 'firm', 'dba', 'label'))
);
--> statement-breakpoint
CREATE TABLE "brand_manufacturers" (
	"brand_id" text NOT NULL,
	"manufacturer_id" text NOT NULL,
	CONSTRAINT "brand_manufacturers_brand_id_manufacturer_id_pk" PRIMARY KEY("brand_id","manufacturer_id")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"parent_id" text NOT NULL,
	"markets" text[] DEFAULT '{}'::text[] NOT NULL,
	"sources" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingest_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"rows_read" integer DEFAULT 0 NOT NULL,
	"rows_new" integer DEFAULT 0 NOT NULL,
	"rows_updated" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"db_size_bytes" bigint
);
--> statement-breakpoint
CREATE TABLE "lot_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"kind" text NOT NULL,
	"value" text,
	"value_to" text,
	"date_from" date,
	"date_to" date,
	"scope" text,
	"raw" text NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	CONSTRAINT "lot_rules_kind_ck" CHECK ("lot_rules"."kind" in ('exact', 'prefix', 'range', 'best_by_date', 'best_by_range', 'all_lots', 'retailer_scope'))
);
--> statement-breakpoint
CREATE TABLE "manufacturers" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sources" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "parents" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sources" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_lines" (
	"id" text PRIMARY KEY NOT NULL,
	"brand_id" text NOT NULL,
	"name" text NOT NULL,
	"species" text[] DEFAULT '{}'::text[] NOT NULL,
	"formats" text[] DEFAULT '{}'::text[] NOT NULL,
	"discontinued" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recall_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"source_event_id" text NOT NULL,
	"firm" text,
	"notice_url" text,
	"enforcement_report_url" text,
	"initiated_on" date,
	"classified_on" date,
	"report_date" date,
	"terminated_on" date,
	"status" text,
	"classification" text,
	"reason" text,
	"pet_food" text DEFAULT 'unreviewed' NOT NULL,
	"linked_event_id" integer,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_modified" date,
	"raw" jsonb NOT NULL,
	CONSTRAINT "recall_events_source_event_uq" UNIQUE("source","source_event_id"),
	CONSTRAINT "recall_events_source_ck" CHECK ("recall_events"."source" in ('fda_ires', 'fda_listing', 'hc')),
	CONSTRAINT "recall_events_pet_food_ck" CHECK ("recall_events"."pet_food" in ('yes', 'no', 'unreviewed'))
);
--> statement-breakpoint
CREATE TABLE "recall_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"event_id" integer NOT NULL,
	"brand_id" text NOT NULL,
	"line_id" text,
	"level" text NOT NULL,
	"method" text NOT NULL,
	"detail" text,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recall_matches_uq" UNIQUE NULLS NOT DISTINCT("event_id","product_id","brand_id","line_id"),
	CONSTRAINT "recall_matches_level_ck" CHECK ("recall_matches"."level" in ('brand', 'line', 'lot')),
	CONSTRAINT "recall_matches_method_ck" CHECK ("recall_matches"."method" in ('alias', 'manual', 'listing'))
);
--> statement-breakpoint
CREATE TABLE "recall_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"recall_number" text,
	"row_key" text NOT NULL,
	"product_description" text NOT NULL,
	"code_info" text,
	"more_code_info" text,
	"upcs" text[] DEFAULT '{}'::text[] NOT NULL,
	"raw" jsonb NOT NULL,
	CONSTRAINT "recall_products_row_key_uq" UNIQUE("row_key")
);
--> statement-breakpoint
CREATE TABLE "review_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer,
	"product_id" integer,
	"reason" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	CONSTRAINT "review_items_uq" UNIQUE NULLS NOT DISTINCT("event_id","product_id","reason"),
	CONSTRAINT "review_items_reason_ck" CHECK ("review_items"."reason" in ('unmatched', 'ambiguous', 'unclassified', 'link_listing', 'lot_parse')),
	CONSTRAINT "review_items_status_ck" CHECK ("review_items"."status" in ('open', 'resolved', 'dismissed')),
	CONSTRAINT "review_items_target_ck" CHECK ("review_items"."event_id" is not null or "review_items"."product_id" is not null)
);
--> statement-breakpoint
ALTER TABLE "brand_manufacturers" ADD CONSTRAINT "brand_manufacturers_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_manufacturers" ADD CONSTRAINT "brand_manufacturers_manufacturer_id_manufacturers_id_fk" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lot_rules" ADD CONSTRAINT "lot_rules_product_id_recall_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recall_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_lines" ADD CONSTRAINT "product_lines_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recall_events" ADD CONSTRAINT "recall_events_linked_event_id_recall_events_id_fk" FOREIGN KEY ("linked_event_id") REFERENCES "public"."recall_events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recall_matches" ADD CONSTRAINT "recall_matches_product_id_recall_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recall_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recall_matches" ADD CONSTRAINT "recall_matches_event_id_recall_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."recall_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recall_products" ADD CONSTRAINT "recall_products_event_id_recall_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."recall_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_event_id_recall_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."recall_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_product_id_recall_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recall_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aliases_normalized_idx" ON "aliases" USING btree ("normalized");--> statement-breakpoint
CREATE INDEX "brands_parent_idx" ON "brands" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "lot_rules_product_idx" ON "lot_rules" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_lines_brand_idx" ON "product_lines" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "recall_events_pet_food_idx" ON "recall_events" USING btree ("pet_food");--> statement-breakpoint
CREATE INDEX "recall_events_classified_idx" ON "recall_events" USING btree ("classified_on");--> statement-breakpoint
CREATE INDEX "recall_matches_brand_idx" ON "recall_matches" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "recall_matches_line_idx" ON "recall_matches" USING btree ("line_id");--> statement-breakpoint
CREATE INDEX "recall_products_event_idx" ON "recall_products" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "review_items_status_idx" ON "review_items" USING btree ("status");