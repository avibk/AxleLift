import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Lazy-loaded Gemini API Setup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it to your Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Science-Based Lifting OS API is online" });
});

/**
 * AI Coach & Workout Review Endpoint
 * Evaluates training logs, volume targets, and client progression.
 */
app.post("/api/ai-coach", async (req, res): Promise<any> => {
  try {
    const { message, workoutHistory, muscleStats, userElo } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message query is required" });
    }

    let client: GoogleGenAI;
    try {
      client = getGeminiClient();
    } catch (err: any) {
      console.warn("Gemini Client Init Failed:", err.message);
      return res.status(500).json({
        error: "AI Config Offline",
        message: "Your Gemini API Key is missing. Please configure 'GEMINI_API_KEY' in the Secrets tab in the bottom-left sidebar of Google AI Studio to unlock full AI Coaching capabilities."
      });
    }

    // Prepare structured context about the user's lift metrics and volume distributions
    const formattedHistory = (workoutHistory || [])
      .slice(0, 3)
      .map((w: any) => {
        const dateStr = new Date(w.timestamp).toLocaleDateString();
        const exercisesStr = (w.exercises || [])
          .map((ex: any) => {
            const setRuns = (ex.sets || []).map((s: any) => `${s.weight}kg x ${s.reps} (RIR: ${s.rir})`).join(", ");
            return `  - Exercise ID: ${ex.exerciseId}: ${setRuns}`;
          })
          .join("\n");
        return `[Workout on ${dateStr} - Duration: ${w.durationMinutes}m]\n${exercisesStr}`;
      })
      .join("\n\n");

    const formattedStats = (muscleStats || [])
      .map((s: any) => `${s.muscle}: ${s.effectiveSets} completed sets (Target: ${s.targetRange?.min}-${s.targetRange?.max}, Rank: ${s.status})`)
      .join("\n");

    const systemPrompt = `You are the ultimate Science-Based Lifting & Hypertrophy Coach, blending the analytical evidence-based approach of Jeff Nippard, the mechanical efficiency theories of Keenan Malloy, and the high-intensity intensity principles of Mike Mentzer and Dorian Yates.

Core Coaching Philosophy:
1. Target Mechanical Tension: Growth is driven by tension, which requires recruiting high-threshold motor units. This happens mostly in the final 5 repetitions before mechanical failure (0 RIR).
2. Intensity Guardrails: Effort (0-2 RIR) is crucial. Perform fewer 'junk volume' sets and prioritize taking working sets close to failure with pristine posture.
3. Logical Progression: Use the double-progression model. Focus on tracking metric progress rather than random 'muscle confusion'.
4. Scientific Terminology: Explain biomechanics briefly and accessibly (e.g., sarcomeres, stretch-mediated hypertrophy, titin tension, pronation/supination). Keep explanation clear, practical, and highly encouraging.

User Context:
- Lifetime Lifting ELO Score: ${userElo?.lifetimeElo || 1400} (Rank: ${userElo?.rank || "Intermediate"})
- Weekly Target Volume Standings:
${formattedStats || "No recent volume calculated."}

- Recent Session Logs:
${formattedHistory || "No sessions logged yet."}

Answer the user's lifting questions or critique their workout. Keep formatting very clean (using headers and bullet points) and conclude with a specific 'Science Homework Action' to push their training further. Return your response in clean Markdown.`;

    const chatResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nClient message: ${message}` }] }
      ]
    });

    const responseText = chatResponse.text;
    res.json({ response: responseText });
  } catch (err: any) {
    console.error("AI Coach internal error:", err);
    res.status(500).json({ error: "Failed to generate coaching response", message: err.message });
  }
});

// Vite Middleware Integration
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Science-Based Lifting OS listening at http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
