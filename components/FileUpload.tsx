'use client'

import { ChangeEvent, useRef, useState } from 'react';
import { uploadPDF } from '@/app/actions';
import { useRouter } from 'next/navigation';

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const isPdfFile = (file: File) =>
  file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

export default function FileUpload() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      setFiles([]);
      setError(null);
      return;
    }

    const invalidFiles = selectedFiles.filter((file) => !isPdfFile(file));

    if (invalidFiles.length > 0) {
      setError('Apenas arquivos PDF podem ser enviados.');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setFiles([]);
      return;
    }

    setError(null);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (!files.length) {
      setError('Selecione ao menos um arquivo PDF para continuar.');
      return;
    }

    const invalidFiles = files.filter((file) => !isPdfFile(file));
    if (invalidFiles.length > 0) {
      setError('Apenas arquivos PDF podem ser enviados.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      for (const file of files) {
        await uploadPDF({
          arquivo: file,
          tipo: 'holerite',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-6 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
        <span className="mb-2 text-3xl" aria-hidden="true">
          📎
        </span>
        <span className="text-base font-semibold text-slate-700">
          Selecionar PDFs
        </span>
        <span className="mt-1 text-sm text-slate-500">Aceita apenas arquivos em PDF</span>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={handleFiles}
        />
      </label>

      {files.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-sm font-medium text-slate-700">Arquivos selecionados</p>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || (files).length === 0}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer"
      >
        {isSubmitting ? 'Enviando...' : 'Confirmar upload'}
      </button>
    </div>
  );
}