// src/app/[id]/page.tsx
"use server"
import { Suspense } from 'react';

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: Record<string, string | string[] | undefined>;
}

export default async function TranscriptionPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Suspense fallback={<div>Carregando...</div>}>
                    ...
                </Suspense>
            </div>
        </main>
    );
}