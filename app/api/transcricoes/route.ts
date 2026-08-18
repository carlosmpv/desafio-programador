export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma } from '@/lib/prisma';
import { TranscriptionType } from '@/generated/prisma/enums';
import { Transcription } from '@/generated/prisma/client';
import { PayrollParser } from "@/parsers/payroll-parser";
import { WasmPdfDocument } from "pdf-oxide-wasm";
import fs from 'fs/promises';
import path from "path";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const sentFile = formData.get("arquivo");
    const sentType = formData.get("tipo") as string;

    if (!(sentFile instanceof File)) {
        return Response.json({ error: "Arquivo não enviado" }, { status: 422 });
    }

    let type: TranscriptionType
    switch (sentType) {
        case "cartao-ponto":
            type = "TimeCard"
            break;
        case "holerite":
            type = "Payroll"
            break;
        default:
            return Response.json({ error: "Tipo de arquivo inválido" }, { status: 422 });
    }


    const transcription = await prisma.transcription.create({
        data: {
            tipo: type,
            status: 'processando'
        }
    })

    const file = sentFile as File;
    const fileArrayBuffer = await file.arrayBuffer();
    const fileUint8Array = new Uint8Array(fileArrayBuffer)
    void backgroundProcess(fileUint8Array, transcription);

    return Response.json({ "id": transcription.id }, { status: 202 })
}

async function backgroundProcess(fileData: Uint8Array<ArrayBufferLike>, transcription: Transcription) {
    const filePath = await saveFileData(fileData, transcription.id);
    await prisma.pDFFile.create({
        data: {
            filepath: filePath,
            id: transcription.id,
        }
    })

    const doc = new WasmPdfDocument(fileData)

    switch (transcription.tipo) {
        case "Payroll":
            const parser = new PayrollParser(doc)

            try {
                const result = parser.parse()

                await prisma.transcription.update({
                    where: { id: transcription.id },
                    data: {
                        status: "concluido",
                        value: result
                    }
                });
            } catch (error) {
                const errorMessage = (error instanceof Error)
                    ? error.message
                    : `Unexpected error ${error}`;

                await prisma.transcription.update({
                    where: { id: transcription.id },
                    data: {
                        status: "erro",
                        erro: errorMessage
                    }
                })
            }
            break
        case "TimeCard":
            break

        default:
            await prisma.transcription.update({
                where: { id: transcription.id },
                data: {
                    status: "erro",
                    erro: `Trying to process transcription with invalid type ${transcription.tipo}`
                },
            })
    }
}

async function saveFileData(fileData: Uint8Array, transcriptionId: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'tmp', 'transcriptions');
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${transcriptionId}.pdf`);
    await fs.writeFile(filePath, fileData);
    return filePath;
}
