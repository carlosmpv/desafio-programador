import sqlite3 from 'sqlite3'
import { open, Database } from "sqlite";
import { NextRequest } from "next/server";
import { randomUUID, UUID } from 'crypto';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const sentFile = formData.get("arquivo");
    const type = formData.get("tipo");

    if (!(sentFile instanceof File)) {
        return Response.json({ error: "Arquivo não enviado" }, { status: 422 });
    }

    const file = sentFile as File;
    const processingID = randomUUID()
    // SQLite: cria o id do processo com status pendente e nenhum resultado
    void backgroundProcess(file, processingID);

    return Response.json({ "id": processingID }, { status: 202 })
}

async function backgroundProcess(file: File, id: UUID) {
    // SQLite: ao finalizar, atualiza o status e resultado ou erro do processo
}