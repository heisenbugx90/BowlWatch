ALTER TABLE "aliases" DROP CONSTRAINT "aliases_kind_ck";--> statement-breakpoint
ALTER TABLE "lot_rules" DROP CONSTRAINT "lot_rules_kind_ck";--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "upc_prefixes" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "aliases" ADD CONSTRAINT "aliases_kind_ck" CHECK ("aliases"."kind" in ('name', 'firm', 'dba', 'label', 'short'));--> statement-breakpoint
ALTER TABLE "lot_rules" ADD CONSTRAINT "lot_rules_kind_ck" CHECK ("lot_rules"."kind" in ('exact', 'prefix', 'range', 'best_by_date', 'best_by_range', 'all_lots', 'retailer_scope', 'suffix'));