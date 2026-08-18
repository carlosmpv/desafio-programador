"use client"

import { getPDF } from '@/app/actions';
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type PdfPreviewParams = {
  transcriptionId: string;
  page: number;
};

export default function PdfPreview({ transcriptionId, page }: PdfPreviewParams) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadPdf() {
      try {
        setLoading(true);
        setError(null);

        const pdfBytes = await getPDF(transcriptionId);
        const buffer = Buffer.from(pdfBytes);
        const blob = new Blob([buffer], { type: 'application/pdf' });
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar o PDF.');
      } finally {
        setLoading(false);
      }
    }

    loadPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [transcriptionId]);

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm text-slate-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        Carregando PDF...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Nenhum PDF disponível.
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center overflow-hidden rounded-xl bg-white p-2">
      <Document
        file={pdfUrl}
        loading={
          <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
            Carregando página...
          </div>
        }
        error={
          <div className="flex min-h-[260px] items-center justify-center text-sm text-red-600">
            Não foi possível renderizar o PDF.
          </div>
        }
        className="flex justify-center"
      >
        <Page
          pageNumber={page + 1}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full"
          width={420}
        />
      </Document>
    </div>
  );
}