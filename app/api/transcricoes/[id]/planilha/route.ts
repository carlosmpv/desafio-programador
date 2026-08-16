import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/transcricoes/[id]/planilha'>) {
//   const { id } = await ctx.params
  return Response.json({ "hello": "world" })
}