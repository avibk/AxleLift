import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FeedCategory, ResearchArticle } from "@/src/types/research.types";

const EUROPE_PMC_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest";
const NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const CACHE_PREFIX = "axlelift_feed_cache_";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const CATEGORY_QUERIES: Record<FeedCategory, string> = {
  All: "(hypertrophy OR resistance training OR muscle strength) AND OPEN_ACCESS:Y",
  Hypertrophy: "hypertrophy AND resistance training",
  Biomechanics: "biomechanics AND (squat OR bench press OR deadlift OR resistance training)",
  Recovery: "muscle recovery AND resistance training",
  Nutrition: "protein AND muscle protein synthesis AND resistance training",
  Myths: '"systematic review" AND (fitness OR exercise) AND (myth OR misconception)',
};

interface EuropePmcResult {
  id?: string;
  source?: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title?: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  abstractText?: string;
  citedByCount?: number;
}

function buildSourceUrl(result: EuropePmcResult): string {
  if (result.doi) return `https://doi.org/${result.doi}`;
  if (result.pmcid) return `https://europepmc.org/article/MED/${result.pmcid.replace(/^PMC/i, "")}`;
  if (result.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`;
  return "https://europepmc.org/";
}

function normalizeEuropePmcResult(result: EuropePmcResult): ResearchArticle | null {
  if (!result.title?.trim()) return null;

  const id = result.pmid || result.pmcid || result.id || result.doi;
  if (!id) return null;

  return {
    id: String(id),
    title: result.title.trim(),
    abstract: result.abstractText?.trim() || "No abstract available.",
    authors: result.authorString?.trim() || "Unknown authors",
    journal: result.journalTitle?.trim() || "Unknown journal",
    year: result.pubYear ? parseInt(result.pubYear, 10) : new Date().getFullYear(),
    citationCount: result.citedByCount,
    doi: result.doi,
    pmid: result.pmid,
    sourceUrl: buildSourceUrl(result),
    source: "europepmc",
  };
}

async function readCache(key: string): Promise<ResearchArticle[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAt: number; articles: ResearchArticle[] };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.articles;
  } catch {
    return null;
  }
}

async function writeCache(key: string, articles: ResearchArticle[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ fetchedAt: Date.now(), articles }));
  } catch {
    // best effort
  }
}

async function searchEuropePmc(query: string, pageSize = 20): Promise<ResearchArticle[]> {
  const params = new URLSearchParams({
    query,
    format: "json",
    pageSize: String(pageSize),
    resultType: "core",
    sort: "CITED desc",
  });

  const res = await fetch(`${EUROPE_PMC_BASE}/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Europe PMC search failed (${res.status})`);

  const data = (await res.json()) as {
    resultList?: { result?: EuropePmcResult[] };
  };

  return (data.resultList?.result ?? [])
    .map(normalizeEuropePmcResult)
    .filter((a): a is ResearchArticle => a !== null);
}

async function searchPubMedFallback(query: string, pageSize = 10): Promise<ResearchArticle[]> {
  const email = process.env.EXPO_PUBLIC_NCBI_EMAIL ?? "support@axlelift.app";
  const tool = "AxleLift";

  const searchParams = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmode: "json",
    retmax: String(pageSize),
    tool,
    email,
  });

  const searchRes = await fetch(`${NCBI_BASE}/esearch.fcgi?${searchParams.toString()}`);
  if (!searchRes.ok) throw new Error(`PubMed search failed (${searchRes.status})`);

  const searchData = (await searchRes.json()) as {
    esearchresult?: { idlist?: string[] };
  };
  const ids = searchData.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryParams = new URLSearchParams({
    db: "pubmed",
    id: ids.join(","),
    retmode: "json",
    tool,
    email,
  });

  const summaryRes = await fetch(`${NCBI_BASE}/esummary.fcgi?${summaryParams.toString()}`);
  if (!summaryRes.ok) throw new Error(`PubMed summary failed (${summaryRes.status})`);

  const summaryData = (await summaryRes.json()) as {
    result?: Record<string, { uid?: string; title?: string; fulljournalname?: string; pubdate?: string; authors?: { name: string }[]; elocationid?: string }>;
  };

  const resultMap = summaryData.result ?? {};
  const articles: ResearchArticle[] = [];

  for (const id of ids) {
    const item = resultMap[id];
    if (!item?.title) continue;

    const doi = item.elocationid?.startsWith("doi: ") ? item.elocationid.slice(5) : undefined;

    articles.push({
      id,
      title: item.title,
      abstract: "Open in PubMed for the full abstract.",
      authors: item.authors?.map((a) => a.name).join(", ") || "Unknown authors",
      journal: item.fulljournalname || "PubMed",
      year: item.pubdate ? parseInt(item.pubdate.split(" ")[0], 10) : new Date().getFullYear(),
      pmid: id,
      doi,
      sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      source: "pubmed",
    });
  }

  return articles;
}

function buildQuery(category: FeedCategory, searchText?: string): string {
  const base = CATEGORY_QUERIES[category];
  const trimmed = searchText?.trim();
  if (!trimmed) return base;
  return `(${base}) AND (${trimmed})`;
}

export const researchFeedService = {
  async fetchArticles(
    category: FeedCategory,
    searchText?: string
  ): Promise<ResearchArticle[]> {
    const query = buildQuery(category, searchText);
    const cacheKey = `${CACHE_PREFIX}${category}_${query}`;

    const cached = await readCache(cacheKey);
    if (cached) return cached;

    try {
      const articles = await searchEuropePmc(query);
      if (articles.length > 0) {
        await writeCache(cacheKey, articles);
        return articles;
      }
    } catch (err) {
      if (__DEV__) console.warn("[researchFeed] Europe PMC failed:", err);
    }

    try {
      const fallback = await searchPubMedFallback(query);
      if (fallback.length > 0) {
        await writeCache(cacheKey, fallback);
      }
      return fallback;
    } catch (err) {
      if (__DEV__) console.warn("[researchFeed] PubMed fallback failed:", err);
      throw err;
    }
  },
};
