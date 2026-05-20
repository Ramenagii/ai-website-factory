import { NextResponse } from "next/server";
import { runFactory } from "@/lib/pipeline";

const trendQueue = [
  {
    url: "https://linear.app",
    industry: "B2B SaaS",
    targetAudience: "product teams",
    style: "minimal and operational"
  },
  {
    url: "https://vercel.com",
    industry: "developer tools",
    targetAudience: "engineering leaders",
    style: "technical and premium"
  }
];

export async function GET() {
  const seed = trendQueue[new Date().getUTCDate() % trendQueue.length];
  const result = await runFactory(seed);

  return NextResponse.json({
    ranAt: new Date().toISOString(),
    mode: "daily_mvp",
    nextStep: "Persist this payload to Supabase, commit generated files, then trigger Vercel deployment.",
    result
  });
}
