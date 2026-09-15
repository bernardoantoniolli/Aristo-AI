export default function PagamentoFalhou() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="text-5xl mb-6">✕</div>

        <h1 className="text-3xl font-bold mb-4">
          Pagamento não concluído
        </h1>

        <p className="text-zinc-400">
          Não conseguimos confirmar o pagamento.
          Você pode voltar ao seu diagnóstico e tentar novamente.
        </p>
      </div>
    </main>
  );
}
