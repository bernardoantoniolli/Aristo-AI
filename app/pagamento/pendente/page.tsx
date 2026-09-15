export default function PagamentoPendente() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <div className="text-5xl mb-6">⏳</div>

        <h1 className="text-3xl font-bold mb-4">
          Pagamento pendente
        </h1>

        <p className="text-zinc-400">
          Seu pagamento ainda está sendo processado.
          Assim que for confirmado, seu relatório será liberado.
        </p>
      </div>
    </main>
  );
}
