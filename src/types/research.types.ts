export type FeedCategory =
  | "All"
  | "Hypertrophy"
  | "Biomechanics"
  | "Recovery"
  | "Nutrition"
  | "Evidence Reviews";

export type ResearchCategory = Exclude<FeedCategory, "All">;

export interface ResearchArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  year: number;
  citationCount?: number;
  doi?: string;
  pmid?: string;
  sourceUrl: string;
  source: "europepmc" | "pubmed";
  /** Computed once when the feed response is normalized and cached. */
  categories?: ResearchCategory[];
}
