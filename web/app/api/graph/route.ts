import { NextResponse } from "next/server";
import { buildDomainGraph } from "../../../lib/graph";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const graph = await buildDomainGraph();
    return NextResponse.json(graph);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
