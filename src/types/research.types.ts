export type FeedCategory =
  | "All"
  | "Hypertrophy"
  | "Biomechanics"
  | "Recovery"
  | "Nutrition"
  | "Myths";

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
}
