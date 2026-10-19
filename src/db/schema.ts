/**
 * Drizzle schema. SHARED FILE: change additively only, and log the change at the
 * end of docs/ARCHITECTURE.md under "Change log". After editing, run
 * `npm run db:generate` and commit the new file in drizzle/.
 *
 * Catalog tables (parents, brands, product_lines, aliases, manufacturers,
 * brand_manufacturers) are a projection of data/**.yaml and are replaced
 * wholesale by `npm run seed`. Their ids are the slugs from the YAML, so
 * recall_matches can reference them across reseeds. Line ids are
 * "<brand id>/<line id>".
 *
 * Recall tables are source-agnostic: FDA iRES, the FDA recalls listing and
 * (later) Health Canada all land in recall_events / recall_products.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  ALIAS_ENTITY_TYPES,
  ALIAS_KINDS,
  LOT_RULE_KINDS,
  MATCH_LEVELS,
  MATCH_METHODS,
  PET_FOOD_FLAGS,
  RECALL_SOURCES,
  REVIEW_REASONS,
  REVIEW_STATUSES,
} from "../types";

const inList = (values: readonly string[]) => sql.raw(values.map((v) => `'${v}'`).join(", "));
const ts = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });
const isoDate = (name: string) => date(name, { mode: "string" });

// ---------------------------------------------------------------- catalog

export const parents = pgTable("parents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sources: text("sources").array().notNull().default(sql`'{}'::text[]`),
});

export const brands = pgTable(
  "brands",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    parentId: text("parent_id")
      .notNull()
      .references(() => parents.id),
    markets: text("markets").array().notNull().default(sql`'{}'::text[]`),
    sources: text("sources").array().notNull().default(sql`'{}'::text[]`),
    /** GS1 company prefixes of the brand owner's UPCs (data/brands/*.yaml upc_prefixes). */
    upcPrefixes: text("upc_prefixes").array().notNull().default(sql`'{}'::text[]`),
  },
  (t) => [index("brands_parent_idx").on(t.parentId)],
);

export const productLines = pgTable(
  "product_lines",
  {
    id: text("id").primaryKey(), // "<brand>/<line>"
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    species: text("species").array().notNull().default(sql`'{}'::text[]`),
    formats: text("formats").array().notNull().default(sql`'{}'::text[]`),
    discontinued: boolean("discontinued").notNull().default(false),
    /** Known UPC cores of the line's products (data/brands/*.yaml line `upcs`, normalized). */
    upcs: text("upcs").array().notNull().default(sql`'{}'::text[]`),
  },
  (t) => [index("product_lines_brand_idx").on(t.brandId)],
);

/** Polymorphic: entity_type + entity_id point at parents / brands / product_lines / manufacturers. */
export const aliases = pgTable(
  "aliases",
  {
    id: serial("id").primaryKey(),
    entityType: text("entity_type", { enum: ALIAS_ENTITY_TYPES }).notNull(),
    entityId: text("entity_id").notNull(),
    alias: text("alias").notNull(),
    normalized: text("normalized").notNull(),
    kind: text("kind", { enum: ALIAS_KINDS }).notNull(),
  },
  (t) => [
    unique("aliases_entity_normalized_kind_uq").on(t.entityType, t.entityId, t.normalized, t.kind),
    index("aliases_normalized_idx").on(t.normalized),
    check("aliases_entity_type_ck", sql`${t.entityType} in (${inList(ALIAS_ENTITY_TYPES)})`),
    check("aliases_kind_ck", sql`${t.kind} in (${inList(ALIAS_KINDS)})`),
  ],
);

/** Co-packers / contract manufacturers. Not aliases: a co-packer firm never implies a brand. */
export const manufacturers = pgTable("manufacturers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  sources: text("sources").array().notNull().default(sql`'{}'::text[]`),
});

export const brandManufacturers = pgTable(
  "brand_manufacturers",
  {
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    manufacturerId: text("manufacturer_id")
      .notNull()
      .references(() => manufacturers.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.brandId, t.manufacturerId] })],
);

// ---------------------------------------------------------------- recalls

export const recallEvents = pgTable(
  "recall_events",
  {
    id: serial("id").primaryKey(),
    source: text("source", { enum: RECALL_SOURCES }).notNull(),
    /** iRES Event ID; listing path; HC recall id. */
    sourceEventId: text("source_event_id").notNull(),
    firm: text("firm"),
    /** Press release / public notice. Every recall shown to a user links here or to enforcement_report_url. */
    noticeUrl: text("notice_url"),
    enforcementReportUrl: text("enforcement_report_url"),
    initiatedOn: isoDate("initiated_on"),
    classifiedOn: isoDate("classified_on"),
    reportDate: isoDate("report_date"),
    terminatedOn: isoDate("terminated_on"),
    status: text("status"),
    classification: text("classification"),
    reason: text("reason"),
    petFood: text("pet_food", { enum: PET_FOOD_FLAGS }).notNull().default("unreviewed"),
    /** A fda_listing event points at the fda_ires event it was linked to (and vice versa is derivable). */
    linkedEventId: integer("linked_event_id").references((): AnyPgColumn => recallEvents.id, {
      onDelete: "set null",
    }),
    firstSeenAt: ts("first_seen_at").notNull().defaultNow(),
    lastSeenAt: ts("last_seen_at").notNull().defaultNow(),
    lastModified: isoDate("last_modified"),
    raw: jsonb("raw").notNull(),
  },
  (t) => [
    unique("recall_events_source_event_uq").on(t.source, t.sourceEventId),
    index("recall_events_pet_food_idx").on(t.petFood),
    index("recall_events_classified_idx").on(t.classifiedOn),
    check("recall_events_source_ck", sql`${t.source} in (${inList(RECALL_SOURCES)})`),
    check("recall_events_pet_food_ck", sql`${t.petFood} in (${inList(PET_FOOD_FLAGS)})`),
  ],
);

export const recallProducts = pgTable(
  "recall_products",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => recallEvents.id, { onDelete: "cascade" }),
    recallNumber: text("recall_number"),
    /** Globally unique, source-prefixed by the store: e.g. "fda_ires:82018:V-0015-2020". */
    rowKey: text("row_key").notNull().unique("recall_products_row_key_uq"),
    productDescription: text("product_description").notNull(),
    codeInfo: text("code_info"),
    moreCodeInfo: text("more_code_info"),
    /** 10-digit UPC cores (see normalizeUpc). */
    upcs: text("upcs").array().notNull().default(sql`'{}'::text[]`),
    raw: jsonb("raw").notNull(),
  },
  (t) => [index("recall_products_event_idx").on(t.eventId)],
);

export const lotRules = pgTable(
  "lot_rules",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => recallProducts.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: LOT_RULE_KINDS }).notNull(),
    value: text("value"),
    valueTo: text("value_to"),
    dateFrom: isoDate("date_from"),
    dateTo: isoDate("date_to"),
    /** UPC core / SKU / size this rule is limited to; null = whole product row. */
    scope: text("scope"),
    raw: text("raw").notNull(),
    needsReview: boolean("needs_review").notNull().default(false),
  },
  (t) => [
    index("lot_rules_product_idx").on(t.productId),
    check("lot_rules_kind_ck", sql`${t.kind} in (${inList(LOT_RULE_KINDS)})`),
  ],
);

export const recallMatches = pgTable(
  "recall_matches",
  {
    id: serial("id").primaryKey(),
    /** Null for an event-level match (e.g. a listing item matched by brand only). */
    productId: integer("product_id").references(() => recallProducts.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => recallEvents.id, { onDelete: "cascade" }),
    // No FK to brands/product_lines: the catalog is replaced on reseed. The
    // matcher reports matches whose brand/line id no longer exists.
    brandId: text("brand_id").notNull(),
    lineId: text("line_id"),
    level: text("level", { enum: MATCH_LEVELS }).notNull(),
    method: text("method", { enum: MATCH_METHODS }).notNull(),
    detail: text("detail"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: ts("reviewed_at"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("recall_matches_uq").on(t.eventId, t.productId, t.brandId, t.lineId).nullsNotDistinct(),
    index("recall_matches_brand_idx").on(t.brandId),
    index("recall_matches_line_idx").on(t.lineId),
    check("recall_matches_level_ck", sql`${t.level} in (${inList(MATCH_LEVELS)})`),
    check("recall_matches_method_ck", sql`${t.method} in (${inList(MATCH_METHODS)})`),
  ],
);

export const reviewItems = pgTable(
  "review_items",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").references(() => recallEvents.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => recallProducts.id, { onDelete: "cascade" }),
    reason: text("reason", { enum: REVIEW_REASONS }).notNull(),
    status: text("status", { enum: REVIEW_STATUSES }).notNull().default("open"),
    notes: text("notes"),
    createdAt: ts("created_at").notNull().defaultNow(),
    resolvedAt: ts("resolved_at"),
  },
  (t) => [
    // At most one item per (event, product, reason); re-runs must upsert, not duplicate.
    unique("review_items_uq").on(t.eventId, t.productId, t.reason).nullsNotDistinct(),
    index("review_items_status_idx").on(t.status),
    check("review_items_reason_ck", sql`${t.reason} in (${inList(REVIEW_REASONS)})`),
    check("review_items_status_ck", sql`${t.status} in (${inList(REVIEW_STATUSES)})`),
    check("review_items_target_ck", sql`${t.eventId} is not null or ${t.productId} is not null`),
  ],
);

export const ingestRuns = pgTable("ingest_runs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // RecallSource, or "nightly" for the wrapper run
  startedAt: ts("started_at").notNull().defaultNow(),
  finishedAt: ts("finished_at"),
  rowsRead: integer("rows_read").notNull().default(0),
  rowsNew: integer("rows_new").notNull().default(0),
  rowsUpdated: integer("rows_updated").notNull().default(0),
  errors: jsonb("errors").notNull().default(sql`'[]'::jsonb`),
  dbSizeBytes: bigint("db_size_bytes", { mode: "number" }),
});
