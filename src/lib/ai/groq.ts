/**
 * DEVYATRA / TEMPLEORA — GROQ LLM INFERENCE ENGINE
 *
 * Ultra-fast, context-grounded AI companion powered by Groq LPU inference.
 * Strictly anchors responses in verified temple directory facts, timings,
 * architectural chronicles, and official devasthanam records.
 */

import type { Temple } from "@/lib/types";
import { nearbyFor } from "@/lib/registry";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Tested & verified models available on Groq
const PRIMARY_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  timeoutMs?: number;
}

export interface GroqChatResult {
  content: string;
  model: string;
  finishReason?: string;
  latencyMs: number;
}

/**
 * Execute chat completion on Groq with model failover and strict timeout protection.
 */
export async function callGroqChat(options: GroqChatOptions): Promise<GroqChatResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const candidateModels = options.model
    ? [options.model, ...PRIMARY_MODELS.filter((m) => m !== options.model)]
    : PRIMARY_MODELS;

  const timeoutMs = options.timeoutMs ?? 10000;

  for (const model of candidateModels) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 800,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        console.warn(`[Groq AI] Model ${model} returned HTTP ${resp.status}: ${errText.slice(0, 150)}`);
        continue; // Try next candidate model
      }

      const data = await resp.json();
      const message = data.choices?.[0]?.message;
      let content = message?.content ?? "";

      // In case of models returning reasoning tokens instead of direct content
      if (!content && message?.reasoning) {
        content = message.reasoning;
      }

      if (content.trim()) {
        return {
          content: content.trim(),
          model,
          finishReason: data.choices?.[0]?.finish_reason,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === "AbortError";
      console.warn(`[Groq AI] Error with model ${model} (${isAbort ? "Timeout" : "Network"}):`, err);
    }
  }

  return null;
}

/**
 * Builds grounded context from a Temple object and queries Groq with strict factual bounds.
 */
export async function askGroqTempleCompanion(
  temple: Temple,
  question: string,
  lang: string = "en"
): Promise<{ text: string; facts: { label: string; value: string; source?: string }[]; provider: "GROQ_LLM" | "FACT_ENGINE" }> {
  // 1. Compile factual temple dossier
  const timingLines = temple.timings?.slots
    ?.map((s) => `• ${s.label}: ${s.opening || "Open"} - ${s.closing || "Close"}${s.note ? ` (${s.note})` : ""}`)
    .join("\n") || "General daily darshan hours subject to daily puja routines.";

  const historyLines = temple.history
    ?.slice(0, 4)
    ?.map((h) => `• ${h.year ? `[${h.year}] ` : ""}${h.title}: ${h.body}`)
    .join("\n") || temple.description;

  const festivalLines = temple.festivals
    ?.slice(0, 5)
    ?.map((f) => `• ${f.name} (${f.dateLabel}): ${f.description || "Annual sacred festival"}`)
    .join("\n") || "Major seasonal utsavams and monthly poornima observances.";

  const nearby = nearbyFor(temple.id);
  const nearbyLines = nearby
    ?.slice(0, 4)
    ?.map((n) => `• ${n.name} (${n.distanceKm} km, ${n.kind})`)
    .join("\n") || "Town center and approach road pilgrim facilities.";

  const bookingInfo = `General Entry: ${temple.entryFee?.generalDarshan || "Free"}. Special Entry: ${temple.entryFee?.specialDarshan || "Available at counter"}. Booking Mode: ${temple.entryFee?.bookingMode || "Counter"}. Official Portal: ${temple.entryFee?.bookingUrl || "Trust Office"}.`;

  const systemPrompt = `You are Devyatra Sacred Companion, an empathetic, highly knowledgeable, and deeply reverent spiritual guide for Indian pilgrimage sanctuaries.

YOU ARE GIVING ACCURATE GUIDANCE SPECIFICALLY ABOUT:
Temple: ${temple.name} (${temple.nameLocal || ""})
Deity: ${temple.mainDeity} (Tradition: ${temple.tradition.join(", ")})
Location: ${temple.location}, ${temple.district}, State: ${temple.stateCode}, India
Coordinates: ${temple.latitude}, ${temple.longitude}
Architecture: ${temple.architecture || "Traditional Vedic Indian"}
Historical Period: ${temple.historicalPeriod || "Ancient Heritage"}

VERIFIED TEMPLE DOSSIER:
Overview: ${temple.description}

Daily Timings:
${timingLines}

Booking & Darshan Logistics:
${bookingInfo}

Key Chronicles & History:
${historyLines}

Festivals & Observances:
${festivalLines}

Nearby Points of Interest:
${nearbyLines}

STRICT GUARDRAILS & GUIDELINES:
1. Ground your answers strictly in the factual dossier above.
2. Speak with natural warmth, devotion (Namaste/Pranam), and cultural sensitivity.
3. If asked about exact ticket prices, special seva booking slots, or operational changes that are NOT explicitly listed in the dossier, HONESTLY state that they must be confirmed at the physical Devasthanam counter or through their official website (${temple.entryFee?.bookingUrl || "the temple office"}). Never hallucinate false pricing or phone numbers.
4. Keep answers concise, clear, and easy to read on mobile devices. Use bullet points where appropriate.
5. If the user asks in Hindi, Tamil, Telugu, Kannada, or any other Indic language, respond fluently in that language. Otherwise respond in English (${lang}).`;

  const groqResult = await callGroqChat({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ],
    temperature: 0.25,
    maxTokens: 600,
  });

  if (groqResult && groqResult.content) {
    return {
      text: groqResult.content,
      facts: [
        { label: "Main Deity", value: temple.mainDeity },
        { label: "Architecture", value: temple.architecture || "Vedic Classical" },
        { label: "AI Engine", value: `Groq (${groqResult.model})`, source: "Verified Sacred Atlas" },
      ],
      provider: "GROQ_LLM",
    };
  }

  // Graceful fallback to deterministic engine
  const { askCompanion } = await import("@/lib/ai/engine");
  const fallback = askCompanion(temple, question, lang);
  return {
    text: fallback.text,
    facts: fallback.facts || [],
    provider: "FACT_ENGINE",
  };
}
