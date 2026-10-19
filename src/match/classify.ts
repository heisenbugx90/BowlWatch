/**
 * Pet-food classification at EVENT level. OWNER: matcher agent.
 *
 * - An event is pet food if ANY of its rows matches the brand/alias table, or has a
 *   species word + food term; the verdict propagates to every row of the event
 *   (e.g. Hill's 2019: 28 of 31 rows never say dog/cat).
 * - Exclude drugs / devices / livestock feed: tablets, mg/mL, injectable, otic,
 *   softgels, wipes, shampoo, wormer, milk replacer, medicated feed, ...; firms such as
 *   Elanco, Ceva, Virbac, Dechra, Neogen, Boehringer Ingelheim.
 * - Unsure -> 'unreviewed' + review item 'unclassified'.
 *
 * Row verdicts, in order:
 *   0. food for an animal we do not cover ("Fish Food", "For All Fresh Water Fish", "Bird Seed")
 *      -> no for that row even inside a pet-food event (EventClassification.excludedRows)
 *   1. a drug / dosage-form / device / grooming term in the description -> no
 *      ("milk replacer" only without a dog/cat word: puppy and kitten milk replacers are food);
 *      a supplement ("probiotics", "multivitamin", "supplements", "hip & joint") with no food noun
 *      (food, treat, kibble, diet, dinner, meal) -> no, whatever the species; a plant kit
 *      ("cat grass") -> no
 *   2. a brand (or line label, or a firm-corroborated short alias) from the catalog -> yes
 *      (unless the row names another animal and no dog/cat: "... MACAW FOOD" -> no; the brand
 *      and firm names themselves are not read for animals: "Hollywood Feed")
 *   3. a dog/cat word + a food term                                    -> yes
 *   4. another animal or livestock feed, no dog/cat word               -> no
 *   4b. a bulk or industrial ingredient (diatomaceous earth, gypsum, canola meal, by-product meal,
 *       flax; totes, IBC, hopper trailers, pneumatic tanks), no dog/cat word -> no
 *      Protein words (fish, goat, lamb, duck, rabbit, deer, pig...) only count when the animal
 *      is the consumer ("Pig Grow/Finish", "Lamb Creep", "for fish"), not an ingredient
 *      ("Fish and Sweet Potato", "Whole Goat", "Goat Milk Formula", "Fish Treats").
 *   5. "pet food", "pig ears", "bully sticks", "rawhide", "kibble", "bone chews" -> yes
 *   6. "pet" + a food term ("Pet Chews Bully Bites")                   -> yes
 *   6b. a recalling firm named as a pet company ("Ollie Pets Inc", "Gaines Pet Treats LLC")
 *       + a food term in the row                                       -> yes
 *   7. the recalling firm names a catalog brand (not a co-packer)      -> yes (weak)
 * Event: a known drug / device / feed firm with no catalog brand -> no. Otherwise yes if any
 * row says yes; else the Reason for Recall ("canned dog foods", "raw pet food", "dog chews")
 * decides yes when no row said no; a potency reason ("sub-potent assay results") -> no;
 * else no if any row says no; else unreviewed.
 *
 * Listing events also pass the de-slugged notice title: it counts as species / food evidence and
 * for the supplement rule ("fi-recalls-supplements-dogs-..."), never for other exclusions.
 *
 * A 'no' event whose excluded rows are an ingredient or premix that names dogs, cats or canned /
 * pet food ("2217 Canned Canine PMX") carries `upstream`: the run opens an upstream_ingredient
 * review item so downstream brand recalls can be traced to it.
 */
import { normalizeText } from "../lib/normalize";
import type { EventClassification } from "../types";
import { matchProductDetailed, type CatalogIndex } from "./matcher";

export interface ClassifyInput {
  firm: string | null;
  /** Reason for Recall (iRES) / recall reason (listing). Read for species + food words only. */
  reason?: string | null;
  products: { productDescription: string; codeInfo: string | null }[];
  /** De-slugged listing title (fda_listing only). Species / food / supplement evidence only. */
  title?: string | null;
}

const DOG_CAT = /\b(?:dogs?|doggie|doggy|puppy|puppies|pup|pups|canine|canines|k9|cats?|kitten|kittens|kitty|feline|felines)\b/;
const PET = /\b(?:pets?)\b/;

const FOOD =
  /\b(?:food|foods|treats?|chews?|diets?|meals?|kibble|dinners?|recipes?|formulas?|entrees?|biscuits?|jerky|toppers?|mixers?|raw|freeze dried|dehydrated|pate|stew|bites|chunks|morsels|nuggets|patties|chubs?|rolls?|sticks?|bully|pig ears?|ears|hooves|rawhide|bones?|cuts|loaf|gravy|broth|kibbles|snacks?|feast|cuisine|nutrition|dry|wet|canned|cans?|bags?|lbs?|oz|dish(?:es)?|baked|chips|milk replacers?)\b/;

/** Drugs, supplements in dosage form, devices, grooming. Matched on normalized text. */
const DRUG_TERMS = [
  "tablets?",
  "caplets?",
  "capsules?",
  "softgels?",
  "soft gels?",
  "injectable",
  "injections?",
  "syringes?",
  "vials?",
  "otic",
  "ophthalmic",
  "ointment",
  "suspension",
  "oral solution",
  "topical",
  "solution",
  "spray",
  "wipes?",
  "pads",
  "shampoos?",
  "conditioner",
  "wormer",
  "dewormer",
  "anthelmintic",
  "medicated",
  "ivermectin",
  "praziquantel",
  "pyrantel",
  "carprofen",
  "meloxicam",
  "phenylpropanolamine",
  "levothyroxine",
  "chlorhexidine",
  "antiseptic",
  "antibiotic(?! free)",
  "homeopathic",
  "cbd",
  "hemp oil",
  "rx only",
  "prescription drug",
  "caution federal law",
  "flea",
  "tick collar",
  "collars?",
  "leash",
  "harness",
  "litter",
  "test kits?",
  "diagnostic",
  "premix",
  "test strips?",
  "reagents?",
  "analy[sz]ers?",
  "monitors?",
  "endotracheal",
  "catheters?",
  "needles?",
  "luer",
  "soluble powder",
  "coccidiostat",
  "joint supplement",
  "drug products?",
  "ndc",
  "udi(?: di)?",
  "iv sets?",
  "w v",
  "automated system",
  "electrolyte tests?",
  "assays?",
  "tricaine",
  "periodontal",
  "iodine",
  "disinfectants?",
  "drink(?:ing)? bottles?",
  "water bottles?",
  "bottles?",
  "homeopet",
  "fenbendazole",
  "fbz",
  "medigel",
  String.raw`\d+(?:\.\d+)? ?(?:mg|mcg|ml|iu)(?: (?:per )?(?:tablet|capsule|chew|softgel|dose|ml))?`,
  "mg ml",
];
/** Supplements: excluded unless a food noun says the product is food ("... dog food with probiotics"). */
const SUPPLEMENT = /\b(?:probiotics?|multi ?vitamins?|supplements?|hip (?:and )?joint)\b/;
const FOOD_NOUN = /\b(?:food|foods|kibble|diets?|dinners?|treats?|meals?|entrees?|recipes?)\b/;
/** Not food at all although sold for cats or dogs to eat or play with. */
const NOT_FOOD = /\b(?:cat ?grass|grass (?:kit|seed)|grow(?:ing)? kit)\b/;
/**
 * Bulk and industrial ingredients sold to manufacturers or feed mills. Only decisive with no dog/cat
 * word and no catalog brand. Normalized text.
 */
const INGREDIENT = new RegExp(
  String.raw`\b(?:${[
    "diatomaceous earth",
    "fossil shell flour",
    "anti caking agent",
    "food chemical codex",
    "gypsum",
    "terra alba",
    "calcium sulfate",
    "canola meal",
    "soybean meal",
    "by products? meal",
    "by products? dried",
    "flax",
    "inedible",
    "totes?",
    "ibc",
    "hopper(?: bottom)? trailers?",
    "pneumatic tanks?",
    "tight heads?",
    "premix(?:es)?",
  ].join("|")})\b`,
);
/** An excluded ingredient that names dog/cat food is worth tracing upstream. */
const UPSTREAM_HINT = /\b(?:dogs?|cats?|canine|feline|puppy|kitten|pet ?foods?|canned)\b/;
/** Reason for Recall that only a drug has: "sub-potent assay results", "super potent". */
const POTENCY_REASON = /\b(?:sub ?potent|super ?potent|potency)\b/;

/** Products that are dog/cat food or chews on their own, without a species word. */
const PET_FOOD_ALONE = /\b(?:pet ?foods?|pet treats?|pig ears?|piggy ears?|bully sticks?|rawhides?|kibble|bone chews?|dog chews?)\b/;
/** Milk replacers are calf/lamb/kid feed unless a dog/cat word says otherwise. */
const MILK_REPLACER = /\bmilk replacers?\b/;
/** Food for an animal we do not cover; excludes the row even when the event is pet food ("Fat Cat Fish Food"). */
const NOT_OUR_ANIMAL = /\b(?:fish food|fish flakes?|gold ?fish|(?:fresh|salt) ?water fish|pond fish|aquarium|koi|betta|bird ?seed|wild bird|parrot food|reptile|reptomin)\b/;
/** A recalling firm that calls itself a pet company. Normalized. */
const PET_FIRM = /\b(?:pets?|pet (?:foods?|treats?|products|nutrition)|petfoods?)\b/;

const DRUG = new RegExp(String.raw`\b(?:${DRUG_TERMS.join("|")})\b`);

/** Other animals and livestock feed. Only consulted when no dog/cat word is present. */
const OTHER_ANIMAL_TERMS = [
  "gilts?",
  "ewes?",
  "fresh cows?",
  "holsteins?",
  "meat ?birds?",
  "hedgehogs?",
  "sugar gliders?",
  "small animals?",
  "flock",
  "creep",
  "pellets?",
  "plt",
  "crumbles?",
  "monensin",
  "cracked corn",
  "urea",
  "npn",
  "non protein nitrogen",
  "salt blocks?",
  "mineral blocks?",
  "picking stones?",
  "mineral tubs?",
  "milk replacers?",
  "timothy",
  "hay",
  "cattle",
  "calf",
  "calves",
  "bovine",
  "dairy",
  "horses?",
  "equine",
  "swine",
  "hogs?",
  "sows?",
  "poultry",
  "broilers?",
  "layers?",
  "laying hens?",
  "chicks",
  "sheep",
  "ovine",
  "wildlife",
  "livestock",
  "feedlot",
  "aquaculture",
  "koi",
  "guinea pigs?",
  "hamsters?",
  "gerbils?",
  "ferrets?",
  "chinchillas?",
  "rodents?",
  "reptiles?",
  "parrots?",
  "macaws?",
  "cockatiels?",
  "parakeets?",
  "birds?",
  "bird seed",
  "complete feed",
  "supplement feed",
  "feed",
  "mineral",
  "lick tubs?",
];
const OTHER_ANIMAL = new RegExp(String.raw`\b(?:${OTHER_ANIMAL_TERMS.join("|")})\b`);
/**
 * Animals that are also dog/cat food proteins. They only count as "another animal" when the
 * animal eats the product: "Pig Grow/Finish", "Lamb Creep", "Quail Starter", "for fish".
 */
const PROTEIN_ANIMALS = String.raw`(?:fish|catfish|shrimp|goats?|lambs?|ducks?|rabbits?|deer|pigs?|quail|turkeys?|chickens?|cows?)`;
const CONSUMER_WORDS = String.raw`(?:feed|feeds|chow|pellets?|flakes|starter|grower|grow|finisher|finish|ration|creep|seed|feeder|crumbles?|layer|show)`;
const PROTEIN_CONSUMER = new RegExp(
  String.raw`\b${PROTEIN_ANIMALS} ${CONSUMER_WORDS}\b|\b(?:show|pet|starter|grower|finishing|feeder|market) ${PROTEIN_ANIMALS}\b|\bfor (?:(?:all|adult|young|growing|baby|show|market|breeding|fresh|salt|water|pond|tropical) ){0,3}${PROTEIN_ANIMALS}\b`,
);

/** Drug, device and livestock-feed firms whose CVM recalls are never dog/cat food. Normalized. */
export const EXCLUDED_FIRMS = [
  "elanco",
  "ceva",
  "virbac",
  "dechra",
  "neogen",
  "boehringer",
  "zoetis",
  "merck animal health",
  "intervet",
  "bimeda",
  "norbrook",
  "vetoquinol",
  "phibro",
  "huvepharma",
  "kindred bio",
  "aurora pharmaceutical",
  "pegasus",
  "bayer",
  "putney",
  "piedmont animal health",
  "ivx animal health",
  "vetone",
  "covetrus",
  "nutramax",
  "homeopathic",
  "hi pro feeds",
  "cargill inc",
  "cargill incorporated",
  "purina animal nutrition",
  "adm animal nutrition",
  "adm alliance nutrition",
  "ridley",
  "kent nutrition",
  "kent feeds",
  "chs",
  "medical",
  "diagnostics",
  "biotechnology",
  "pharmaceutical",
  "pharmaceuticals",
  "pharmacy",
  "compounding",
];

function excludedFirm(firm: string | null): string | null {
  const f = ` ${normalizeText(firm)} `;
  return EXCLUDED_FIRMS.find((x) => f.includes(` ${x} `)) ?? null;
}

/** ` text ` with every matched catalog phrase removed, so "Hollywood Feed" does not read as livestock feed. */
function withoutPhrases(text: string, phrases: string[]): string {
  let t = ` ${text} `;
  for (const p of phrases) if (p) t = t.split(` ${p} `).join(" ");
  return t.trim();
}

function otherAnimal(desc: string): RegExpExecArray | null {
  return OTHER_ANIMAL.exec(desc) ?? PROTEIN_CONSUMER.exec(desc);
}

export function classifyEvent(event: ClassifyInput, index: CatalogIndex): EventClassification {
  const reasons: string[] = [];
  let yes = false;
  let no = false;
  let brandHit = false;
  let firmBrand = false;
  const excludedRows: number[] = [];
  const petFirm = PET_FIRM.exec(normalizeText(event.firm));

  const title = normalizeText(event.title ?? "");
  const upstream: string[] = [];
  event.products.forEach((p, rowIndex) => {
    const desc = normalizeText(p.productDescription);
    const text = normalizeText(`${p.productDescription} ${p.codeInfo ?? ""} ${event.title ?? ""}`);
    const notOurs = NOT_OUR_ANIMAL.exec(desc);
    if (notOurs) {
      no = true;
      excludedRows.push(rowIndex);
      reasons.push(`not dog/cat:${notOurs[0]}`);
      return;
    }
    const dc = DOG_CAT.exec(text);
    // an omnibus notice ("human food, animal (pet) food, medical devices, and drug products") still covers pet food
    const drug = PET_FOOD_ALONE.exec(desc) ? null : (DRUG.exec(desc) ?? (!dc ? MILK_REPLACER.exec(desc) : null));
    if (drug) {
      no = true;
      reasons.push(`excluded term:${drug[0]}`);
      if (/^premix/.test(drug[0]) && UPSTREAM_HINT.test(desc)) upstream.push(p.productDescription.slice(0, 120));
      return;
    }
    const supplement = SUPPLEMENT.exec(`${desc} ${title}`);
    if (supplement && !FOOD_NOUN.test(desc)) {
      no = true;
      reasons.push(`supplement:${supplement[0]}`);
      return;
    }
    const notFood = NOT_FOOD.exec(desc);
    if (notFood) {
      no = true;
      reasons.push(`not food:${notFood[0]}`);
      return;
    }
    const fd = FOOD.exec(text);
    const res = matchProductDetailed({ description: p.productDescription, codeInfo: p.codeInfo, firm: event.firm }, index);
    const other = otherAnimal(withoutPhrases(desc, res.spans.map((sp) => sp.phrase)));
    if (res.strongBrandIds.length) {
      // "DOCTORS FOSTER AND SMITH ... MACAW FOOD": a pet brand selling food for other animals
      if (!dc && other) {
        no = true;
        reasons.push(`brand ${res.strongBrandIds.join("+")} but other animal:${other[0]}`);
        return;
      }
      yes = brandHit = true;
      reasons.push(`alias:${res.strongBrandIds.join("+")}`);
      return;
    }
    if (dc && fd) {
      yes = true;
      reasons.push(`species+food:${dc[0]}+${fd[0]}`);
      return;
    }
    if (!dc && other) {
      no = true;
      reasons.push(`other animal or feed:${other[0]}`);
      return;
    }
    const ingredient = !dc ? INGREDIENT.exec(desc) : null;
    if (ingredient) {
      no = true;
      reasons.push(`bulk ingredient:${ingredient[0]}`);
      if (UPSTREAM_HINT.test(desc)) upstream.push(p.productDescription.slice(0, 120));
      return;
    }
    const alone = PET_FOOD_ALONE.exec(text);
    if (alone) {
      yes = true;
      reasons.push(`pet food term:${alone[0]}`);
      return;
    }
    const pet = PET.exec(text);
    if (pet && fd) {
      yes = true;
      reasons.push(`pet+food:${fd[0]}`);
      return;
    }
    if (petFirm && fd) {
      yes = true;
      reasons.push(`pet firm+food:${petFirm[0]}+${fd[0]}`);
      return;
    }
    if (!firmBrand && event.firm) {
      const fr = matchProductDetailed({ description: "", firm: event.firm }, index);
      if (fr.matches.length) {
        firmBrand = true;
        reasons.push(`firm brand:${fr.matches.map((m) => m.brandId).join("+")}`);
      }
    }
  });

  // A known drug / device firm overrides keyword evidence, never a catalog brand.
  const drugFirm = excludedFirm(event.firm);
  if (drugFirm && !brandHit) {
    reasons.push(`excluded firm:${drugFirm}`);
    return { petFood: "no", reasons: dedupe(reasons), excludedRows, upstream };
  }
  if (yes) return { petFood: "yes", reasons: dedupe(reasons), excludedRows };
  if (!no && event.reason) {
    const r = normalizeText(event.reason);
    const dc = DOG_CAT.exec(r);
    const fd = FOOD.exec(r);
    const alone = PET_FOOD_ALONE.exec(r);
    if (!DRUG.exec(r) && ((dc && fd) || alone)) {
      reasons.push(`reason:${alone ? alone[0] : `${dc![0]}+${fd![0]}`}`);
      return { petFood: "yes", reasons: dedupe(reasons), excludedRows };
    }
  }
  // A potency failure is a drug problem ("One lot of product had sub-potent assay results").
  if (event.reason) {
    const pr = POTENCY_REASON.exec(normalizeText(event.reason));
    if (pr) {
      reasons.push(`reason drug:${pr[0]}`);
      return { petFood: "no", reasons: dedupe(reasons), excludedRows, upstream };
    }
  }
  // The reason names only another animal ("... in horses", "cattle"): not ours.
  if (!no && event.reason) {
    const r = normalizeText(event.reason);
    const other = !DOG_CAT.exec(r) && !PET.exec(r) ? (OTHER_ANIMAL.exec(r) ?? PROTEIN_CONSUMER.exec(r)) : null;
    if (other) {
      reasons.push(`reason other animal:${other[0]}`);
      return { petFood: "no", reasons: dedupe(reasons), excludedRows, upstream };
    }
  }
  if (no) return { petFood: "no", reasons: dedupe(reasons), excludedRows, upstream };
  if (firmBrand) return { petFood: "yes", reasons: dedupe(reasons), excludedRows };
  return { petFood: "unreviewed", reasons: dedupe(reasons), excludedRows };
}

const dedupe = (xs: string[]) => [...new Set(xs)].slice(0, 20);
