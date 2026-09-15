"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PagamentoSucesso() {
  const searchParams = useSearchParams();

  const analysisId =
    searchParams.get("analysisId");

  const [status, setStatus] = useState(
    "Verificando pagamento..."
  );

  useEffect(() => {
    if (!analysisId) {
      setStatus(
        "Não encontramos a análise vinculada ao pagamento."
      );
      return;
    }

    let attempts = 0;
    const maxAttempts = 30;

    let timeout: NodeJS.Timeout;

    const checkPayment = async () => {
      try {
        const response = await fetch(
          `/api/payment/${analysisId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data.approved) {
          setStatus(
            "Pagamento confirmado! Liberando seu relatório..."
          );

          window.location.href =
            `/resultado/${analysisId}`;

          return;
        }

        attempts++;

        if (attempts < maxAttempts) {
          setStatus(
            `Aguardando confirmação do pagamento...`
          );

          timeout = setTimeout(
            checkPayment,
            3000
          );

          return;
        }

        setStatus(
          "O pagamento foi recebido, mas a confirmação ainda está sendo processada. Aguarde alguns segundos e atualize a página."
        );
      } catch (error) {
        console.error(
          "Erro ao verificar pagamento:",
          error
        );

        attempts++;

        if (attempts < maxAttempts) {
          timeout = setTimeout(
            checkPayment,
            3000
          );
        } else {
          setStatus(
            "Não foi possível confirmar o pagamento automaticamente."
          );
        }
      }
    };

    checkPayment();

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [analysisId]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">

        <div className="mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/30 bg-yellow-500/10">
            <span className="text-4xl">
              🫎
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Quase lá.
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed">
          {status}
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-gray-500">
            Não feche esta página enquanto
            verificamos a confirmação.
          </p>
        </div>

      </div>
    </main>
  );
}
