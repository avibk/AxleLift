import { describe, expect, it } from "vitest";
import type { ResearchArticle } from "@/src/types/research.types";
import {
  buildEuropePmcQuery,
  buildPubMedQuery,
  classifyResearchArticle,
  evaluateResearchArticle,
  rankResearchArticles,
  sanitizeResearchSearch,
} from "@/src/utils/researchFeedRelevance";

function article(overrides: Partial<ResearchArticle> = {}): ResearchArticle {
  return {
    id: "pmid-12345",
    title: "Default title",
    abstract: "Default abstract",
    authors: "Smith J, Doe A",
    journal: "Journal of Strength and Conditioning Research",
    year: new Date().getFullYear(),
    citationCount: 10,
    pmid: "12345",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345/",
    source: "europepmc",
    ...overrides,
  };
}

describe("sanitizeResearchSearch", () => {
  it("removes boolean operators and punctuation", () => {
    expect(sanitizeResearchSearch("creatine OR cancer")).toBe("creatine cancer");
    expect(sanitizeResearchSearch("sleep AND recovery")).toBe("sleep recovery");
    expect(sanitizeResearchSearch("hypertrophy; NOT strength")).toBe("hypertrophy strength");
  });

  it("limits input length", () => {
    const long = "a".repeat(120);
    expect(sanitizeResearchSearch(long).length).toBeLessThanOrEqual(80);
  });
});

describe("query builders", () => {
  it("builds Europe PMC queries with title and abstract scoping and context", () => {
    const query = buildEuropePmcQuery("Hypertrophy");
    expect(query).toContain("TITLE:");
    expect(query).toContain("ABSTRACT:");
    expect(query).toContain("resistance training");
    expect(query).toContain("SRC:MED");
    expect(query).toContain("HAS_ABSTRACT:Y");
  });

  it("builds PubMed queries with Title/Abstract scoping and hasabstract", () => {
    const query = buildPubMedQuery("Nutrition");
    expect(query).toContain('[Title/Abstract]');
    expect(query).toContain("hasabstract");
    expect(query).toContain("creatine");
  });

  it("sanitizes user-supplied search text and scopes it in title/abstract", () => {
    const query = buildEuropePmcQuery("Recovery", "sleep) OR cancer");
    expect(query).not.toContain("sleep) OR cancer");
    expect(query).toContain('TITLE:"sleep"');
    expect(query).toContain('ABSTRACT:"cancer"');
  });
});

describe("eligibility and classification", () => {
  it("classifies muscle protein synthesis research and rejects heart-disease content", () => {
    const muscleProteinSynthesis = classifyResearchArticle(
      article({
        title: "Muscle protein synthesis after resistance training",
        abstract: "Protein ingestion after strength training increased muscle protein synthesis.",
      })
    );
    const heartDisease = classifyResearchArticle(
      article({
        title: "Diet and heart disease risk in adults",
        abstract: "We examined cardiovascular outcomes in a general population.",
      })
    );

    expect(muscleProteinSynthesis.isRelevant).toBe(true);
    expect(muscleProteinSynthesis.categories).toContain("Hypertrophy");
    expect(heartDisease).toEqual({ isRelevant: false, categories: [] });
  });

  it("accepts resistance-training creatine research as Nutrition", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Creatine supplementation during resistance training increases muscle mass",
        abstract: "Twelve weeks of resistance training combined with creatine increased lean mass",
      }),
      "Nutrition"
    );
    expect(result?.category).toBe("Nutrition");
    expect(result?.relevanceScore).toBeGreaterThan(0);
  });

  it("rejects kidney-disease protein papers without training context", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Dietary protein restriction in chronic kidney disease",
        abstract: "Low protein diets slow progression of chronic kidney disease",
      }),
      "Nutrition"
    );
    expect(result).toBeNull();
  });

  it("rejects generic hydration papers", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Hydration status and cognitive performance in office workers",
        abstract: "We assessed fluid balance and hydration in sedentary adults",
      }),
      "Nutrition"
    );
    expect(result).toBeNull();
  });

  it("accepts resistance-training sleep/DOMS research as Recovery", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Sleep and delayed onset muscle soreness after resistance training",
        abstract: "Poor sleep exacerbated DOMS and neuromuscular fatigue following resistance exercise",
      }),
      "Recovery"
    );
    expect(result?.category).toBe("Recovery");
  });

  it("rejects generic sleep research", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Sleep quality in adults with insomnia",
        abstract: "We measured polysomnography in patients with chronic insomnia",
      }),
      "Recovery"
    );
    expect(result).toBeNull();
  });

  it("accepts squat joint-torque research as Biomechanics", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Joint torque and kinematics during the barbell squat",
        abstract: "We analyzed knee and hip kinetics in resistance-trained athletes",
      }),
      "Biomechanics"
    );
    expect(result?.category).toBe("Biomechanics");
  });

  it("rejects mechanical force papers unrelated to lifting", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Force distribution in carbon nanotube composites",
        abstract: "We applied tensile force to measure material deformation",
      }),
      "Biomechanics"
    );
    expect(result).toBeNull();
  });

  it("accepts resistance-training sarcopenia interventions as Hypertrophy", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Resistance training reverses sarcopenia in older adults",
        abstract: "Progressive resistance exercise increased muscle mass and strength",
      }),
      "Hypertrophy"
    );
    expect(result?.category).toBe("Hypertrophy");
  });

  it("rejects observational sarcopenia papers without training context", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Prevalence of sarcopenia in community-dwelling older adults",
        abstract: "Cross-sectional study of muscle mass and age",
      }),
      "Hypertrophy"
    );
    expect(result).toBeNull();
  });

  it("accepts a systematic review of muscle hypertrophy as Evidence Reviews", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Systematic review of resistance training and muscle hypertrophy",
        abstract: "We meta-analyzed randomized trials of resistance training interventions",
      }),
      "Evidence Reviews"
    );
    expect(result?.category).toBe("Evidence Reviews");
  });

  it("rejects systematic reviews without lifting context", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Systematic review of yoga for anxiety",
        abstract: "We reviewed randomized trials of yoga interventions",
      }),
      "Evidence Reviews"
    );
    expect(result).toBeNull();
  });
});

describe("All category", () => {
  it("routes eligible articles to their best category", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Effects of protein timing on muscle protein synthesis after resistance training",
        abstract: "We compared protein ingestion timing following resistance exercise",
      }),
      "All"
    );
    expect(result?.category).toBe("Nutrition");
  });

  it("rejects irrelevant articles even under All", () => {
    const result = evaluateResearchArticle(
      article({
        title: "Climate change and cardiovascular health",
        abstract: "Epidemiological associations between temperature and heart disease",
      }),
      "All"
    );
    expect(result).toBeNull();
  });
});

describe("ranking", () => {
  it("ranks relevance above raw citation count", () => {
    const highlyCitedButOffTopic = article({
      id: "a",
      title: "Global burden of cardiovascular disease",
      abstract: "A review of population trends",
      citationCount: 5000,
    });

    const relevantButLessCited = article({
      id: "b",
      title: "Resistance training and muscle hypertrophy",
      abstract: "Progressive overload increased muscle protein synthesis",
      citationCount: 20,
    });

    const ranked = rankResearchArticles(
      [highlyCitedButOffTopic, relevantButLessCited],
      "All",
      undefined,
      { limit: 20 }
    );

    expect(ranked.length).toBe(1);
    expect(ranked[0].id).toBe("b");
  });

  it("prefers recent and cited papers when relevance is tied", () => {
    const older = article({
      id: "old",
      title: "Resistance training and muscle hypertrophy",
      abstract: "Progressive overload increased muscle protein synthesis",
      year: 2010,
      citationCount: 20,
    });

    const newer = article({
      id: "new",
      title: "Resistance training and muscle hypertrophy in trained men",
      abstract: "Progressive overload increased muscle protein synthesis",
      year: new Date().getFullYear(),
      citationCount: 20,
    });

    const ranked = rankResearchArticles([older, newer], "Hypertrophy", undefined, { limit: 20 });
    expect(ranked[0].id).toBe("new");
  });

  it("limits results to the requested count", () => {
    const inputs = Array.from({ length: 40 }, (_, i) =>
      article({
        id: `id-${i}`,
        title: "Resistance training and muscle hypertrophy",
        abstract: "Progressive overload increased muscle protein synthesis",
      })
    );
    const ranked = rankResearchArticles(inputs, "Hypertrophy", undefined, { limit: 10 });
    expect(ranked.length).toBe(10);
  });
});

describe("user search filter", () => {
  it("only returns articles matching the user search terms", () => {
    const matches = article({
      id: "m",
      title: "Creatine and resistance training",
      abstract: "Creatine supplementation improved strength",
    });
    const misses = article({
      id: "n",
      title: "Resistance training and muscle hypertrophy",
      abstract: "Progressive overload increased muscle protein synthesis",
    });

    const ranked = rankResearchArticles([matches, misses], "All", "creatine", { limit: 20 });
    expect(ranked.length).toBe(1);
    expect(ranked[0].id).toBe("m");
  });
});
