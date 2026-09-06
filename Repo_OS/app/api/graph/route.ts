import { NextRequest, NextResponse } from "next/server";
import { buildDomainGraph, buildComponentsGraph } from "../../../lib/graph";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");
  try {
    const graph = scope === "ui" ? await buildComponentsGraph() : await buildDomainGraph();
    return NextResponse.json(graph);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
