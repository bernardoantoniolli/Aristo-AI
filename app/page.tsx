import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* HEADER */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8a96b]/40 bg-[#c8a96b]/5 text-lg text-[#c8a96b] shadow-[0_0_30px_rgba(200,169,107,0.08)]">
            ♞
          </div>

          <div>
            <div className="text-sm font-bold tracking-[0.28em]">
              ARISTO IA
            </div>

            <div className="mt-0.5 text-[9px] tracking-[0.25em] text-zinc-600">
              INTELIGÊNCIA COMERCIAL
            </div>
          </div>
        </Link>

        <Link
          href="/analisar"
          className="hidden rounded-lg border border-zinc-800 px-5 py-2.5 text-xs font-semibold tracking-wide text-zinc-300 transition hover:border-[#c8a96b]/40 hover:text-[#c8a96b] sm:block"
        >
          ANALISAR OFERTA
        </Link>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#c8a96b]/5 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c8a96b]/20 bg-[#c8a96b]/5 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-[#c8a96b]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96b] shadow-[0_0_8px_#c8a96b]" />
                DIAGNÓSTICO COMERCIAL COM IA
              </div>

              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[76px]">
                Descubra o que está
                <br />
                <span className="text-[#c8a96b]">
                  impedindo sua oferta
                </span>
                <br />
                de vender mais.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
                Coloque sua página de vendas no Aristo IA. A inteligência
                comercial analisa sua oferta, aquisição, conversão e
                economia para encontrar o gargalo que merece sua atenção
                primeiro.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/analisar"
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#c8a96b] px-7 py-4 text-sm font-bold text-black shadow-[0_15px_50px_rgba(200,169,107,0.12)] transition hover:bg-[#d8bb7b] hover:shadow-[0_15px_60px_rgba(200,169,107,0.2)]"
                >
                  ANALISAR MINHA OFERTA
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <div className="flex items-center justify-center gap-2 px-2 text-xs text-zinc-600 sm:justify-start">
                  <span className="text-[#c8a96b]">✓</span>
                  Diagnóstico inicial gratuito
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-[11px] text-zinc-600">
                <span>✓ Sem cartão</span>
                <span>✓ Análise em minutos</span>
                <span>✓ Decisão baseada em dados</span>
              </div>
            </div>

            <div className="relative">
              <ScoreCard />
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-y border-zinc-900 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
              O PROBLEMA
            </span>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Seu problema pode não ser
              <br />
              <span className="text-zinc-600">falta de tráfego.</span>
            </h2>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-500">
              Quando uma oferta não performa, aumentar o orçamento nem sempre
              resolve. Antes de escalar, você precisa saber exatamente onde
              está perdendo dinheiro.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900 md:grid-cols-3">
            <ProblemCard
              number="01"
              title="Oferta"
              description="Sua promessa é forte o suficiente para fazer alguém querer comprar?"
            />

            <ProblemCard
              number="02"
              title="Aquisição"
              description="Você possui ângulos e criativos suficientes para encontrar compradores?"
            />

            <ProblemCard
              number="03"
              title="Conversão"
              description="Sua página transforma atenção em desejo, confiança e ação?"
            />
          </div>
        </div>
      </section>

      {/* ARISTO SCORE */}
      <section className="relative">
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[#c8a96b]/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
                ARISTO SCORE
              </span>

              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Pare de testar
                <br />
                <span className="text-zinc-600">no escuro.</span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-500">
                O Aristo transforma sua oferta em uma leitura comercial
                objetiva. Você descobre onde está o gargalo e qual deveria
                ser o próximo movimento.
              </p>

              <div className="mt-10 space-y-5">
                <Feature
                  number="01"
                  title="Encontra o gargalo"
                  description="Identifica o ponto que mais limita sua operação."
                />

                <Feature
                  number="02"
                  title="Prioriza o problema"
                  description="Nem todo problema merece atenção agora."
                />

                <Feature
                  number="03"
                  title="Indica o próximo teste"
                  description="Você sai com uma direção prática para agir."
                />
              </div>
            </div>

            <ScorePreview />
          </div>
        </div>
      </section>

      {/* THREE BRAINS */}
      <section className="border-y border-zinc-900 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
              COMO O ARISTO PENSA
            </span>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Três pontos.
              <br />
              <span className="text-zinc-600">Uma decisão.</span>
            </h2>

            <p className="mt-6 text-sm leading-7 text-zinc-500">
              O Aristo não foi criado para gerar texto bonito. Foi criado para
              ajudar você a tomar decisões comerciais melhores.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            <BrainCard
              index="01"
              title="OFERTA"
              description="Analisa promessa, mecanismo, percepção de valor, preço e clareza da oferta."
            />

            <BrainCard
              index="02"
              title="MERCADO"
              description="Avalia público, problema, comunicação, diferenciação e oportunidades de aquisição."
            />

            <BrainCard
              index="03"
              title="DECISÃO"
              description="Cruza os sinais e aponta onde você deveria colocar energia antes de escalar."
            />
          </div>
        </div>
      </section>

      {/* OUTPUT */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="grid items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
                DO DIAGNÓSTICO À AÇÃO
              </span>

              <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Não entregue mais
                <br />
                <span className="text-zinc-600">um relatório inútil.</span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-500">
                O objetivo não é encher uma tela com informação. É reduzir a
                distância entre descobrir o problema e saber o que fazer.
              </p>

              <Link
                href="/analisar"
                className="mt-9 inline-flex items-center gap-3 text-sm font-bold text-[#c8a96b] transition hover:text-[#d8bb7b]"
              >
                QUERO ANALISAR MINHA OFERTA
                <span>→</span>
              </Link>
            </div>

            <OutputPreview />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-zinc-900 bg-[#080808]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mb-16">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
              COMO FUNCIONA
            </span>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Do link à decisão.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <HowStep
              number="01"
              title="Envie sua oferta"
              description="Cole a URL da sua página e informe alguns dados."
            />

            <HowStep
              number="02"
              title="O Aristo analisa"
              description="A IA cruza os sinais comerciais da sua operação."
            />

            <HowStep
              number="03"
              title="Veja seu Score"
              description="Receba sua pontuação, gargalo principal e decisão."
            />

            <HowStep
              number="04"
              title="Saiba o que testar"
              description="Aprofunde o diagnóstico e receba um plano de ação."
            />
          </div>
        </div>
      </section>

      {/* OBJECTIONS */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 lg:py-32">
          <div className="text-center">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#c8a96b]">
              ANTES DE COMEÇAR
            </span>

            <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              “Mas eu já tenho tráfego.”
            </h2>
          </div>

          <div className="mt-14 divide-y divide-zinc-900 rounded-2xl border border-zinc-900 bg-[#080808]">
            <Objection
              question="“Minha oferta já vende.”"
              answer="Ótimo. O Aristo não serve apenas para ofertas ruins. Ele ajuda a identificar onde existe espaço para melhorar e o que deveria ser testado antes de colocar mais dinheiro."
            />

            <Objection
              question="“Eu já acompanho minhas métricas.”"
              answer="Continue acompanhando. O Aristo existe para complementar sua leitura e transformar vários sinais em uma prioridade clara."
            />

            <Objection
              question="“E se meu problema for outro?”"
              answer="É exatamente para isso que existe o diagnóstico. Em vez de assumir o problema, primeiro você investiga."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative border-t border-zinc-900 bg-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,169,107,0.08),transparent_55%)]" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c8a96b]/30 bg-[#c8a96b]/5 text-xl text-[#c8a96b]">
            ♞
          </div>

          <h2 className="mt-8 text-4xl font-semibold tracking-tight sm:text-6xl">
            Pare de tentar descobrir
            <br />
            <span className="text-[#c8a96b]">no erro.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
            Coloque sua oferta no Aristo e descubra qual deveria ser seu
            próximo movimento.
          </p>

          <Link
            href="/analisar"
            className="mt-9 inline-flex items-center justify-center rounded-xl bg-[#c8a96b] px-8 py-4 text-sm font-bold text-black transition hover:bg-[#d8bb7b]"
          >
            ANALISAR MINHA OFERTA →
          </Link>

          <p className="mt-5 text-[10px] uppercase tracking-[0.2em] text-zinc-700">
            Diagnóstico inicial gratuito
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-center sm:flex-row sm:text-left lg:px-8">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-zinc-500">
            ARISTO IA
          </p>
          <p className="mt-1 text-[10px] text-zinc-700">
            Inteligência para quem quer vender.
          </p>
        </div>

        <p className="text-[10px] tracking-wider text-zinc-700">
          ARISTOCRATAS NO TOPO.
        </p>
      </footer>
    </main>
  );
}

/* -------------------------------------------------------
   COMPONENTES
------------------------------------------------------- */

function ScoreCard() {
  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute -inset-4 rounded-[30px] bg-[#c8a96b]/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-[#090909] shadow-2xl">
        <div className="border-b border-zinc-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] tracking-[0.25em] text-zinc-600">
                DIAGNÓSTICO ARISTO
              </p>

              <p className="mt-1 text-xs font-medium text-zinc-400">
                Oferta digital
              </p>
            </div>

            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-zinc-800" />
              <span className="h-2 w-2 rounded-full bg-zinc-800" />
              <span className="h-2 w-2 rounded-full bg-[#c8a96b]" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] tracking-[0.25em] text-zinc-600">
                ARISTO SCORE
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-7xl font-semibold tracking-[-0.06em]">
                  68
                </span>

                <span className="mb-3 text-sm text-zinc-700">/100</span>
              </div>
            </div>

            <div className="mb-3 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-[9px] font-semibold tracking-wider text-yellow-500">
              ATENÇÃO
            </div>
          </div>

          <div className="mt-7 grid grid-cols-4 gap-2">
            <ScoreBar label="OFERTA" value="76" />
            <ScoreBar label="CONV." value="71" />
            <ScoreBar label="AQUIS." value="54" active />
            <ScoreBar label="ECON." value="69" />
          </div>

          <div className="my-7 h-px bg-zinc-900" />

          <p className="text-[9px] tracking-[0.2em] text-zinc-600">
            PRINCIPAL GARGALO
          </p>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-2xl font-semibold tracking-tight">
              AQUISIÇÃO
            </p>

            <span className="text-xs text-yellow-500">54/100</span>
          </div>

          <p className="mt-3 text-xs leading-6 text-zinc-500">
            Sua oferta possui potencial, mas existem poucos ângulos de
            comunicação para sustentar uma operação agressiva de criativos.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-[#050505] p-4">
            <p className="text-[8px] tracking-[0.2em] text-zinc-600">
              DECISÃO DO ARISTO
            </p>

            <p className="mt-2 text-xs leading-6 text-zinc-300">
              Não aumentaria o orçamento ainda. Primeiro criaria novos
              ângulos de aquisição e testaria os três mais fortes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  const numericValue = Number(value);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[7px] text-zinc-600">{label}</span>
        <span
          className={`text-[8px] ${
            active ? "text-yellow-500" : "text-zinc-500"
          }`}
        >
          {value}
        </span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full ${
            active ? "bg-yellow-500" : "bg-zinc-600"
          }`}
          style={{ width: `${numericValue}%` }}
        />
      </div>
    </div>
  );
}

function ProblemCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#050505] p-7 transition hover:bg-[#0a0a0a] lg:p-9">
      <span className="text-[10px] font-bold tracking-[0.25em] text-[#c8a96b]">
        {number}
      </span>

      <h3 className="mt-8 text-xl font-semibold">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c8a96b]/20 text-[9px] font-bold text-[#c8a96b]">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function ScorePreview() {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-[#080808] p-6">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-5">
        <div>
          <p className="text-[9px] tracking-[0.25em] text-zinc-600">
            VISÃO COMERCIAL
          </p>

          <p className="mt-1 text-sm font-medium text-zinc-300">
            Diagnóstico da oferta
          </p>
        </div>

        <span className="rounded-full border border-green-500/20 bg-green-500/5 px-2.5 py-1 text-[8px] text-green-500">
          ANÁLISE
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <MiniMetric
          title="OFERTA"
          value="76"
          description="Boa percepção de valor"
          color="bg-[#c8a96b]"
        />

        <MiniMetric
          title="CONVERSÃO"
          value="71"
          description="Página possui fundamentos"
          color="bg-[#c8a96b]"
        />

        <MiniMetric
          title="AQUISIÇÃO"
          value="54"
          description="Poucos ângulos de comunicação"
          color="bg-yellow-500"
        />

        <MiniMetric
          title="ECONOMIA"
          value="69"
          description="Modelo possui espaço para teste"
          color="bg-[#c8a96b]"
        />
      </div>

      <div className="mt-7 rounded-xl border border-yellow-500/10 bg-yellow-500/[0.03] p-5">
        <p className="text-[8px] font-semibold tracking-[0.2em] text-yellow-500">
          PRIORIDADE
        </p>

        <p className="mt-2 text-sm font-semibold">
          Trabalhar aquisição antes de escalar orçamento.
        </p>
      </div>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold tracking-[0.15em] text-zinc-500">
            {title}
          </p>

          <p className="mt-1 text-[11px] text-zinc-600">{description}</p>
        </div>

        <span className="text-lg font-semibold text-zinc-300">{value}</span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BrainCard({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-900 bg-[#050505] p-8 transition hover:-translate-y-1 hover:border-[#c8a96b]/20">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#c8a96b]">{index}</span>

        <span className="text-zinc-800 transition group-hover:text-[#c8a96b]/30">
          ♞
        </span>
      </div>

      <h3 className="mt-12 text-2xl font-semibold tracking-wide">{title}</h3>

      <p className="mt-4 text-sm leading-7 text-zinc-600">{description}</p>
    </div>
  );
}

function OutputPreview() {
  return (
    <div className="relative rounded-2xl border border-zinc-900 bg-[#080808] p-6 shadow-2xl sm:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.25em] text-zinc-600">
          RESULTADO DO DIAGNÓSTICO
        </span>

        <span className="text-[9px] text-[#c8a96b]">ARISTO IA</span>
      </div>

      <div className="mt-8">
        <p className="text-[9px] tracking-[0.2em] text-zinc-700">
          PRINCIPAL GARGALO
        </p>

        <div className="mt-2 flex items-center gap-3">
          <span className="text-3xl font-semibold">Aquisição</span>

          <span className="rounded-full bg-yellow-500/10 px-2.5 py-1 text-[8px] text-yellow-500">
            ALTA PRIORIDADE
          </span>
        </div>
      </div>

      <div className="my-7 h-px bg-zinc-900" />

      <div>
        <p className="text-[9px] tracking-[0.2em] text-zinc-700">
          O QUE ISSO SIGNIFICA
        </p>

        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Sua oferta pode estar preparada para converter, mas sua comunicação
          ainda não possui variedade suficiente para sustentar testes de
          aquisição em escala.
        </p>
      </div>

      <div className="mt-7">
        <p className="text-[9px] tracking-[0.2em] text-zinc-700">
          PRÓXIMO MOVIMENTO
        </p>

        <div className="mt-3 space-y-2">
          <ActionRow text="Criar novos ângulos de comunicação" />
          <ActionRow text="Testar diferentes mecanismos de promessa" />
          <ActionRow text="Priorizar os 3 melhores conceitos" />
        </div>
      </div>

      <div className="mt-7 rounded-xl bg-[#c8a96b] p-5 text-black">
        <p className="text-[9px] font-bold tracking-[0.2em]">
          DECISÃO
        </p>

        <p className="mt-2 text-sm font-semibold leading-6">
          Não aumentaria o orçamento ainda. Primeiro aumentaria a capacidade
          de aquisição.
        </p>
      </div>
    </div>
  );
}

function ActionRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-900 bg-[#050505] px-4 py-3">
      <span className="text-xs text-[#c8a96b]">→</span>
      <span className="text-xs text-zinc-500">{text}</span>
    </div>
  );
}

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative">
      <span className="text-[10px] font-bold tracking-[0.2em] text-[#c8a96b]">
        {number}
      </span>

      <h3 className="mt-5 text-base font-semibold">{title}</h3>

      <p className="mt-3 text-xs leading-6 text-zinc-600">{description}</p>
    </div>
  );
}

function Objection({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="p-6 sm:p-8">
      <h3 className="text-sm font-semibold text-zinc-200">{question}</h3>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">
        {answer}
      </p>
    </div>
  );
}
