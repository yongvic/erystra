import { AnalyticsByProvider, AnalyticsTotals } from "@/types/analytics";
import { PremiumReportAnalysis, ReportSummaryData } from "@/types/report";

type GeminiReportInput = {
  periodStart: string;
  periodEnd: string;
  summary: ReportSummaryData;
  analytics?: {
    totals?: AnalyticsTotals;
    byProvider?: AnalyticsByProvider[];
  };
};

export async function generateGeminiReportAnalysis(input: GeminiReportInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return buildFallbackAnalysis(input);
  }

  const prompt = [
    "Tu es un directeur conseil en social media intelligence pour Erystra Group.",
    "Tu dois produire un rapport premium pour direction generale.",
    "Retourne uniquement un JSON valide, sans markdown, sans texte avant ou apres.",
    "Schema JSON attendu:",
    '{"mode":"premium","overallScore":0,"executiveSummary":"","boardSummary":"","keyWins":[""],"watchouts":[""],"channelRecommendations":[{"provider":"FACEBOOK","score":0,"status":"fort","recommendation":""}],"nextActions":[""],"rawText":""}',
    "Regles:",
    "- overallScore et score channel entre 0 et 100.",
    "- status doit etre fort, stable ou fragile.",
    "- executiveSummary: 2 phrases max.",
    "- boardSummary: resume dirigeant orientee decision.",
    "- keyWins: 3 points max.",
    "- watchouts: 3 points max.",
    "- nextActions: 3 actions prioritaires max.",
    "- rawText: synthese premium fluide en francais, avec mini structure lisible.",
    "Base-toi uniquement sur les donnees ci-dessous.",
    JSON.stringify(input, null, 2)
  ].join("\n\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9,
          maxOutputTokens: 1000,
          responseMimeType: "application/json"
        }
      })
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || "")
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Gemini returned no analysis text.");
  }

  return normalizePremiumAnalysis(JSON.parse(text));
}

function normalizePremiumAnalysis(value: unknown): PremiumReportAnalysis {
  if (!value || typeof value !== "object") {
    throw new Error("Gemini returned invalid JSON.");
  }

  const data = value as Record<string, unknown>;
  const channelRecommendations = Array.isArray(data.channelRecommendations)
    ? data.channelRecommendations.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          provider: String(row.provider || "UNKNOWN"),
          score: normalizeScore(row.score),
          status: normalizeStatus(row.status),
          recommendation: String(row.recommendation || "Aucune recommandation fournie.")
        };
      })
    : [];

  return {
    mode: "premium",
    overallScore: normalizeScore(data.overallScore),
    executiveSummary: String(data.executiveSummary || "Synthese executive indisponible."),
    boardSummary: String(data.boardSummary || "Resume dirigeant indisponible."),
    keyWins: normalizeStringArray(data.keyWins),
    watchouts: normalizeStringArray(data.watchouts),
    channelRecommendations,
    nextActions: normalizeStringArray(data.nextActions),
    rawText: String(data.rawText || "Analyse premium indisponible.")
  };
}

function normalizeScore(value: unknown) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 50;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function normalizeStatus(value: unknown): "fort" | "stable" | "fragile" {
  if (value === "fort" || value === "stable" || value === "fragile") {
    return value;
  }
  return "stable";
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item)).filter(Boolean).slice(0, 5)
    : [];
}

function buildFallbackAnalysis(input: GeminiReportInput): PremiumReportAnalysis {
  const channels = Object.entries(input.summary.byProvider);
  const total = Math.max(input.summary.totalPosts, 1);
  const overallScore = Math.max(35, Math.min(88, Math.round((input.summary.published / total) * 70 + channels.length * 6)));

  return {
    mode: "premium",
    overallScore,
    executiveSummary: `${input.summary.totalPosts} posts sur la periode, dont ${input.summary.published} publies et ${input.summary.scheduled} planifies. La dynamique reste ${overallScore >= 70 ? "solide" : overallScore >= 50 ? "correcte" : "a renforcer"}.`,
    boardSummary: "Le dispositif editorial est exploitable, mais il doit etre pilote avec davantage de discipline sur les canaux qui concentrent l'effort pour maximiser l'impact business.",
    keyWins: [
      "Visibilite consolidee sur les canaux actifs.",
      "Base de production editorialement structuree.",
      "Capacite de planification deja en place."
    ],
    watchouts: [
      "Risque de dispersion si trop de canaux sont alimentes sans priorisation.",
      "Les KPIs de performance doivent etre revus chaque semaine.",
      "Les canaux faibles doivent etre rationalises ou repositionnes."
    ],
    channelRecommendations: channels.map(([provider, count]) => ({
      provider,
      score: Math.max(40, Math.min(90, Math.round((count / total) * 100))),
      status: count / total > 0.45 ? "fort" : count / total > 0.2 ? "stable" : "fragile",
      recommendation:
        count / total > 0.45
          ? "Capitaliser sur ce canal avec des formats repetables et un suivi strict des resultats."
          : count / total > 0.2
            ? "Stabiliser la ligne editoriale et tester 1 a 2 variantes de contenu." 
            : "Revoir le positionnement, la frequence ou l'interet reel de ce canal dans le mix." 
    })),
    nextActions: [
      "Arbitrer les canaux prioritaires pour les 30 prochains jours.",
      "Standardiser les formats qui performent le mieux.",
      "Mettre en place une revue hebdomadaire de reach, engagement et conversion marketing."
    ],
    rawText: [
      `Score global: ${overallScore}/100.`,
      `Resume dirigeant: ${input.summary.totalPosts} contenus ont ete produits sur la periode, avec un niveau de publication effectivement diffuse de ${input.summary.published}.`,
      "Le dispositif est viable, mais il doit etre resserre autour des canaux qui apportent le plus de traction afin d'ameliorer la performance globale.",
      "Priorite immediate: renforcer la discipline de pilotage et la selection des formats par canal."
    ].join("\n\n")
  };
}
