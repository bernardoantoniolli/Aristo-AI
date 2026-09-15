"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PagamentoSucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const analysisId = searchParams.get("analysisId");

  const [status, setStatus] = useState("Verificando pagamento...");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!analysisId) {
      setStatus("Análise não identificada.");
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkPayment() {
      try {
        const response = await fetch(`/api/payment/${analysisId}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) return;

        if (data.approved) {
          setStatus("Pagamento aprovado. Liberando seu relatório...");

          setTimeout(() => {
            router.replace(`/resultado/${analysisId}`);
          }, 1000);

          return;
        }

        setAttempts((current) => {
          const next = current + 1;

          if (next >= 30) {
            setStatus(
              "Ainda não recebemos a confirmação do pagamento. Você pode verificar novamente em alguns instantes."
            );

            return next;
          }

          setStatus("Pagamento recebido. Aguardando confirmação...");

          timeoutId = setTimeout(checkPayment, 3000);

          return next;
        });
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);

        if (!cancelled) {
          setStatus(
            "Não foi possível verificar o pagamento agora. Tentaremos novamente."
          );

          timeoutId = setTimeout(checkPayment, 3000);
        }
      }
    }

    checkPayment();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [analysisId, router]);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center shadow-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <span className="text-2xl text-yellow-400">✓</span>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Aristo AI
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Estamos confirmando seu pagamento.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            Assim que o Mercado Pago confirmar a transação, seu relatório
            estratégico será liberado automaticamente.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-yellow-400" />

            <p className="text-sm font-medium text-zinc-200">{status}</p>
          </div>

          {analysisId && (
            <p className="mt-6 break-all text-xs text-zinc-600">
              Análise: {analysisId}
            </p>
          )}

          {attempts >= 30 && analysisId && (
            <button
              onClick={() => router.replace(`/resultado/${analysisId}`)}
              className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Verificar meu relatório
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function LoadingPagamento() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-yellow-400" />

          <p className="text-sm text-zinc-400">
            Carregando confirmação...
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense fallback={<LoadingPagamento />}>
      <PagamentoSucessoContent />
    </Suspense>
  );
}
