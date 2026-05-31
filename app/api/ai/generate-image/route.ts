import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt manquant" }, { status: 400 });
    }

    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
      return NextResponse.json(
        { error: "Clé HF_TOKEN manquante dans .env.local" },
        { status: 500 }
      );
    }

    // AbortController compatible avec toutes versions Node.js
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    // Seed aléatoire à chaque appel → image différente pour la même description
    const seed = Math.floor(Math.random() * 2_147_483_647);

    let response: Response;
    try {
      response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
            // Empêche HuggingFace de renvoyer un résultat mis en cache
            "x-use-cache": "false",
          },
          body: JSON.stringify({ inputs: prompt, parameters: { seed } }),
          signal: controller.signal,
        }
      );
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json({ error: "Timeout — réessayez" }, { status: 504 });
      }
      return NextResponse.json(
        { error: `Connexion impossible à HuggingFace: ${fetchErr.message}` },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (response.status === 503) {
      return NextResponse.json(
        { error: "Modèle en cours de chargement — réessayez dans 20 secondes" },
        { status: 503 }
      );
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: `HuggingFace erreur ${response.status}: ${text.slice(0, 150)}` },
        { status: response.status }
      );
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return NextResponse.json({ url: `data:${contentType};base64,${base64}` });

  } catch (err: any) {
    console.error("AI Image Error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur inattendue" },
      { status: 500 }
    );
  }
}
