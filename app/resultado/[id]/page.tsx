"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { track } from "@/lib/analytics/posthog";
import { ARISTO_EVENTS } from "@/lib/analytics/events";

type Scores = {
  offer: number;
  conversion: number;
  acquisition: number;
  economics: number;
};

type Bottleneck = {
  category: string;
  severity: "low" | "medium" | "high";
  explanation: string;
};

type Test = {
  title: string;
  hypothesis: string;
  action: string;
  metric: string;
};

type ActionPlanItem = {
  priority: number;
  action: string;
  reason: string;
  metric: string;
  successCriteria: string;
};

type PaidReport = {
  executiveDiagnosis: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    opportunity: string;
  };

  topProblems: string[];

  actionPlan: ActionPlanItem[];

  creativePackage: {
    hooks: string[];
    angles: string[];
    adCopies: string[];
    creatives: string[];
  };

  whatNotToDo: string[];

  finalVerdict: string;
};

type AnalysisResult = {
  score: number;
  scores: Scores;

  status: "red" | "yellow" | "green" | null;

  mainBottleneck: Bottleneck | null;

  decision: string | null;
  recommendation: string | null;

  creativeAngles: string[];
  tests: Test[];

  paidReport?: PaidReport;

  createdAt?: string;
};

type Analysis = {
  id: string;
  url: string;
  product: string;
  audience: string;
  problem: string;
  promise: string;
  price: number;
  channel: string;
  monthlyBudget?: number;
  status?: string;
  createdAt?: string;
};

type ApiResponse = {
  success: boolean;
  error?: string;
  code?: string;

  analysis?: Analysis;
  result?: AnalysisResult;

  purchase?: {
    status?: string;
    paymentId?: string | null;
  };
};

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const text = await response.text();

  let data: any = null;

  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Resposta inválida da API:", {
        url,
        status: response.status,
        text,
      });

      throw new Error(
        `A API retornou uma resposta inválida (${response.status}).`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `Erro na API (${response.status}).`
    );
  }

  if (!data) {
    throw new Error("A API não retornou nenhum dado.");
  }

  return data as T;
}

export default function ResultadoPage() {
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [analysis, setAnalysis] =
    useState<Analysis | null>(null);

  const [result, setResult] =
    useState<AnalysisResult | null>(null);

  const [paid, setPaid] = useState(false);

  const [checkingPayment, setCheckingPayment] =
    useState(false);

  const [checkoutLoading, setCheckoutLoading] =
    useState(false);

  // =====================================================
  // CARREGA ANÁLISE
  // =====================================================

  useEffect(() => {
    if (!id) return;

    async function loadAnalysis() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchJson<ApiResponse>(
            `/api/analyze/${id}`
          );

        if (!data.success) {
          throw new Error(
            data.error ||
              "Não foi possível carregar a análise."
          );
        }

        if (!data.analysis || !data.result) {
          throw new Error(
            "A análise foi encontrada, mas os dados estão incompletos."
          );
        }

        setAnalysis(data.analysis);
        setResult(data.result);
      } catch (err) {
        console.error(
          "Erro ao carregar análise:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar análise."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalysis();
  }, [id]);

  // =====================================================
  // ANALYTICS — RESULTADO VISUALIZADO
  // =====================================================

  useEffect(() => {
    if (!result || !analysis) return;

    track(ARISTO_EVENTS.RESULT_VIEWED, {
      analysis_id: analysis.id,
      score: result.score,
      bottleneck:
        result.mainBottleneck?.category || null,
      status: result.status,
      price: analysis.price,
      channel: analysis.channel,
    });
  }, [result, analysis]);

  // =====================================================
  // DETECTA PAGAMENTO EXISTENTE
  // =====================================================

  useEffect(() => {
    if (!id) return;

    async function detectExistingPayment() {
      try {
        const payment =
          await fetchJson<{
            success: boolean;
            approved?: boolean;
          }>(`/api/payment/${id}`);

        if (!payment.approved) {
          return;
        }

        const full =
          await fetchJson<ApiResponse>(
            `/api/analyze/${id}/full`
          );

        if (
          full.success &&
          full.result?.paidReport
        ) {
          setPaid(true);

          if (full.analysis) {
            setAnalysis(full.analysis);
          }

          if (full.result) {
            setResult(full.result);
          }
        }
      } catch {
        // Falha silenciosa.
      }
    }

    detectExistingPayment();
  }, [id]);

  // =====================================================
  // CHECKOUT
  // =====================================================

  async function handleCheckout() {
    if (!id) return;

    try {
      setCheckoutLoading(true);
      setError("");

      track(ARISTO_EVENTS.REPORT_CTA_CLICKED, {
        analysis_id: id,
        score: result?.score || null,
        bottleneck:
          result?.mainBottleneck?.category || null,
        price: analysis?.price || null,
      });

      const data =
        await fetchJson<{
          success: boolean;
          initPoint?: string;
          error?: string;
        }>("/api/checkout", {
          method: "POST",
          body: JSON.stringify({
            analysisId: id,
          }),
        });

      if (!data.success || !data.initPoint) {
        throw new Error(
          data.error ||
            "Não foi possível criar o checkout."
        );
      }

      track(ARISTO_EVENTS.CHECKOUT_CREATED, {
        analysis_id: id,
      });

      window.location.href = data.initPoint;
    } catch (err) {
      console.error(
        "Erro ao iniciar checkout:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erro ao iniciar pagamento."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  // =====================================================
  // VERIFICA PAGAMENTO
  // =====================================================

  async function checkPayment() {
    if (!id) return;

    try {
      setCheckingPayment(true);
      setError("");

      track(ARISTO_EVENTS.PAYMENT_CHECKED, {
        analysis_id: id,
      });

      const data =
        await fetchJson<{
          success: boolean;
          status?: string;
          approved?: boolean;
          error?: string;
        }>(`/api/payment/${id}`);

      if (!data.approved) {
        throw new Error(
          "Pagamento ainda não identificado. Aguarde a confirmação do Mercado Pago."
        );
      }

      track(ARISTO_EVENTS.PAYMENT_APPROVED, {
        analysis_id: id,
      });

      const full =
        await fetchJson<ApiResponse>(
          `/api/analyze/${id}/full`
        );

      if (!full.success) {
        throw new Error(
          full.error ||
            "Não foi possível liberar o relatório."
        );
      }

      if (!full.result?.paidReport) {
        throw new Error(
          "Pagamento confirmado, mas o relatório completo ainda está sendo preparado."
        );
      }

      setPaid(true);

      if (full.analysis) {
        setAnalysis(full.analysis);
      }

      if (full.result) {
        setResult(full.result);
      }

      track(ARISTO_EVENTS.REPORT_UNLOCKED, {
        analysis_id: id,
        score: full.result?.score || null,
      });
    } catch (err) {
      console.error(
        "Erro ao verificar pagamento:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Pagamento ainda não identificado."
      );
    } finally {
      setCheckingPayment(false);
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  function getScoreColor(score: number) {
    if (score < 40) return "text-red-400";
    if (score < 70) return "text-yellow-400";
    return "text-green-400";
  }

  function getScoreLabel(score: number) {
    if (score < 40) return "CRÍTICO";
    if (score < 70) return "ATENÇÃO";
    return "SAUDÁVEL";
  }

  function getStatusColor(status?: string | null) {
    if (status === "green") {
      return "border-green-500/30 bg-green-500/10 text-green-400";
    }

    if (status === "yellow") {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  function getBottleneckText(
    category?: string | null
  ) {
    switch (category) {
      case "Oferta":
        return "Sua oferta ainda pode estar deixando dinheiro na mesa.";

      case "Conversão":
        return "Existe atenção chegando, mas parte dela não está virando compra.";

      case "Aquisição":
        return "O problema está em encontrar mensagens e criativos capazes de trazer atenção qualificada.";

      case "Economia":
        return "A operação precisa melhorar sua relação entre investimento, receita e margem.";

      default:
        return "Essa é a variável que mais limita o próximo avanço da sua operação.";
    }
  }

  // =====================================================
  // DERIVADOS
  // =====================================================

  const scoreInterpretation = useMemo(() => {
    if (!result) return "";

    if (result.score < 40) {
      return "Escalar agora pode aumentar o desperdício antes de aumentar o resultado.";
    }

    if (result.score < 55) {
      return "Existe algo para trabalhar, mas alguns pontos estruturais ainda precisam de correção.";
    }

    if (result.score < 70) {
      return "Existe potencial comercial. O próximo avanço depende de atacar o gargalo certo.";
    }

    if (result.score < 85) {
      return "A operação apresenta bons sinais. Agora é hora de transformar isso em testes consistentes.";
    }

    return "A operação apresenta sinais muito fortes. O próximo passo é encontrar, medir e escalar os vencedores.";
  }, [result]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/5">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />
          </div>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
            ARISTO IA
          </p>

          <h1 className="mt-4 text-2xl font-black">
            Processando diagnóstico
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/40">
            Estamos cruzando os sinais comerciais
            da sua operação.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="text-2xl font-black">
            Não conseguimos carregar a análise
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // DATA MISSING
  // =====================================================

  if (!result || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-white/50">
          Dados da análise não encontrados.
        </p>
      </main>
    );
  }

  const paidReport = result.paidReport;

  const bottleneck =
    result.mainBottleneck?.category ||
    "Não identificado";

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[700px] w-[1000px] -translate-x-1/2 rounded-full bg-yellow-500/[0.045] blur-[150px]" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-yellow-500/[0.018] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-7 md:px-8 md:py-10">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black shadow-lg shadow-yellow-500/10">
                A
              </div>

              <div>
                <p className="text-sm font-black tracking-[0.18em]">
                  ARISTO IA
                </p>

                <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                  Commercial Intelligence
                </p>
              </div>
            </div>

            {paid && (
              <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Relatório liberado
              </div>
            )}
          </div>

          <div className="mt-16 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/15 bg-yellow-500/[0.04] px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                Diagnóstico comercial concluído
              </span>
            </div>

            <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight md:text-7xl">
              O Aristo encontrou
              <br />
              <span className="text-yellow-400">
                onde está o problema.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/40 md:text-base">
              Você não precisa de mais uma opinião sobre
              sua oferta. Precisa saber qual variável merece
              atenção antes de colocar mais dinheiro,
              tempo ou tráfego nela.
            </p>
          </div>
        </header>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.04] px-5 py-4 text-sm text-yellow-300">
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* ================================================= */}
        {/* SCORE + GARGALO */}
        {/* ================================================= */}

        <section className="mt-12 grid gap-5 lg:grid-cols-[360px_1fr]">

          {/* SCORE */}

          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.015] p-8 md:p-9">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-yellow-400/[0.08] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
                  Aristo Score
                </p>

                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/25">
                  0 — 100
                </span>
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span
                  className={`text-8xl font-black leading-none tracking-tighter ${getScoreColor(
                    result.score
                  )}`}
                >
                  {Math.round(result.score)}
                </span>

                <span className="mb-2 text-xl font-bold text-white/20">
                  /100
                </span>
              </div>

              <div
                className={`mt-6 inline-flex rounded-full border px-3 py-1.5 text-[10px] font-black tracking-widest ${getStatusColor(
                  result.status
                )}`}
              >
                {getScoreLabel(result.score)}
              </div>

              <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    result.score < 40
                      ? "bg-red-400"
                      : result.score < 70
                      ? "bg-yellow-400"
                      : "bg-green-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, result.score)
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-6 text-xs leading-6 text-white/35">
                {scoreInterpretation}
              </p>
            </div>
          </div>

          {/* GARGALO */}

          <div className="relative overflow-hidden rounded-[30px] border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.085] via-white/[0.025] to-transparent p-8 md:p-10">
            <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-yellow-500/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                  O ponto que merece atenção
                </p>

                {result.mainBottleneck && (
                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${getStatusColor(
                      result.mainBottleneck.severity ===
                        "high"
                        ? "red"
                        : result.mainBottleneck.severity ===
                          "medium"
                        ? "yellow"
                        : "green"
                    )}`}
                  >
                    {result.mainBottleneck.severity ===
                    "high"
                      ? "Alta prioridade"
                      : result.mainBottleneck.severity ===
                        "medium"
                      ? "Prioridade média"
                      : "Baixa prioridade"}
                  </span>
                )}
              </div>

              <h2 className="mt-6 text-4xl font-black tracking-tight md:text-6xl">
                {bottleneck}
              </h2>

              <p className="mt-3 max-w-2xl text-sm font-medium text-yellow-400/70">
                {getBottleneckText(bottleneck)}
              </p>

              <div className="my-7 h-px bg-white/10" />

              <p className="max-w-3xl text-base leading-8 text-white/55">
                {result.mainBottleneck?.explanation ||
                  "Não foi possível identificar o principal gargalo."}
              </p>

              <div className="mt-8 rounded-2xl border border-yellow-500/10 bg-black/20 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 font-black text-yellow-400">
                    !
                  </span>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-white/50">
                      O risco agora
                    </p>

                    <p className="mt-1 text-sm leading-6 text-white/40">
                      Se você aumentar o volume antes de
                      entender esse ponto, pode simplesmente
                      aumentar o custo do problema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DECISÃO */}
        {/* ================================================= */}

        <section className="mt-5 rounded-[30px] border border-white/10 bg-white/[0.025] p-7 md:p-9">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-yellow-400" />

                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                  Decisão do Aristo
                </p>
              </div>

              <h2 className="mt-5 max-w-4xl text-2xl font-black leading-tight md:text-4xl">
                {result.decision ||
                  "Continue analisando sua operação."}
              </h2>

              {result.recommendation && (
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45 md:text-base">
                  {result.recommendation}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                Próximo movimento
              </p>

              <div className="mt-4 space-y-3">
                <DecisionStep
                  number="01"
                  text="Corrigir"
                  active
                />

                <DecisionStep
                  number="02"
                  text="Testar"
                />

                <DecisionStep
                  number="03"
                  text="Medir"
                />

                <DecisionStep
                  number="04"
                  text="Escalar"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* DIMENSÕES */}
        {/* ================================================= */}

        <section className="mt-16">
          <div className="mb-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              Raio-X da operação
            </p>

            <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black md:text-4xl">
                  Você já sabe onde está.
                </h2>

                <p className="mt-2 text-sm text-white/35">
                  O problema agora é decidir o que fazer com essa informação.
                </p>
              </div>

              <p className="text-xs text-white/20">
                O menor score representa a maior oportunidade.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreCard
              title="Oferta"
              subtitle="Valor percebido"
              score={result.scores.offer}
              isBottleneck={bottleneck === "Oferta"}
            />

            <ScoreCard
              title="Conversão"
              subtitle="Capacidade de vender"
              score={result.scores.conversion}
              isBottleneck={bottleneck === "Conversão"}
            />

            <ScoreCard
              title="Aquisição"
              subtitle="Capacidade de atrair"
              score={result.scores.acquisition}
              isBottleneck={bottleneck === "Aquisição"}
            />

            <ScoreCard
              title="Economia"
              subtitle="Capacidade de escalar"
              score={result.scores.economics}
              isBottleneck={bottleneck === "Economia"}
            />
          </div>
        </section>

        {/* ================================================= */}
        {/* PAYWALL / CONVERSÃO */}
        {/* ================================================= */}

        {!paid && (
          <>
            <section className="mt-20 text-center">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-yellow-500/15 bg-yellow-500/[0.04] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />

                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Diagnóstico concluído
                </span>
              </div>

              <h2 className="mx-auto mt-6 max-w-4xl text-3xl font-black leading-tight md:text-5xl">
                Você já descobriu{" "}
                <span className="text-yellow-400">
                  o problema.
                </span>
                <br />
                Agora precisa descobrir a solução.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/40 md:text-base">
                O diagnóstico gratuito responde{" "}
                <strong className="text-white/70">
                  “onde está o gargalo?”
                </strong>
                <br />
                O relatório completo responde{" "}
                <strong className="text-white/70">
                  “o que eu faço agora?”
                </strong>
              </p>
            </section>

            {/* ================================================= */}
            {/* PREVIEW */}
            {/* ================================================= */}

            <section className="mt-10 grid gap-4 lg:grid-cols-3">
              <LockedPreview
                number="01"
                title="Plano de ação"
                description="Saiba qual problema atacar primeiro, qual ação tomar e qual métrica observar."
                preview={`PRIORIDADE #01\n\nProblema → ${bottleneck}\n\nAção → Corrigir a causa principal\n\nMétrica → resultado do teste\n\nSucesso → critério objetivo`}
              />

              <LockedPreview
                number="02"
                title="Hooks e ângulos"
                description="Transforme seu diagnóstico em novas hipóteses de comunicação."
                preview={`HOOK #01\n\n“Existe um ponto na sua operação que pode estar impedindo o próximo nível...”\n\nÂngulo → problema\nÂngulo → oportunidade\nÂngulo → mecanismo`}
              />

              <LockedPreview
                number="03"
                title="Copies e criativos"
                description="Receba pontos de partida para sua próxima rodada de anúncios."
                preview={`COPY #01\n\nProblema\n↓\nMecanismo\n↓\nPromessa\n↓\nProva\n↓\nCTA`}
              />
            </section>

            {/* ================================================= */}
            {/* PAYWALL */}
            {/* ================================================= */}

            <section
              id="relatorio"
              className="relative mt-8 overflow-hidden rounded-[36px] border border-yellow-500/30 bg-gradient-to-br from-yellow-500/[0.13] via-yellow-500/[0.045] to-transparent p-7 md:p-12"
            >
              <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-yellow-400/[0.1] blur-[100px]" />

              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">
                      A
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                        Aristo Intelligence Report
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-widest text-white/25">
                        Diagnóstico → decisão → execução
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-yellow-400">
                    Acesso imediato
                  </span>
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">

                  {/* COPY */}

                  <div>
                    <p className="text-sm font-bold text-white/50">
                      Seu gargalo já foi identificado.
                    </p>

                    <h2 className="mt-3 max-w-3xl text-3xl font-black leading-[1.04] tracking-tight md:text-5xl">
                      Não fique só sabendo
                      <br />
                      <span className="text-yellow-400">
                        o que está errado.
                      </span>
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
                      O relatório transforma o diagnóstico
                      da sua operação em uma sequência prática:
                      o que atacar, o que testar, o que medir
                      e o que evitar.
                    </p>

                    <div className="mt-8 space-y-3">
                      <UnlockFeature
                        icon="01"
                        title="Diagnóstico executivo"
                        text="Entenda a situação comercial da sua operação."
                      />

                      <UnlockFeature
                        icon="02"
                        title="Problemas prioritários"
                        text="Saiba o que merece atenção primeiro."
                      />

                      <UnlockFeature
                        icon="03"
                        title="Plano de ação"
                        text="Receba uma ordem clara de execução."
                      />

                      <UnlockFeature
                        icon="04"
                        title="Hooks e ângulos"
                        text="Crie novas hipóteses para testar."
                      />

                      <UnlockFeature
                        icon="05"
                        title="Copies e criativos"
                        text="Tenha pontos de partida para os anúncios."
                      />

                      <UnlockFeature
                        icon="06"
                        title="O que não fazer"
                        text="Evite testes que só queimam dinheiro e dados."
                      />
                    </div>
                  </div>

                  {/* CHECKOUT */}

                  <div className="rounded-[28px] border border-yellow-500/25 bg-[#080808]/90 p-6 shadow-2xl shadow-black/50 md:p-7">
                    <div className="text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-lg font-black text-yellow-400">
                        A
                      </div>

                      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Relatório completo
                      </p>

                      <h3 className="mt-3 text-xl font-black">
                        Seu próximo plano de ataque.
                      </h3>

                      <div className="mt-6 flex items-end justify-center gap-2">
                        <span className="text-5xl font-black">
                          R$ 97
                        </span>

                        <span className="mb-2 text-xs text-white/30">
                          pagamento único
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-white/30">
                        Menos tentativa aleatória.
                        <br />
                        Mais clareza para o próximo teste.
                      </p>

                      <button
                        onClick={handleCheckout}
                        disabled={checkoutLoading}
                        className="group mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-yellow-400 px-6 py-4 text-sm font-black text-black shadow-xl shadow-yellow-500/15 transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {checkoutLoading
                          ? "Abrindo checkout..."
                          : "Desbloquear por R$ 97"}

                        {!checkoutLoading && (
                          <span className="transition group-hover:translate-x-1">
                            →
                          </span>
                        )}
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/25">
                        <span className="text-green-400">
                          ✓
                        </span>

                        Pagamento seguro
                      </div>

                      <button
                        onClick={checkPayment}
                        disabled={checkingPayment}
                        className="mt-5 text-[10px] font-semibold text-white/25 underline decoration-white/10 underline-offset-4 transition hover:text-white/55 disabled:opacity-50"
                      >
                        {checkingPayment
                          ? "Verificando pagamento..."
                          : "Já paguei → verificar acesso"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* MICRO COPY */}

                <div className="mt-9 border-t border-yellow-500/10 pt-6">
                  <p className="text-center text-xs leading-6 text-white/25">
                    O objetivo do relatório não é gerar mais
                    informação. É ajudar você a tomar a próxima
                    decisão com mais clareza.
                  </p>
                </div>
              </div>
            </section>

            {/* ================================================= */}
            {/* VALOR */}
            {/* ================================================= */}

            <section className="mt-16">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/25">
                  O que muda
                </p>

                <h2 className="mt-3 text-3xl font-black md:text-4xl">
                  De diagnóstico para execução.
                </h2>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/35">
                  Você deixa de olhar para quatro notas
                  e passa a ter uma sequência de decisões.
                </p>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <ValueCard
                  number="01"
                  title="Decisão"
                  text="Descubra qual variável merece sua atenção antes de qualquer tentativa de escala."
                />

                <ValueCard
                  number="02"
                  title="Prioridade"
                  text="Saiba o que atacar primeiro e qual sinal deve mostrar que a mudança funcionou."
                />

                <ValueCard
                  number="03"
                  title="Experimentação"
                  text="Transforme o diagnóstico em hipóteses de hooks, ângulos, copies e criativos."
                />

                <ValueCard
                  number="04"
                  title="Controle"
                  text="Evite mudar cinco coisas ao mesmo tempo e perder a leitura dos seus dados."
                />
              </div>
            </section>

            {/* ================================================= */}
            {/* CTA FINAL */}
            {/* ================================================= */}

            <section className="mt-20 border-t border-white/5 pt-16 text-center">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-400">
                Próximo passo
              </p>

              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight md:text-5xl">
                Você já sabe{" "}
                <span className="text-white/35">
                  onde está o problema.
                </span>
                <br />
                Agora descubra como atacar.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/35">
                O relatório completo foi construído a partir
                dos dados da sua própria análise.
              </p>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-yellow-400 px-9 py-4 text-sm font-black text-black shadow-xl shadow-yellow-500/10 transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoading
                  ? "Abrindo checkout..."
                  : "Desbloquear meu relatório"}

                {!checkoutLoading && (
                  <span>→</span>
                )}
              </button>

              <p className="mt-4 text-xs text-white/20">
                R$ 97 · pagamento único · acesso imediato
              </p>
            </section>
          </>
        )}

        {/* ================================================= */}
        {/* BASE DA ANÁLISE */}
        {/* ================================================= */}

        <section className="mt-16 rounded-[30px] border border-white/10 bg-white/[0.02] p-7 md:p-9">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/25">
                Base da análise
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Os dados usados pelo Aristo.
              </h2>
            </div>

            <span className="text-xs text-white/20">
              Dados fornecidos na análise
            </span>
          </div>

          <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2">
            <InfoItem
              label="Produto"
              value={analysis.product}
            />

            <InfoItem
              label="Público"
              value={analysis.audience}
            />

            <InfoItem
              label="Problema"
              value={analysis.problem}
            />

            <InfoItem
              label="Promessa"
              value={analysis.promise}
            />

            <InfoItem
              label="Preço"
              value={`R$ ${Number(
                analysis.price || 0
              ).toFixed(2)}`}
            />

            <InfoItem
              label="Canal"
              value={analysis.channel}
            />

            {analysis.monthlyBudget ? (
              <InfoItem
                label="Orçamento mensal"
                value={`R$ ${Number(
                  analysis.monthlyBudget
                ).toFixed(2)}`}
              />
            ) : null}

            <InfoItem
              label="Página analisada"
              value={analysis.url}
            />
          </div>
        </section>

        {/* ================================================= */}
        {/* RELATÓRIO PAGO */}
        {/* ================================================= */}

        {paid && paidReport && (
          <section className="mt-16">

            {/* HEADER */}

            <div className="mb-8 overflow-hidden rounded-[34px] border border-green-500/20 bg-gradient-to-br from-green-500/[0.075] via-white/[0.025] to-transparent p-7 md:p-11">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-400 font-black text-black">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-green-400">
                      Acesso liberado
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-widest text-white/25">
                      Aristo Intelligence Report
                    </p>
                  </div>
                </div>

                <span className="rounded-full border border-green-500/20 bg-green-500/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-green-400">
                  Completo
                </span>
              </div>

              <h2 className="mt-8 text-3xl font-black tracking-tight md:text-6xl">
                Seu plano de ataque.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40 md:text-base">
                Agora você tem uma sequência de decisões,
                prioridades e hipóteses para agir sobre
                o diagnóstico.
              </p>
            </div>

            {/* EXECUTIVO */}

            <ReportSection
              eyebrow="01"
              title="Diagnóstico executivo"
              description="A leitura estratégica da sua operação."
            >
              <p className="text-base leading-8 text-white/65 md:text-lg">
                {
                  paidReport.executiveDiagnosis
                    .summary
                }
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <ReportList
                  title="Pontos fortes"
                  items={
                    paidReport.executiveDiagnosis
                      .strengths
                  }
                  color="green"
                />

                <ReportList
                  title="Pontos fracos"
                  items={
                    paidReport.executiveDiagnosis
                      .weaknesses
                  }
                  color="red"
                />
              </div>

              <div className="mt-5 rounded-2xl border border-yellow-500/15 bg-yellow-500/[0.04] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                  Oportunidade
                </p>

                <p className="mt-3 text-sm leading-7 text-white/60">
                  {
                    paidReport.executiveDiagnosis
                      .opportunity
                  }
                </p>
              </div>
            </ReportSection>

            {/* PROBLEMAS */}

            <ReportSection
              eyebrow="02"
              title="Problemas prioritários"
              description="O que merece sua atenção primeiro."
            >
              <div className="space-y-3">
                {paidReport.topProblems.map(
                  (problem, index) => (
                    <div
                      key={index}
                      className="group flex gap-4 rounded-2xl border border-white/7 bg-black/20 p-5 transition hover:border-red-500/20"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-xs font-black text-red-400">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <p className="text-sm leading-7 text-white/60">
                        {problem}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* PLANO */}

            <ReportSection
              eyebrow="03"
              title="Plano de ação"
              description="A ordem em que você deve atacar os problemas."
            >
              <div className="space-y-4">
                {paidReport.actionPlan.map(
                  (item) => (
                    <div
                      key={item.priority}
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-6 md:p-7"
                    >
                      <div className="absolute bottom-0 left-0 top-0 w-px bg-yellow-400/40" />

                      <div className="flex gap-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-sm font-black text-black">
                          {item.priority}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-black leading-7">
                            {item.action}
                          </h3>

                          <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <PlanDetail
                              label="Por quê"
                              value={item.reason}
                            />

                            <PlanDetail
                              label="Métrica"
                              value={item.metric}
                            />

                            <PlanDetail
                              label="Sucesso"
                              value={
                                item.successCriteria
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* HOOKS */}

            <ReportSection
              eyebrow="04"
              title="Hooks para testar"
              description="Pontos de entrada para chamar atenção do mercado."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {paidReport.creativePackage.hooks.map(
                  (hook, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/7 bg-white/[0.02] p-5 transition hover:border-yellow-500/20 hover:bg-yellow-500/[0.025]"
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                        Hook{" "}
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p className="mt-3 text-sm leading-7 text-white/65">
                        {hook}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* ÂNGULOS */}

            <ReportSection
              eyebrow="05"
              title="Ângulos de campanha"
              description="Diferentes formas de apresentar a mesma oferta."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {paidReport.creativePackage.angles.map(
                  (angle, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-2xl border border-white/7 bg-white/[0.02] p-5"
                    >
                      <span className="text-sm font-black text-yellow-400">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p className="text-sm leading-7 text-white/60">
                        {angle}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* COPIES */}

            <ReportSection
              eyebrow="06"
              title="Copies para anúncios"
              description="Pontos de partida para transformar os ângulos em anúncios."
            >
              <div className="space-y-4">
                {paidReport.creativePackage.adCopies.map(
                  (copy, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-black/20 p-6 md:p-7"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                          Copy{" "}
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="text-[10px] text-white/20">
                          ANÚNCIO
                        </span>
                      </div>

                      <p className="mt-5 whitespace-pre-line text-sm leading-8 text-white/60">
                        {copy}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* CRIATIVOS */}

            <ReportSection
              eyebrow="07"
              title="Criativos para testar"
              description="Experimentos para sua próxima rodada."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {paidReport.creativePackage.creatives.map(
                  (creative, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-black/20 p-6"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-400/10 text-xs font-black text-yellow-400">
                        {index + 1}
                      </div>

                      <p className="mt-5 text-sm leading-7 text-white/60">
                        {creative}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* NÃO FAZER */}

            <ReportSection
              eyebrow="08"
              title="O que não fazer"
              description="Erros que podem desperdiçar dinheiro e dados."
            >
              <div className="space-y-3">
                {paidReport.whatNotToDo.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-2xl border border-red-500/10 bg-red-500/[0.035] p-5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-sm font-black text-red-400">
                        ×
                      </div>

                      <p className="text-sm leading-7 text-white/60">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </ReportSection>

            {/* VEREDITO */}

            <section className="relative overflow-hidden rounded-[34px] border border-yellow-500/25 bg-gradient-to-br from-yellow-500/[0.12] via-yellow-500/[0.035] to-transparent p-8 md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-yellow-400/[0.08] blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-xs font-black text-black">
                    09
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">
                    Veredito final
                  </span>
                </div>

                <h3 className="mt-7 max-w-4xl text-2xl font-black leading-tight md:text-4xl">
                  {paidReport.finalVerdict}
                </h3>

                <div className="mt-8 h-px w-full bg-yellow-500/10" />

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/25">
                  ARISTOCRATAS NO TOPO.
                </p>
              </div>
            </section>
          </section>
        )}

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <footer className="mt-20 border-t border-white/5 py-10 text-center">
          <p className="text-xs font-black tracking-[0.25em] text-white/30">
            ARISTOCRATAS NO TOPO.
          </p>

          <p className="mt-2 text-[10px] text-white/15">
            ARISTO IA — DIAGNÓSTICO COMERCIAL
          </p>
        </footer>
      </div>
    </main>
  );
}

// =====================================================
// DECISION STEP
// =====================================================

function DecisionStep({
  number,
  text,
  active,
}: {
  number: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        active
          ? "text-yellow-400"
          : "text-white/25"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-black ${
          active
            ? "bg-yellow-400 text-black"
            : "bg-white/5"
        }`}
      >
        {number}
      </span>

      <span className="text-xs font-bold">
        {text}
      </span>
    </div>
  );
}

// =====================================================
// SCORE CARD
// =====================================================

function ScoreCard({
  title,
  subtitle,
  score,
  isBottleneck,
}: {
  title: string;
  subtitle: string;
  score: number;
  isBottleneck?: boolean;
}) {
  const color =
    score < 4
      ? "text-red-400"
      : score < 7
      ? "text-yellow-400"
      : "text-green-400";

  const barColor =
    score < 4
      ? "bg-red-400"
      : score < 7
      ? "bg-yellow-400"
      : "bg-green-400";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 transition ${
        isBottleneck
          ? "border-yellow-500/30 bg-yellow-500/[0.045]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      {isBottleneck && (
        <div className="absolute right-4 top-4 rounded-full bg-yellow-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-yellow-400">
          Gargalo
        </div>
      )}

      <p className="text-sm font-bold">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-white/25">
        {subtitle}
      </p>

      <div className="mt-6 flex items-end justify-between">
        <span
          className={`text-3xl font-black ${color}`}
        >
          {Number(score).toFixed(1)}
        </span>

        <span className="mb-1 text-xs text-white/20">
          /10
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${Math.min(
              100,
              Math.max(0, score * 10)
            )}%`,
          }}
        />
      </div>

      {isBottleneck && (
        <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-yellow-400/60">
          Prioridade atual
        </p>
      )}
    </div>
  );
}

// =====================================================
// LOCKED PREVIEW
// =====================================================

function LockedPreview({
  number,
  title,
  description,
  preview,
}: {
  number: string;
  title: string;
  description: string;
  preview: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-[10px] font-black text-yellow-400">
          {number}
        </span>

        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
          Prévia
        </span>
      </div>

      <h3 className="mt-5 text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-white/35">
        {description}
      </p>

      <div className="relative mt-6 overflow-hidden rounded-xl border border-white/5 bg-black/40 p-4">
        <p className="whitespace-pre-line text-xs leading-6 text-white/35 blur-[2px]">
          {preview}
        </p>

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <span className="rounded-full border border-yellow-500/20 bg-[#0b0b0b]/90 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-yellow-400">
            Liberar no relatório
          </span>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// UNLOCK FEATURE
// =====================================================

function UnlockFeature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/7 bg-black/20 p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-[9px] font-black text-yellow-400">
        {icon}
      </span>

      <div>
        <p className="text-xs font-black">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-5 text-white/30">
          {text}
        </p>
      </div>
    </div>
  );
}

// =====================================================
// VALUE CARD
// =====================================================

function ValueCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <span className="text-[10px] font-black tracking-[0.2em] text-yellow-400">
        {number}
      </span>

      <h3 className="mt-4 text-lg font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-white/35">
        {text}
      </p>
    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 break-words text-sm leading-6 text-white/60">
        {value || "Não informado"}
      </p>
    </div>
  );
}

// =====================================================
// REPORT SECTION
// =====================================================

function ReportSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-[28px] border border-white/10 bg-white/[0.025] p-7 md:p-9">
      <div className="mb-7 flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-[10px] font-black text-yellow-400">
          {eyebrow}
        </div>

        <div>
          <h3 className="text-2xl font-black">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-white/30">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

// =====================================================
// REPORT LIST
// =====================================================

function ReportList({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: "green" | "red";
}) {
  const styles =
    color === "green"
      ? "border-green-500/10 bg-green-500/[0.035]"
      : "border-red-500/10 bg-red-500/[0.035]";

  const iconColor =
    color === "green"
      ? "text-green-400"
      : "text-red-400";

  return (
    <div
      className={`rounded-2xl border p-6 ${styles}`}
    >
      <h4 className="text-sm font-black">
        {title}
      </h4>

      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex gap-3 text-sm leading-6 text-white/55"
          >
            <span
              className={`mt-0.5 font-black ${iconColor}`}
            >
              {color === "green"
                ? "✓"
                : "!"}
            </span>

            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// PLAN DETAIL
// =====================================================

function PlanDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-xs leading-6 text-white/45">
        {value}
      </p>
    </div>
  );
}
