import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Client, handle_file } from "https://esm.sh/@gradio/client@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE") ||
  "";
const HF_TOKEN = Deno.env.get("HF_TOKEN") || "";
const HF_SPACE_ID =
  Deno.env.get("HF_SPACE_ID") || "Maharsh8805/CivicConnect-Classifier";
const SPACE_ATTEMPTS = Number(Deno.env.get("HF_SPACE_ATTEMPTS") || 3);
const SPACE_RETRY_DELAY_MS = Number(
  Deno.env.get("HF_SPACE_RETRY_DELAY_MS") || 1500,
);
const CIVIC_CLASSES = new Set([
  "construction_waste",
  "damaged_sidewalk",
  "damaged_sign",
  "dead_animal",
  "flooding_waterlogging",
  "garbage_overflow_west_container",
  "good_road",
  "illegal_construction",
  "illegal_parking",
  "open_manhole",
  "pothole_road_crack",
  "powerline_damage",
  "streetlight_damage",
  "traffic_light",
]);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function normalizePredictions(result: any): any[] {
  const data = result?.data ?? result;
  const candidates = Array.isArray(data)
    ? data[0]?.confidences ?? data[0] ?? data
    : data?.confidences ?? data?.predictions ?? data?.results ?? [];
  if (!Array.isArray(candidates)) {
    throw new Error("Classifier returned an unsupported prediction shape");
  }

  const predictions = candidates
    .map((item: any) => ({
      category: item?.label ?? item?.category ?? item?.class,
      confidence: Number(item?.confidence ?? item?.score),
    }))
    .filter(
      (item: any) =>
        typeof item.category === "string" &&
        CIVIC_CLASSES.has(item.category) &&
        Number.isFinite(item.confidence) &&
        item.confidence >= 0,
    )
    .slice(0, 3);

  if (candidates.length > 0 && predictions.length === 0) {
    throw new Error("Classifier returned no valid civic classes");
  }
  return predictions;
}

async function withSpaceRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= SPACE_ATTEMPTS; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < SPACE_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, SPACE_RETRY_DELAY_MS * attempt)
        );
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Classifier Space request failed");
}

serve(async (req) => {
  try {
    const { job_id } = await req.json();
    if (!job_id) {
      return new Response(JSON.stringify({ error: "Missing job_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: job, error: jobErr } = await supabase
      .from("processing_jobs")
      .select("*")
      .eq("id", job_id)
      .single();
    if (jobErr || !job) {
      console.error("[EDGE FUNCTION] Job not found:", jobErr);
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404,
      });
    }
    if (job.status !== "pending" && job.status !== "failed") {
      return new Response(JSON.stringify({ message: "Already processed" }), {
        status: 200,
      });
    }

    await supabase
      .from("processing_jobs")
      .update({ status: "processing", attempts: job.attempts + 1 })
      .eq("id", job_id);

    if (!HF_TOKEN) throw new Error("HF_TOKEN is required for the private classifier Space");
    const gradioClient = await Client.connect(HF_SPACE_ID, {
      token: HF_TOKEN,
    } as any);

    let imageTop3: any[] = [];
    if (job.image_get_url) {
      try {
        imageTop3 = await withSpaceRetry(async () => {
          const response = await fetch(job.image_get_url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: HTTP ${response.status}`);
          }
          const file = new File(
            [await response.blob()],
            "report_image.jpg",
            { type: "image/jpeg" },
          );
          return normalizePredictions(
            await gradioClient.predict("/classify", {
              image: handle_file(file),
            }),
          );
        });
      } catch (error: any) {
        console.error("[EDGE FUNCTION] Image classification failed:", error.message);
      }
    }

    let audioText = "";
    if (job.audio_get_url) {
      try {
        audioText = await withSpaceRetry(async () => {
          const response = await fetch(job.audio_get_url);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: HTTP ${response.status}`);
          }
          const file = new File(
            [await response.blob()],
            "audio.mp3",
            { type: "audio/mpeg" },
          );
          const result: any = await gradioClient.predict("/transcribe", {
            audio: handle_file(file),
            language: "auto",
          });
          const transcript = result?.data?.[0] ?? result?.[0] ?? result;
          if (typeof transcript !== "string") {
            throw new Error("Classifier returned an invalid transcript");
          }
          return transcript.trim();
        });
      } catch (error: any) {
        console.error("[EDGE FUNCTION] Audio transcription failed:", error.message);
      }
    }

    let textTop3: any[] = [];
    if (job.description?.trim()) {
      try {
        textTop3 = await withSpaceRetry(() =>
          gradioClient
            .predict("/classify_text", {
              text: job.description.slice(0, 2000),
            })
            .then(normalizePredictions)
        );
      } catch (error: any) {
        console.error("[EDGE FUNCTION] Text classification failed:", error.message);
      }
    }

    let audioTop3: any[] = [];
    if (audioText) {
      try {
        audioTop3 = await withSpaceRetry(() =>
          gradioClient
            .predict("/classify_text", { text: audioText.slice(0, 2000) })
            .then(normalizePredictions)
        );
      } catch (error: any) {
        console.error(
          "[EDGE FUNCTION] Transcript classification failed:",
          error.message,
        );
      }
    }

    const fusionResult = calculateAdvancedFusion(imageTop3, audioTop3, textTop3);
    const aiResultJson = {
      finalCategory: fusionResult.finalCategory,
      fusionScore: fusionResult.fusionScore,
      needsHumanReview: fusionResult.needsHumanReview,
      imageTop3,
      audioTop3,
      textTop3,
      audioText,
    };

    const { data: rpcRes, error: rpcErr } = await supabase.rpc(
      "process_issue_ai_results",
      { p_job_id: job_id, p_ai_result: aiResultJson },
    );
    if (rpcErr) throw new Error(`RPC failed: ${rpcErr.message}`);

    return new Response(JSON.stringify({ success: true, db_response: rpcRes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[EDGE FUNCTION ERROR]:", error.message);
    try {
      const body = await req.clone().json();
      if (body.job_id) {
        await supabase
          .from("processing_jobs")
          .update({ status: "failed", error: error.message })
          .eq("id", body.job_id);
      }
    } catch (dbError) {
      console.error("[EDGE FUNCTION] Failed to update error status:", dbError);
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function calculateAdvancedFusion(
  imageTop3: any[],
  audioTop3: any[],
  textTop3: any[],
): any {
  const weights = { IMAGE: 0.5, AUDIO: 0.3, TEXT: 0.2 };
  const scoreMap: Record<string, number> = {};
  let totalWeightUsed = 0;
  const process = (predictions: any[], weight: number) => {
    if (!Array.isArray(predictions) || predictions.length === 0) return;
    totalWeightUsed += weight;
    predictions.forEach((prediction) => {
      const category = prediction.category || prediction.class || prediction.label;
      if (!category) return;
      scoreMap[category] =
        (scoreMap[category] || 0) + (prediction.confidence || prediction.score || 0) * weight;
    });
  };
  process(imageTop3, weights.IMAGE);
  process(audioTop3, weights.AUDIO);
  process(textTop3, weights.TEXT);

  const sorted = Object.entries(scoreMap)
    .map(([category, score]) => ({
      category,
      score,
      normalizedScore: totalWeightUsed ? score / totalWeightUsed : 0,
    }))
    .sort((a, b) => b.score - a.score);
  const winner = sorted[0] || { category: "Other", score: 0, normalizedScore: 0 };
  const runnerUp = sorted[1] || { category: "Other", score: 0, normalizedScore: 0 };
  const marginOfVictory = winner.normalizedScore - runnerUp.normalizedScore;
  return {
    finalCategory: winner.category,
    fusionScore: winner.normalizedScore,
    marginOfVictory,
    needsHumanReview: marginOfVictory < 0.15 && winner.normalizedScore < 0.7,
  };
}
