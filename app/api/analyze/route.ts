import { NextResponse } from "next/server";
import { runFactory } from "@/lib/pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runFactory(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to analyze website"
      },
      { status: 400 }
    );
  }
}
