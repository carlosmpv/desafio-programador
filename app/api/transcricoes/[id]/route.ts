import { Transcription } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/transcricoes/[id]'>) {
  const { id } = await ctx.params;
  try {
    const transcription = await prisma.transcription.findUniqueOrThrow({
      where: { id: id }
    });

    const status = {
      "processando": 202,
      "erro": 400,
      "concluido": 200,
    }[transcription.status];

    return Response.json(transcription, { status })
  } catch {
    return Response.json({
      erro: "Transcrição não encontrada",
      status: "erro",
    }, {
      status: 404,
    })
  }
}

export async function PUT(_req: NextRequest, ctx: RouteContext<'/api/transcricoes/[id]'>) {
  // Aqui tem que ser as correções nos valores do resultado
  // mas também vou utilizar a rota para redefinir as configurações do parser
  
  // Caso seja { value: { ... } }, substituir o valor do resultado
  // Caso seja { config: { ... }}, altera as opções e refaz o processamento
}
