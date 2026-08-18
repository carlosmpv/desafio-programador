"use server"

import FileUpload from "@/components/FileUpload";

const StepIcon = ({ type }: { type: "upload" | "review" | "download" | "start" }) => {
  const common = "h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm ring-1 ring-inset";

  const styles = {
    upload: `${common} bg-blue-50 text-blue-600 ring-blue-100`,
    review: `${common} bg-violet-50 text-violet-600 ring-violet-100`,
    download: `${common} bg-emerald-50 text-emerald-600 ring-emerald-100`,
    start: `${common} bg-amber-50 text-amber-600 ring-amber-100`,
  };

  const icons = {
    upload: "📄",
    review: "🛠️",
    download: "⬇️",
    start: "🚀",
  };

  return <div className={styles[type]}>{icons[type]}</div>;
};

export default async function Home() {
  const steps = [
    {
      type: "upload" as const,
      title: "Upload do PDF",
      description: "Selecione um arquivo do tipo PDF de Cartão de ponto ou Holeríte.",
      wide: false,
    },
    {
      type: "review" as const,
      title: "Revisão e correção",
      description:
        "O arquivo original será apresentado ao lado das planilhas transcritas. Poderão ser corrigidos os erros identificados ou é possível também mudar os parâmetros para a leitura do PDF.",
      wide: true,
    },
    {
      type: "download" as const,
      title: "Download",
      description: "Baixe as planilhas em xlsx, csv ou json.",
      wide: false,
    },
    {
      type: "start" as const,
      title: "Comece agora!",
      description: "",
      wide: false,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Transcribe PDF
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Transforme seus PDFs de holerites e cartões de ponto em planilhas
          </p>
        </header>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Como funciona?
          </h2>
        </div>

        <div className="flex flex-wrap gap-5">
          {steps.map((step) => (
            <section
              key={step.title}
              className={[
                "flex h-full min-w-[260px] flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                step.wide ? "basis-[32rem]" : "basis-[18rem]",
              ].join(" ")}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <StepIcon type={step.type} />
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Passo
                </span>
              </div>

              <h3 className="mb-3 text-2xl font-semibold leading-tight text-slate-900">
                {step.title}
              </h3>

              {step.description ? (
                <p className="text-base leading-relaxed text-slate-600">
                  {step.description.includes("xlsx") ? (
                    <>
                      Baixe as planilhas em <strong className="font-semibold text-slate-700">xlsx</strong>, <strong className="font-semibold text-slate-700">csv</strong> ou <strong className="font-semibold text-slate-700">json</strong>.
                    </>
                  ) : (
                    step.description
                  )}
                </p>
              ) : (
                <div className="mt-auto pt-3">
                  <FileUpload />
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}