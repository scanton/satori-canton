import { loadStoryIndex } from "@/lib/content";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stories = await loadStoryIndex();
    return Response.json(stories);
  } catch {
    return Response.json([], { status: 200 });
  }
}
