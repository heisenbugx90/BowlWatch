ALTER TABLE "lot_rules" DROP CONSTRAINT "lot_rules_kind_ck";--> statement-breakpoint
ALTER TABLE "review_items" DROP CONSTRAINT "review_items_reason_ck";--> statement-breakpoint
ALTER TABLE "product_lines" ADD COLUMN "upcs" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "lot_rules" ADD CONSTRAINT "lot_rules_kind_ck" CHECK ("lot_rules"."kind" in ('exact', 'prefix', 'range', 'best_by_date', 'best_by_range', 'all_lots', 'retailer_scope', 'suffix', 'production_date'));--> statement-breakpoint
ALTER TABLE "review_items" ADD CONSTRAINT "review_items_reason_ck" CHECK ("review_items"."reason" in ('unmatched', 'ambiguous', 'unclassified', 'link_listing', 'lot_parse', 'upstream_ingredient'));