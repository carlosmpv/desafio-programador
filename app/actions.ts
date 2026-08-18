'use server'

import { Transcription } from "@/generated/prisma/browser";

export type UploadPDFRequest = {
    arquivo: File,
    tipo: "cartao-ponto" | "holerite"
};

export async function uploadPDF({ arquivo, tipo }: UploadPDFRequest): Promise<string> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("tipo", tipo);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transcricoes`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
    }

    const { id } = await response.json();
    return id;
}

export async function getTranscription(id: string): Promise<Transcription | null> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transcricoes/${id}`);

    switch (response.status) {
        case 200:
            return await response.json() as Transcription
        case 202:
            return null
        default:
            const { error } = await response.json();
            throw new Error(error)
    }
}

export async function getPDF(id: string): Promise<Uint8Array<ArrayBufferLike>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transcricoes/${id}/file`, {
        headers: {
            'Content-Type': 'application/pdf',
        },
    });

    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}