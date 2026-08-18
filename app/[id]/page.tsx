"use server"

import { getTranscription } from "@/app/actions";
import PdfViewer from "@/components/PdfViewer";
import Link from "next/link";

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: Record<string, string | string[] | undefined>;
}

type FieldRow = {
    code?: string;
    label?: string;
    reference?: string;
    value?: string;
};

type BaseRow = {
    label?: string;
    value?: string;
};

type PageEntry = {
    page?: number;
    year?: string;
    month?: string;
    fields?: FieldRow[];
    bases?: BaseRow[];
};

export default async function TranscriptionPage({ params }: PageProps) {
    const { id } = await params;

    let transcription = null as Awaited<ReturnType<typeof getTranscription>> | null;
    let errorMessage: string | null = null;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            transcription = await getTranscription(id);
            if (transcription) {
                break;
            }
        } catch (error) {
            errorMessage =
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar a transcrição.";
            break;
        }

        if (!transcription) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    }

    if (errorMessage) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-700">
                <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
                    <div className="mb-4 text-5xl" aria-hidden="true">
                        ⚠️
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Não foi possível carregar</h1>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-red-700">{errorMessage}</p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Voltar para a página inicial
                    </Link>
                </div>
            </main>
        );
    }

    if (!transcription) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-700">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                    <h1 className="text-2xl font-bold text-slate-900">Carregando transcrição</h1>
                    <p className="mt-3 text-sm text-slate-500">
                        Estamos aguardando o processamento concluir. Em alguns segundos, a página será atualizada.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Voltar para a página inicial
                    </Link>
                </div>
            </main>
        );
    }

    const pages = Array.isArray((transcription as any)?.value?.pages)
        ? ((transcription as any).value.pages as PageEntry[])
        : [];

    const pdfPages = new Set(pages.map(p => p.page || 0));

    return (
        <main className="min-h-screen bg-slate-100 text-slate-700">
            <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
                <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                            Transcrição
                        </p>
                        <h1 className="mt-1 text-2xl font-bold text-slate-900">
                            {pages.length > 1 ? `${pages.length} páginas` : "1 página"}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Processado
                        </span>
                        <Link
                            href="/"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Página inicial
                        </Link>
                        <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                            Download
                        </button>
                    </div>
                </header>

                <div className="lg:grid lg:grid-cols-[520px_minmax(0,1fr)] lg:gap-6">
                    <aside className="lg:sticky lg:top-6 lg:self-start">
                        <div className="max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                            <div className="space-y-4">
                                {[...pdfPages].map((page, pageIndex) => (
                                    <div
                                        key={`pdf-${page ?? pageIndex}-${pageIndex}`}
                                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
                                    >
                                        <div className="mb-2 flex items-center justify-between">
                                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                                                Página {page ?? pageIndex + 1}
                                            </p>
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                PDF
                                            </span>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                                            <PdfViewer transcriptionId={id} page={Number(page ?? pageIndex)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="mt-6 lg:mt-0 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto lg:pr-2">
                        <div className="space-y-8">
                            {pages.map((pageData, pageIndex) => {
                                const fields = Array.isArray(pageData.fields) ? pageData.fields : [];
                                const bases = Array.isArray(pageData.bases) ? pageData.bases : [];

                                return (
                                    <section key={`table-${pageData.page ?? pageIndex}-${pageIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="mb-4 flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                                                    Página {pageData.page ?? pageIndex + 1}
                                                </p>
                                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                                    {pageData.month ?? "--"} / {pageData.year ?? "----"}
                                                </h2>
                                            </div>

                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                Planilhas
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-slate-900">Planilha de verbas</h3>
                                                    <span className="text-xs font-medium text-slate-500">{fields.length} registros</span>
                                                </div>

                                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                                    <table className="min-w-full border-collapse text-left text-sm">
                                                        <thead className="bg-slate-900 text-white">
                                                            <tr>
                                                                <th className="px-3 py-2 font-semibold">Código</th>
                                                                <th className="px-3 py-2 font-semibold">Descrição</th>
                                                                <th className="px-3 py-2 font-semibold">Ref.</th>
                                                                <th className="px-3 py-2 font-semibold">Valor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fields.length > 0 ? (
                                                                fields.map((field, index) => (
                                                                    <tr
                                                                        key={`${field.label ?? "campo"}-${index}`}
                                                                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                                                    >
                                                                        <td className="border-t border-slate-200 px-3 py-2 text-slate-600">
                                                                            {field.code ?? "-"}
                                                                        </td>
                                                                        <td className="border-t border-slate-200 px-3 py-2 text-slate-700">
                                                                            {field.label ?? "-"}
                                                                        </td>
                                                                        <td className="border-t border-slate-200 px-3 py-2 text-slate-600">
                                                                            {field.reference ?? ""}
                                                                        </td>
                                                                        <td className="border-t border-slate-200 px-3 py-2 font-medium text-slate-800">
                                                                            {field.value ?? "-"}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500">
                                                                        Nenhuma verba nesta página.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <h3 className="text-lg font-semibold text-slate-900">Planilha de bases</h3>
                                                    <span className="text-xs font-medium text-slate-500">{bases.length} registros</span>
                                                </div>

                                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                                    <table className="min-w-full border-collapse text-left text-sm">
                                                        <thead className="bg-slate-900 text-white">
                                                            <tr>
                                                                <th className="px-3 py-2 font-semibold">Base</th>
                                                                <th className="px-3 py-2 font-semibold">Valor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {bases.length > 0 ? (
                                                                bases.map((base, index) => (
                                                                    <tr
                                                                        key={`${base.label ?? "base"}-${index}`}
                                                                        className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                                                                    >
                                                                        <td className="border-t border-slate-200 px-3 py-2 text-slate-700">
                                                                            {base.label ?? "-"}
                                                                        </td>
                                                                        <td className="border-t border-slate-200 px-3 py-2 font-medium text-slate-800">
                                                                            {base.value ?? "-"}
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ) : (
                                                                <tr>
                                                                    <td colSpan={2} className="px-3 py-8 text-center text-sm text-slate-500">
                                                                        Nenhuma base nesta página.
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
