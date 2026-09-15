"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  url: string;
  product: string;
  audience: string;
  problem: string;
  promise: string;
  price: string;
  channel: string;
  monthlyBudget: string;
};

const initialForm: FormState = {
  url: "",
  product: "",
  audience: "",
  problem: "",
  promise: "",
  price: "",
  channel: "Meta Ads",
  monthlyBudget: "",
};

const steps = [
  {
    number: "01",
    title: "Sua oferta",
    description: "O que você vende e para quem.",
  },
  {
    number: "02",
    title: "O problema",
    description: "O que você resolve e qual transformação promete.",
  },
  {
    number: "03",
    title: "Sua operação",
    description: "Preço, aquisição e investimento.",
  },
  {
    number: "04",
    title: "Revisão",
    description: "Confira os dados antes de analisar.",
  },
];

export default function AnalyzePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      if (!form.url.trim()) {
        return "Informe a URL da sua página de vendas.";
      }

      if (!form.product.trim()) {
        return "Informe o que você vende.";
      }

      if (!form.audience.trim()) {
        return "Informe para quem você vende.";
      }
    }

    if (currentStep === 2) {
      if (!form.problem.trim()) {
        return "Descreva o principal problema que sua oferta resolve.";
      }

      if (!form.promise.trim()) {
        return "Descreva a transformação que sua oferta promete.";
      }
    }

    if (currentStep === 3) {
      const price = Number(form.price);

      if (!Number.isFinite(price) || price <= 0) {
        return "Informe um preço válido.";
      }

      if (form.monthlyBudget) {
        const monthlyBudget = Number(form.monthlyBudget);

        if (
          !Number.isFinite(monthlyBudget) ||
          monthlyBudget < 0
        ) {
          return "Informe um investimento mensal válido.";
        }
      }
    }

    return "";
  }

  function nextStep() {
    const validationError = validateStep(step);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (step < 4) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function previousStep() {
    setError("");

    if (step > 1) {
      setStep((current) => current - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateStep(3);

    if (validationError) {
      setError(validationError);
      setStep(3);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const price = Number(form.price);

      const monthlyBudget = form.monthlyBudget
        ? Number(form.monthlyBudget)
        : undefined;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: form.url.trim(),
          product: form.product.trim(),
          audience: form.audience.trim(),
          problem: form.problem.trim(),
          promise: form.promise.trim(),
          price,
          channel: form.channel,
          monthlyBudget,
        }),
      });

      const responseText = await response.text();

      let data: any = null;

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          console.error(
            "Resposta inválida da API /api/analyze:",
            responseText
          );

          throw new Error(
            "O servidor retornou uma resposta inválida. Verifique o terminal do Next.js."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Erro ao analisar oferta. Código: ${response.status}`
        );
      }

      if (!data) {
        throw new Error(
          "O servidor não retornou nenhum resultado. Verifique o terminal do Next.js."
        );
      }

      if (!data.analysisId) {
        console.error(
          "Resposta da API sem analysisId:",
          data
        );

        throw new Error(
          data.error ||
            "A análise foi processada, mas o servidor não retornou o ID da análise."
        );
      }

      router.push(`/resultado/${data.analysisId}`);
    } catch (err) {
      console.error("Erro ao enviar análise:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar a análise."
      );

      setLoading(false);
    }
  }

  const progress = useMemo(() => {
    return `${(step / 4) * 100}%`;
  }, [step]);

  if (loading) {
    return <AnalysisLoading />;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* HEADER */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a
          href="/"
          className="flex items-center gap-3 text-sm font-bold tracking-[0.25em]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8a96b]/30 text-[#c8a96b]">
            ♞
          </span>

          ARISTO <span className="text-[#c8a96b]">IA</span>
        </a>

        <div className="text-right">
          <p className="text-[9px] font-semibold tracking-[0.25em] text-zinc-700">
            DIAGNÓSTICO
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Etapa {step} de 4
          </p>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="mx-auto max-w-3xl px-6">
        <div className="h-px bg-zinc-900">
          <div
            className="h-px bg-[#c8a96b] transition-all duration-500"
            style={{ width: progress }}
          />
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-12 lg:pt-16">
        {/* INTRO */}
        <div className="mx-auto mb-12 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96b]" />

            <p className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
              ARISTO ANALYSIS
            </p>
          </div>

          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Vamos descobrir onde
            <br />
            <span className="text-zinc-600">
              sua oferta está perdendo força.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Responda algumas perguntas sobre sua operação. O Aristo vai cruzar
            essas informações com sua página de vendas para encontrar o
            principal gargalo comercial.
          </p>
        </div>

        {/* STEPPER */}
        <div className="mb-10 hidden grid-cols-4 gap-3 md:grid">
          {steps.map((item, index) => {
            const active = step === index + 1;
            const completed = step > index + 1;

            return (
              <div
                key={item.number}
                className={`border-t pt-4 transition ${
                  active || completed
                    ? "border-[#c8a96b]"
                    : "border-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-bold tracking-[0.2em] ${
                      active || completed
                        ? "text-[#c8a96b]"
                        : "text-zinc-700"
                    }`}
                  >
                    {item.number}
                  </span>

                  {completed && (
                    <span className="text-[10px] text-[#c8a96b]">
                      ✓
                    </span>
                  )}
                </div>

                <p
                  className={`mt-2 text-xs font-semibold ${
                    active ? "text-zinc-200" : "text-zinc-600"
                  }`}
                >
                  {item.title}
                </p>

                <p className="mt-1 text-[10px] leading-5 text-zinc-700">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* FORM */}
            <div className="rounded-2xl border border-zinc-900 bg-[#080808] p-6 sm:p-8 lg:p-10">
              {step === 1 && (
                <StepOne
                  form={form}
                  updateField={updateField}
                />
              )}

              {step === 2 && (
                <StepTwo
                  form={form}
                  updateField={updateField}
                />
              )}

              {step === 3 && (
                <StepThree
                  form={form}
                  updateField={updateField}
                />
              )}

              {step === 4 && (
                <StepFour form={form} />
              )}

              {error && (
                <div className="mt-7 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm leading-6 text-red-400">
                  {error}
                </div>
              )}

              <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={previousStep}
                    className="rounded-xl border border-zinc-800 px-6 py-4 text-sm font-medium text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
                  >
                    ← Voltar
                  </button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="rounded-xl bg-[#c8a96b] px-7 py-4 text-sm font-bold text-black transition hover:bg-[#d8bb7b]"
                  >
                    CONTINUAR →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded-xl bg-[#c8a96b] px-7 py-4 text-sm font-bold text-black transition hover:bg-[#d8bb7b]"
                  >
                    INICIAR DIAGNÓSTICO →
                  </button>
                )}
              </div>
            </div>

            {/* SIDE INFO */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-4">
                <div className="rounded-2xl border border-zinc-900 bg-[#080808] p-6">
                  <p className="text-[9px] font-bold tracking-[0.25em] text-[#c8a96b]">
                    O QUE VOCÊ RECEBE
                  </p>

                  <div className="mt-6 space-y-5">
                    <SideBenefit
                      title="Aristo Score"
                      description="Uma leitura geral da força comercial."
                    />

                    <SideBenefit
                      title="Gargalo principal"
                      description="O ponto que merece atenção primeiro."
                    />

                    <SideBenefit
                      title="Decisão"
                      description="O próximo movimento recomendado."
                    />

                    <SideBenefit
                      title="Testes"
                      description="Ideias para começar a validar."
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#c8a96b]/10 bg-[#c8a96b]/[0.03] p-6">
                  <span className="text-lg text-[#c8a96b]">♞</span>

                  <p className="mt-4 text-xs leading-6 text-zinc-500">
                    Não tente melhorar tudo ao mesmo tempo. Primeiro encontre
                    o gargalo.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </section>
    </main>
  );
}

/* -------------------------------------------------------
   ETAPA 01
------------------------------------------------------- */

function StepOne({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="ETAPA 01"
        title="Comece pela sua oferta."
        description="O Aristo precisa entender o que você vende e quem deveria comprar."
      />

      <div className="mt-10 space-y-8">
        <Field
          label="URL DA PÁGINA DE VENDAS"
          placeholder="https://suaoferta.com.br"
          value={form.url}
          onChange={(value) => updateField("url", value)}
          required
          hint="Usaremos sua página como uma das fontes do diagnóstico."
        />

        <Field
          label="O QUE VOCÊ VENDE?"
          placeholder="Ex: Curso de tráfego pago para iniciantes"
          value={form.product}
          onChange={(value) => updateField("product", value)}
          required
        />

        <Field
          label="PARA QUEM VOCÊ VENDE?"
          placeholder="Ex: Infoprodutores que já vendem, mas têm dificuldade para escalar"
          value={form.audience}
          onChange={(value) => updateField("audience", value)}
          required
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ETAPA 02
------------------------------------------------------- */

function StepTwo({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
}) {
  return (
    <div>
      <StepHeading
        eyebrow="ETAPA 02"
        title="Agora vamos entender o problema."
        description="Aqui queremos descobrir o que sua oferta promete mudar na vida do comprador."
      />

      <div className="mt-10 space-y-8">
        <Field
          label="QUAL PROBLEMA VOCÊ RESOLVE?"
          placeholder="Ex: O produtor investe em anúncios, mas não consegue encontrar criativos que gerem vendas de forma consistente."
          value={form.problem}
          onChange={(value) => updateField("problem", value)}
          textarea
          required
          hint="Descreva o problema mais importante. Evite respostas genéricas."
        />

        <Field
          label="QUAL TRANSFORMAÇÃO VOCÊ PROMETE?"
          placeholder="Ex: Ensinar o produtor a criar e testar campanhas capazes de gerar vendas todos os dias."
          value={form.promise}
          onChange={(value) => updateField("promise", value)}
          textarea
          required
          hint="Pense no resultado que o cliente deseja alcançar."
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ETAPA 03
------------------------------------------------------- */

function StepThree({
  form,
  updateField,
}: {
  form: FormState;
  updateField: (field: keyof FormState, value: string) => void;
}) {
  const channels = [
    "Meta Ads",
    "Google Ads",
    "Orgânico",
    "Outros",
  ];

  return (
    <div>
      <StepHeading
        eyebrow="ETAPA 03"
        title="Vamos olhar sua operação."
        description="Preço e aquisição ajudam o Aristo a interpretar o contexto econômico da oferta."
      />

      <div className="mt-10 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="PREÇO DA OFERTA"
            placeholder="497"
            type="number"
            value={form.price}
            onChange={(value) => updateField("price", value)}
            required
            prefix="R$"
          />

          <Field
            label="INVESTIMENTO MENSAL"
            placeholder="3000"
            type="number"
            value={form.monthlyBudget}
            onChange={(value) =>
              updateField("monthlyBudget", value)
            }
            prefix="R$"
            hint="Se ainda não investe, pode deixar vazio."
          />
        </div>

        <div>
          <label className="mb-3 block text-[10px] font-bold tracking-[0.2em] text-zinc-500">
            PRINCIPAL CANAL DE AQUISIÇÃO
          </label>

          <div className="grid grid-cols-2 gap-3">
            {channels.map((channel) => {
              const active = form.channel === channel;

              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() =>
                    updateField("channel", channel)
                  }
                  className={`rounded-xl border px-4 py-4 text-sm transition ${
                    active
                      ? "border-[#c8a96b] bg-[#c8a96b]/10 text-[#c8a96b]"
                      : "border-zinc-800 bg-[#050505] text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    {channel}

                    {active && (
                      <span className="text-xs">✓</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   ETAPA 04
------------------------------------------------------- */

function StepFour({ form }: { form: FormState }) {
  return (
    <div>
      <StepHeading
        eyebrow="ETAPA 04"
        title="Tudo pronto para analisar."
        description="Confira rapidamente as informações que serão usadas no diagnóstico."
      />

      <div className="mt-10 space-y-3">
        <ReviewRow
          label="Página"
          value={form.url}
        />

        <ReviewRow
          label="Oferta"
          value={form.product}
        />

        <ReviewRow
          label="Público"
          value={form.audience}
        />

        <ReviewRow
          label="Problema"
          value={form.problem}
        />

        <ReviewRow
          label="Promessa"
          value={form.promise}
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <ReviewRow
            label="Preço"
            value={`R$ ${Number(form.price).toLocaleString(
              "pt-BR"
            )}`}
          />

          <ReviewRow
            label="Canal"
            value={form.channel}
          />

          <ReviewRow
            label="Investimento"
            value={
              form.monthlyBudget
                ? `R$ ${Number(
                    form.monthlyBudget
                  ).toLocaleString("pt-BR")}`
                : "Não informado"
            }
          />
        </div>
      </div>

      <div className="mt-7 rounded-xl border border-[#c8a96b]/10 bg-[#c8a96b]/[0.03] p-5">
        <div className="flex gap-3">
          <span className="text-[#c8a96b]">♞</span>

          <div>
            <p className="text-sm font-semibold">
              Próximo passo
            </p>

            <p className="mt-1 text-xs leading-6 text-zinc-600">
              O Aristo vai analisar os dados enviados e gerar seu diagnóstico
              comercial inicial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTES
------------------------------------------------------- */

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold tracking-[0.3em] text-[#c8a96b]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  textarea = false,
  type = "text",
  required = false,
  hint,
  prefix,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
  required?: boolean;
  hint?: string;
  prefix?: string;
}) {
  const className =
    "w-full rounded-xl border border-zinc-800 bg-[#050505] px-4 py-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#c8a96b] focus:ring-1 focus:ring-[#c8a96b]/10";

  return (
    <div>
      <label className="mb-3 block text-[10px] font-bold tracking-[0.2em] text-zinc-500">
        {label}

        {required && (
          <span className="ml-1 text-[#c8a96b]">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-zinc-700">
            {prefix}
          </span>
        )}

        {textarea ? (
          <textarea
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className={`${className} resize-none`}
          />
        ) : (
          <input
            required={required}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`${className} ${
              prefix ? "pl-11" : ""
            }`}
          />
        )}
      </div>

      {hint && (
        <p className="mt-2 text-[10px] leading-5 text-zinc-700">
          {hint}
        </p>
      )}
    </div>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-[#050505] p-4">
      <p className="text-[8px] font-bold tracking-[0.2em] text-zinc-700">
        {label}
      </p>

      <p className="mt-2 break-words text-sm leading-6 text-zinc-300">
        {value || "—"}
      </p>
    </div>
  );
}

function SideBenefit({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-xs text-[#c8a96b]">
        ✓
      </span>

      <div>
        <p className="text-xs font-semibold text-zinc-300">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-zinc-700">
          {description}
        </p>
      </div>
    </div>
  );
}

function AnalysisLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c8a96b]/30 bg-[#c8a96b]/5 text-xl text-[#c8a96b] shadow-[0_0_50px_rgba(200,169,107,0.08)]">
          ♞
        </div>

        <p className="mt-8 text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
          ARISTO ANALYSIS
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Analisando sua oferta...
        </h1>

        <p className="mt-4 text-sm leading-7 text-zinc-600">
          Estamos cruzando sua página, oferta, público e modelo de aquisição
          para encontrar o principal gargalo.
        </p>

        <div className="mt-10 h-1 overflow-hidden rounded-full bg-zinc-900">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#c8a96b]" />
        </div>

        <div className="mt-6 flex justify-center gap-5 text-[9px] tracking-wider text-zinc-700">
          <span>OFERTA</span>
          <span>•</span>
          <span>MERCADO</span>
          <span>•</span>
          <span>DECISÃO</span>
        </div>
      </div>
    </main>
  );
}
