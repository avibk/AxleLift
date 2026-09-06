import type { FeedCategory, ResearchArticle, ResearchCategory } from "@/src/types/research.types";

interface CategoryDefinition {
  queryTerms: readonly string[];
  primaryTerms: readonly string[];
  supportingTerms: readonly string[];
}

export interface ResearchArticleEvaluation {
  category: ResearchCategory;
  relevanceScore: number;
}

export interface ResearchArticleClassification {
  isRelevant: boolean;
  categories: ResearchCategory[];
}

interface RankResearchArticlesOptions {
  includeAbstract?: boolean;
  limit?: number;
  requireLocalEligibility?: boolean;
}

const RESEARCH_CATEGORIES: readonly ResearchCategory[] = [
  "Hypertrophy",
  "Biomechanics",
  "Recovery",
  "Nutrition",
  "Evidence Reviews",
];

const LIFTING_ANCHORS = [
  "resistance training",
  "resistance exercise",
  "resistance trained",
  "strength training",
  "strength exercise",
  "strength trained",
  "weight training",
  "bodybuilding",
  "bodybuilder",
  "weightlifting",
  "powerlifting",
  "squat",
  "bench press",
  "deadlift",
] as const;

const DIRECT_MUSCLE_BUILDING_TERMS = [
  "muscle hypertrophy",
  "muscular hypertrophy",
  "muscle growth",
  "muscle protein synthesis",
  "progressive overload",
] as const;

const CATEGORY_DEFINITIONS: Record<ResearchCategory, CategoryDefinition> = {
  Hypertrophy: {
    queryTerms: [
      "hypertrophy",
      "muscle protein synthesis",
      "muscle mass",
      "progressive overload",
      "sarcopenia",
      "mtor",
    ],
    primaryTerms: [
      "muscle hypertrophy",
      "muscular hypertrophy",
      "hypertrophy",
      "muscle protein synthesis",
      "muscle growth",
      "muscle mass",
      "progressive overload",
      "sarcopenia",
      "mtor",
      "anabolic response",
    ],
    supportingTerms: ["anabolic", "concentric", "eccentric", "muscle physiology"],
  },
  Biomechanics: {
    queryTerms: [
      "biomechanics",
      "kinematics",
      "kinetics",
      "joint angle",
      "torque",
      "motor unit recruitment",
    ],
    primaryTerms: [
      "biomechanics",
      "kinematics",
      "kinetics",
      "movement pattern",
      "joint angle",
      "joint moment",
      "torque",
      "motor unit recruitment",
      "interlimb coordination",
    ],
    supportingTerms: ["force", "muscle physiology", "range of motion", "moment arm"],
  },
  Recovery: {
    queryTerms: [
      "muscle recovery",
      "exercise induced muscle damage",
      "doms",
      "neuromuscular fatigue",
      "central fatigue",
      "sleep",
    ],
    primaryTerms: [
      "muscle recovery",
      "exercise induced muscle damage",
      "eimd",
      "delayed onset muscle soreness",
      "doms",
      "neuromuscular fatigue",
      "central fatigue",
      "recovery strategies",
    ],
    supportingTerms: ["recovery", "sleep", "fatigue", "muscle damage", "soreness"],
  },
  Nutrition: {
    queryTerms: [
      "whey protein",
      "creatine",
      "leucine",
      "amino acids",
      "sports nutrition",
      "nutrient timing",
      "hydration",
    ],
    primaryTerms: [
      "whey protein",
      "creatine",
      "leucine",
      "amino acids",
      "essential amino acids",
      "branched chain amino acids",
      "bcaa",
      "sports nutrition",
      "nutrient timing",
      "muscle protein synthesis",
    ],
    supportingTerms: [
      "protein",
      "supplementation",
      "diet",
      "carbohydrate",
      "fluid balance",
      "hydration",
    ],
  },
  "Evidence Reviews": {
    queryTerms: ["systematic review", "meta analysis", "evidence review", "umbrella review"],
    primaryTerms: [
      "systematic review",
      "meta analysis",
      "evidence review",
      "umbrella review",
      "scoping review",
    ],
    supportingTerms: ["review", "consensus statement", "position stand"],
  },
};

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-–—/]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeResearchSearch(value?: string): string {
  if (!value) return "";
  return normalizeText(value.slice(0, 80))
    .replace(/\b(?:and|or|not)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTerms(terms: readonly string[]): string[] {
  return [...new Set(terms.map(normalizeText).filter(Boolean))];
}

function hasTerm(text: string, term: string): boolean {
  return ` ${text} `.includes(` ${normalizeText(term)} `);
}

function matchedTermCount(text: string, terms: readonly string[]): number {
  return uniqueTerms(terms).reduce((count, term) => count + Number(hasTerm(text, term)), 0);
}

function sourceTermClause(
  term: string,
  source: "europepmc" | "pubmed"
): string {
  if (source === "europepmc") {
    return `(TITLE:"${term}" OR ABSTRACT:"${term}")`;
  }
  return `"${term}"[Title/Abstract]`;
}

function sourceTermsClause(
  terms: readonly string[],
  source: "europepmc" | "pubmed"
): string {
  return `(${uniqueTerms(terms).map((term) => sourceTermClause(term, source)).join(" OR ")})`;
}

function categoryTerms(category: FeedCategory): string[] {
  if (category !== "All") return [...CATEGORY_DEFINITIONS[category].queryTerms];
  return uniqueTerms(RESEARCH_CATEGORIES.flatMap((item) => CATEGORY_DEFINITIONS[item].queryTerms));
}

function searchClause(searchText: string | undefined, source: "europepmc" | "pubmed"): string {
  const sanitized = sanitizeResearchSearch(searchText);
  if (!sanitized) return "";

  const tokens = sanitized.split(" ");
  const phraseClause = sourceTermClause(sanitized, source);
  if (tokens.length === 1) return phraseClause;

  const tokenClause = tokens.map((token) => sourceTermClause(token, source)).join(" AND ");
  return `(${phraseClause} OR (${tokenClause}))`;
}

function buildScopedQuery(
  category: FeedCategory,
  searchText: string | undefined,
  source: "europepmc" | "pubmed"
): string {
  const context = sourceTermsClause(
    [...LIFTING_ANCHORS, ...DIRECT_MUSCLE_BUILDING_TERMS],
    source
  );
  let categoryClause = sourceTermsClause(categoryTerms(category), source);

  if (source === "pubmed" && category === "Evidence Reviews") {
    categoryClause = `(${categoryClause} OR "systematic review"[Publication Type] OR "meta-analysis"[Publication Type])`;
  }

  const clauses = [context, categoryClause];
  const userClause = searchClause(searchText, source);
  if (userClause) clauses.push(userClause);
  return clauses.map((clause) => `(${clause})`).join(" AND ");
}

export function buildEuropePmcQuery(category: FeedCategory, searchText?: string): string {
  return `${buildScopedQuery(category, searchText, "europepmc")} AND SRC:MED AND HAS_ABSTRACT:Y`;
}

export function buildPubMedQuery(category: FeedCategory, searchText?: string): string {
  return `${buildScopedQuery(category, searchText, "pubmed")} AND hasabstract`;
}

function categoryScore(
  title: string,
  abstract: string,
  category: ResearchCategory
): { eligible: boolean; score: number } {
  const definition = CATEGORY_DEFINITIONS[category];
  const titleContext = matchedTermCount(title, [...LIFTING_ANCHORS, ...DIRECT_MUSCLE_BUILDING_TERMS]);
  const abstractContext = matchedTermCount(abstract, [...LIFTING_ANCHORS, ...DIRECT_MUSCLE_BUILDING_TERMS]);
  const titlePrimary = matchedTermCount(title, definition.primaryTerms);
  const abstractPrimary = matchedTermCount(abstract, definition.primaryTerms);
  const titleSupporting = matchedTermCount(title, definition.supportingTerms);
  const abstractSupporting = matchedTermCount(abstract, definition.supportingTerms);
  const hasContext = titleContext + abstractContext > 0;
  const hasCategorySignal = titlePrimary + abstractPrimary + titleSupporting + abstractSupporting > 0;

  return {
    eligible: hasContext && hasCategorySignal,
    score:
      titleContext * 8 +
      abstractContext * 4 +
      titlePrimary * 8 +
      abstractPrimary * 4 +
      titleSupporting * 3 +
      abstractSupporting,
  };
}

function matchesSearch(title: string, abstract: string, searchText?: string): boolean {
  const sanitized = sanitizeResearchSearch(searchText);
  if (!sanitized) return true;
  const text = `${title} ${abstract}`;
  return sanitized.split(" ").every((term) => hasTerm(text, term));
}

/**
 * Classifies an article against the lifting-specific keyword groups. A category
 * needs both a training/muscle anchor and a category signal, which prevents
 * generic health, disease, and nutrition papers from leaking into the feed.
 */
export function classifyResearchArticle(
  article: ResearchArticle,
  includeAbstract = true
): ResearchArticleClassification {
  const title = normalizeText(article.title);
  const abstract = includeAbstract ? normalizeText(article.abstract) : "";
  const categories = RESEARCH_CATEGORIES.filter(
    (category) => categoryScore(title, abstract, category).eligible
  );

  return { isRelevant: categories.length > 0, categories };
}

export function evaluateResearchArticle(
  article: ResearchArticle,
  requestedCategory: FeedCategory,
  searchText?: string,
  includeAbstract = true
): ResearchArticleEvaluation | null {
  const title = normalizeText(article.title);
  const abstract = includeAbstract ? normalizeText(article.abstract) : "";
  if (!matchesSearch(title, abstract, searchText)) return null;

  const classification = classifyResearchArticle(article, includeAbstract);
  const categories = requestedCategory === "All"
    ? classification.categories
    : classification.categories.filter((category) => category === requestedCategory);
  let best: ResearchArticleEvaluation | null = null;

  for (const category of categories) {
    const evaluation = categoryScore(title, abstract, category);
    if (!evaluation.eligible) continue;
    const searchBonus = sanitizeResearchSearch(searchText) ? 6 : 0;
    const candidate = { category, relevanceScore: evaluation.score + searchBonus };
    if (!best || candidate.relevanceScore > best.relevanceScore) best = candidate;
  }

  return best;
}

function metadataQualityScore(article: ResearchArticle): number {
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - article.year);
  const recency = Math.max(0, 6 - age);
  const citations = Math.min(6, Math.log10(Math.max(0, article.citationCount ?? 0) + 1) * 2);
  return recency + citations;
}

export function rankResearchArticles(
  articles: ResearchArticle[],
  category: FeedCategory,
  searchText?: string,
  options: RankResearchArticlesOptions = {}
): ResearchArticle[] {
  const {
    includeAbstract = true,
    limit = 20,
    requireLocalEligibility = true,
  } = options;

  return articles
    .map((article) => {
      const evaluation = evaluateResearchArticle(article, category, searchText, includeAbstract);
      if (!evaluation && requireLocalEligibility) return null;
      return {
        article,
        relevanceScore: evaluation?.relevanceScore ?? 0,
        qualityScore: metadataQualityScore(article),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort(
      (left, right) =>
        right.relevanceScore - left.relevanceScore ||
        right.qualityScore - left.qualityScore ||
        right.article.year - left.article.year ||
        left.article.id.localeCompare(right.article.id)
    )
    .slice(0, limit)
    .map(({ article }) => ({
      ...article,
      categories: classifyResearchArticle(article, includeAbstract).categories,
    }));
}
