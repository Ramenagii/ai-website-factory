import { NextResponse } from "next/server";
import { runFactory } from "@/lib/pipeline";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runFactory(body);

    return new NextResponse(JSON.stringify(result.project, null, 2), {
      headers: {
        "content-disposition": `attachment; filename="${result.project.repoName}.json"`,
        "content-type": "application/json"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to export project"
      },
      { status: 400 }
    );
  }
}
