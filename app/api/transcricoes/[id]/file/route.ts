import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import fs from 'fs/promises';

import { createReadStream } from 'fs';
import { Readable } from 'stream';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/transcricoes/[id]'>) {
    try {
        const { id } = await ctx.params;
        const { filepath } = await prisma.pDFFile.findUniqueOrThrow({
            where: { id: id }
        });

        // Verifica se o arquivo existe
        await fs.access(filepath);
        
        // Cria um stream
        const fileStream = createReadStream(filepath);
        const readableStream = Readable.toWeb(fileStream) as ReadableStream;
        
        return new Response(readableStream, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Cache-Control': 'public, max-age=3600',
            }
        });
        
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Arquivo não encontrado' }),
            { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}