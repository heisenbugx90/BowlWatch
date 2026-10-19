/**
 * Zod schemas for the normalization table in data/**.yaml.
 * Owned by the scaffold; catalog-data agents edit data/** only.
 * See data/README.md for the human-readable version of these rules.
 */
import { z } from "zod";
import { ALIAS_KINDS, FORMATS, MARKETS, SPECIES } from "../types";

/** Lowercase slug: letters, digits, single hyphens. */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase slug like 'blue-buffalo'");

const url = z.url({ protocol: /^https?$/, error: "must be an http(s) URL" });

const nonEmpty = z.string().trim().min(1);

/** Either a bare string (kind defaults per context) or {text, kind}. */
export const aliasEntry = z.union([
  nonEmpty,
  z.object({ text: nonEmpty, kind: z.enum(ALIAS_KINDS) }).strict(),
]);
export type AliasEntry = z.infer<typeof aliasEntry>;

export const parentFile = z
  .object({
    id: slug,
    name: nonEmpty,
    /** Other names the parent trades or files under (kind defaults to "firm"). */
    aliases: z.array(aliasEntry).default([]),
    sources: z.array(url).min(1, "cite at least one source for ownership"),
    notes: z.string().optional(),
  })
  .strict();
export type ParentFile = z.infer<typeof parentFile>;

export const lineEntry = z
  .object({
    id: slug,
    name: nonEmpty,
    /**
     * Bare strings default to kind "name": only counts once the brand is already
     * established in the text. Use {text, kind: label} for text that identifies the
     * brand AND line on its own (e.g. "BLUE Wilderness").
     */
    aliases: z.array(aliasEntry).default([]),
    species: z.array(z.enum(SPECIES)).min(1),
    formats: z.array(z.enum(FORMATS)).min(1),
    discontinued: z.boolean().optional(),
    /**
     * Known UPCs of the line's products, as printed (UPC-A 12 digits, EAN-13, or EAN-8). A recall row
     * carrying one of them gets this line even when its text names only the brand
     * ("Wellness Chicken Formula ... UPC 0-76344-08822-6"). A UPC belongs to at most one line.
     */
    upcs: z.array(z.string().regex(/^\d{8}$|^\d{12,13}$/, "a UPC is 8, 12 or 13 digits as printed")).default([]),
    notes: z.string().optional(),
  })
  .strict();
export type LineEntry = z.infer<typeof lineEntry>;

export const brandFile = z
  .object({
    id: slug,
    name: nonEmpty,
    parent: slug,
    markets: z.array(z.enum(MARKETS)).min(1),
    /** Bare strings default to kind "name". Every brand alias identifies the brand on its own. */
    aliases: z.array(aliasEntry).default([]),
    /** Legal recalling-firm names of the brand owner. Never enough on their own to name a brand. */
    firm_names: z.array(nonEmpty).default([]),
    /** Co-packer ids from data/manufacturers.yaml. */
    manufacturers: z.array(slug).default([]),
    /**
     * GS1 company prefixes printed at the start of the brand owner's UPC-A codes, e.g. "785184"
     * (6 to 10 digits including the number-system digit). A UPC with this prefix plus a recalling
     * firm that is the brand owner gives a brand-level match without the brand name in the text.
     */
    upc_prefixes: z.array(z.string().regex(/^\d{6,10}$/, "a UPC company prefix is 6 to 10 digits")).default([]),
    sources: z.array(url).min(1, "cite at least one source"),
    lines: z.array(lineEntry).default([]),
    notes: z.string().optional(),
  })
  .strict();
export type BrandFile = z.infer<typeof brandFile>;

export const manufacturerEntry = z
  .object({
    id: slug,
    name: nonEmpty,
    /** Recalling-firm spellings seen in notices. */
    firm_names: z.array(nonEmpty).min(1),
    sources: z.array(url).default([]),
    /** Free-text evidence when no URL exists, e.g. "FDA iRES event 76403 (Blue Buffalo Homestyle, 2017)". */
    evidence: z.string().optional(),
  })
  .strict()
  .refine((m) => m.sources.length > 0 || !!m.evidence, "give sources or evidence");
export type ManufacturerEntry = z.infer<typeof manufacturerEntry>;

export const manufacturersFile = z
  .object({ manufacturers: z.array(manufacturerEntry).default([]) })
  .strict();
