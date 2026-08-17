import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/transcricoes/[id]/planilha'>) {
  // Deve um parâmetro "?formato=xlsx|csv|json" e retornar de acordo
  return Response.json({ "hello": "world" })
}