import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { ChatMessage, WorkoutSession, EloProfile, MuscleStatus } from "../types";
import { getMuscleVolumeStats } from "../utils";
import { Brain, Send, Flame, Sparkles, User, ShieldAlert, Cpu, Check } from "lucide-react";

interface AICoachProps {
  sessions: WorkoutSession[];
  userElo: EloProfile;
  initialQuestion: string;
  onClearInitialQuestion: () => void;
}

const COACH_LOADER_STEPS = [
  "Analyzing sarcomere mechanical tension rates...",
  "Auditing logged sets and volume balance quotients...",
  "Recalculating effective reps under the Chris Beardsley model...",
  "Running deload diagnostics for systemic neurological fatigue...",
  "Formulating hypertrophy periodization structures...",
  "Grounded look: cross-referencing Brad Schoenfeld review papers..."
];

export default function AICoach({ sessions, userElo, initialQuestion, onClearInitialQuestion }: AICoachProps) {
  const muscleStats = getMuscleVolumeStats(sessions);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Greetings! I am your AI Biomechanics & Hypertrophy Coach, here to analyze your lifting OS metrics. I have full real-time access to your logged workouts, estimated 1RMs, and target muscle volume states.\n\nWhether you need an workout plan audit, suggestions on chest stagnation, or clarification on stretch-mediated hypertrophy, ask away!",
      timestamp: Date.now() - 60000
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaderTextIdx, setLoaderTextIdx] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested pre-seeded prompts
  const suggestions = [
    "Why isn't my chest growing?",
    "Am I doing too much junk volume?",
    "Explain stretch-mediated hypertrophy.",
    "Do I need to train to failure every set?"
  ];

  // If there's an initial question passed from another tab (like the Science Feed), trigger it immediately
  useEffect(() => {
    if (initialQuestion) {
      handleSend(`Can you break down the science in the article: "${initialQuestion}" and how I can apply it to my training?`);
      onClearInitialQuestion();
    }
  }, [initialQuestion]);

  // Loader texts cyclic update
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoaderTextIdx((prev) => (prev + 1) % COACH_LOADER_STEPS.length);
      }, 2500);
    } else {
      setLoaderTextIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          workoutHistory: sessions,
          muscleStats: muscleStats,
          userElo: userElo
        })
      });

      const data = await response.json();

      if (data.error && data.error === "AI Config Offline") {
        const errorMsg: ChatMessage = {
          role: "model",
          text: `⚠️ **API Key Configuration Needed** \n\n${data.message}`,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else if (!response.ok) {
        throw new Error(data.message || "Failed to contact coach API");
      } else {
        const modelMsg: ChatMessage = {
          role: "model",
          text: data.response,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, modelMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: "model",
        text: `Error communicating with AI coach: ${err.message || "Unknown error"}. Try verifying your network status or double checking the environment variable secrets setup!`,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[600px] items-stretch animate-fade-in">
      {/* Side Active Profile HUD */}
      <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-bold tracking-wider font-mono text-neutral-300 uppercase mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            Active Athlete HUD
          </h3>

          <div className="space-y-4">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-[9px] text-neutral-500 font-mono block uppercase">Coach Rank context</span>
              <span className="text-sm font-bold text-white">{userElo.rank}</span>
            </div>
            
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-[9px] text-neutral-500 font-mono block uppercase">Lifetime ELO rating</span>
              <span className="text-sm font-mono text-violet-400 font-bold">{userElo.lifetimeElo}</span>
            </div>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
              <span className="text-[9px] text-neutral-500 font-mono block uppercase">Logged Sessions Completed</span>
              <span className="text-sm font-bold text-white font-mono">{sessions.length} sessions</span>
            </div>
          </div>
        </div>

        {/* Coach Bio info banner */}
        <div className="bg-violet-500/5 p-4 rounded-xl border border-violet-500/10 text-xs text-neutral-400 leading-relaxed space-y-2">
          <div className="flex gap-1.5 items-center text-violet-400 font-bold font-mono text-[10px] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Science Calibrations
          </div>
          <p>
            Your AI coach has full bio-context. Responses are dynamically personalized with considerations towards your weekly mechanical volume and progression speeds.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Header bar */}
        <div className="bg-neutral-950 border-b border-neutral-850 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Interactive Physiology Coach</h3>
              <p className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-mono mt-0.5 inline-block">
                SYSTEM: GENAI G3.5-FLASH ACTIVE
              </p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "model" && (
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed font-sans ${
                m.role === "user"
                  ? "bg-violet-600 text-neutral-900 font-medium"
                  : "bg-neutral-950 border border-neutral-850 text-neutral-200"
              }`}>
                {m.role === "model" ? (
                  <div className="markdown-body space-y-2 prose prose-invert font-sans max-w-full">
                    <Markdown>{m.text}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.text}</p>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-neutral-900 flex-shrink-0 font-bold text-xs font-mono">
                  U
                </div>
              )}
            </div>
          ))}

          {/* Loader dynamic steps */}
          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 animate-pulse">
                <Brain className="w-4 h-4" />
              </div>
              <div className="bg-neutral-950 border border-violet-500/20 text-neutral-300 rounded-2xl p-4 text-xs font-mono max-w-md flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span className="text-violet-400 animate-pulse">{COACH_LOADER_STEPS[loaderTextIdx]}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && !loading && (
          <div className="px-6 py-2 bg-neutral-950 border-t border-neutral-850 flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Quick audits:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="px-2.5 py-1 text-[10px] font-sans text-neutral-300 border border-neutral-800 rounded-full hover:border-violet-500/50 hover:bg-violet-500/5 transition-all text-left cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="bg-neutral-950 px-6 py-4 border-t border-neutral-850">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a biomechanics or volume distribution question..."
              disabled={loading}
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                inputVal.trim() && !loading
                  ? "bg-violet-600 text-neutral-900 hover:bg-violet-500 cursor-pointer"
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
