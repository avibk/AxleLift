import React, { useState } from "react";
import { ScienceArticle } from "../types";
import { CURATED_SCIENCE_FEED } from "../data";
import { BookOpen, Search, Award, AlertCircle, Quote, Eye } from "lucide-react";

export default function ScienceFeed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Hypertrophy", "Biomechanics", "Recovery", "Myths"];

  // Filter articles based on category and inquiry search
  const filteredArticles = CURATED_SCIENCE_FEED.filter((article) => {
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.myth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.evidence.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Feed Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            Biological Hypertrophy Feed
          </h2>
          <p className="text-xs text-neutral-400">
            Debunking bro-science with the latest peer-reviewed clinical research and biomechanics studies.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full self-start">
          <input
            type="text"
            placeholder="Search physiology literature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/70"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-neutral-800/60">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono tracking-tight transition-all duration-200 border ${
              activeCategory === cat
                ? "bg-violet-500/10 text-violet-400 border-violet-500/30"
                : "bg-neutral-900 text-neutral-400 border-neutral-850 hover:text-neutral-300 hover:bg-neutral-850"
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <p className="text-neutral-500 text-xs">No research articles match your search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/20 transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.01] rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-950 border border-neutral-800 text-neutral-400 uppercase">
                    {article.category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                    BY {article.author.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-md font-bold text-white tracking-tight leading-snug group-hover:text-violet-400 transition-colors">
                  {article.title}
                </h3>

                {/* Gym-Bro Myth Section */}
                <div className="bg-rose-500/5 border border-rose-500/10 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-mono font-bold uppercase">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Popular Gym Bro Myth
                  </div>
                  <p className="text-xs text-neutral-300 italic leading-relaxed">
                    "{article.myth}"
                  </p>
                </div>

                {/* Scientific Evidence */}
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 space-y-1.5">
                  <div className="text-neutral-400 text-[10px] font-mono font-bold uppercase">
                    Peer-Reviewed Molecular Evidence
                  </div>
                  <p className="text-xs text-neutral-300 tracking-wide leading-relaxed">
                    {article.evidence}
                  </p>
                </div>

                {/* Practical Takeaway */}
                <div className="bg-violet-500/5 p-3.5 border border-violet-500/10 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-violet-400 text-[10px] font-mono font-bold uppercase">
                    <Award className="w-3.5 h-3.5" />
                    Direct Gym Takeaway
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans font-medium">
                    {article.takeaway}
                  </p>
                </div>
              </div>

              {/* Card Footer citations & coach button */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-[9px] text-neutral-500 font-serif leading-normal max-w-xs flex gap-1.5 py-0.5">
                  <Quote className="w-3 h-3 text-neutral-600 flex-shrink-0" />
                  <span>{article.citation}</span>
                </div>

                <span className="px-3 py-1.5 text-[11px] font-mono font-bold text-neutral-400 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-1.5 self-end sm:self-auto">
                  <Eye className="w-3.5 h-3.5" /> {article.readCount.toLocaleString()} reads
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
