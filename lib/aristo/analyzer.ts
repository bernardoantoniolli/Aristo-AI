import type {
  AnalysisInput,
  AnalysisResult,
  AnalysisScores,
  ActionPlanItem,
  CreativeTest,
  PaidReport,
} from "./types";

import { analyzeWithAI } from "./ai";

function clamp(
  value: number,
  min = 0,
  max = 10
) {
  return Math.max(min, Math.min(max, value));
}

function hasAny(
  text: string,
  terms: string[]
) {
  const normalized = text.toLowerCase();

  return terms.some((term) =>
    normalized.includes(term.toLowerCase())
  );
}

function uniqueStrings(
  values: string[]
) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

// ==========================================
// PAID REPORT
// ==========================================

function buildPaidReport(
  input: AnalysisInput,
  result: {
    score: number;
    scores: AnalysisScores;
    mainBottleneck: AnalysisResult["mainBottleneck"];
    decision: string;
    recommendation: string;
    creativeAngles: string[];
    tests: CreativeTest[];
  }
): PaidReport {
  const {
    score,
    scores,
    mainBottleneck,
    creativeAngles,
    tests,
  } = result;

  // ==========================================
  // FORÇAS
  // ==========================================

  const strengths: string[] = [];

  if (scores.offer >= 7) {
    strengths.push(
      "A oferta apresenta uma proposta clara e com potencial de diferenciação."
    );
  }

  if (scores.conversion >= 7) {
    strengths.push(
      "A página apresenta elementos importantes para reduzir objeções e gerar conversão."
    );
  }

  if (scores.acquisition >= 7) {
    strengths.push(
      "A comunicação apresenta material suficiente para explorar diferentes ângulos de aquisição."
    );
  }

  if (scores.economics >= 7) {
    strengths.push(
      "A estrutura econômica apresenta condições iniciais favoráveis para testes de aquisição."
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      "A principal vantagem atual é existir uma oferta concreta que pode ser testada, medida e melhorada."
    );
  }

  // ==========================================
  // TOP PROBLEMAS
  // ==========================================

  const problemByCategory: Record<
    string,
    string
  > = {
    Oferta:
      "A promessa e a diferenciação precisam ficar mais específicas para aumentar o valor percebido.",

    Conversão:
      "A página precisa reduzir mais objeções e transformar melhor a atenção recebida em ação.",

    Aquisição:
      "A operação precisa de mais ângulos de comunicação para encontrar mensagens capazes de gerar tráfego qualificado.",

    Economia:
      "Antes de aumentar investimento, é necessário entender melhor CPA, margem, reembolso, LTV e capacidade de reinvestimento.",
  };

  const topProblems = uniqueStrings([
    `Gargalo principal: ${mainBottleneck.category}.`,

    mainBottleneck.explanation,

    problemByCategory[
      mainBottleneck.category
    ] || "",

    score < 70
      ? "A oferta ainda precisa de validação antes de receber escala agressiva."
      : "A oferta apresenta sinais suficientes para entrar em uma rotina estruturada de testes.",
  ]).slice(0, 4);

  // ==========================================
  // PLANO DE AÇÃO
  // ==========================================

  const actionPlan: ActionPlanItem[] = [
    {
      priority: 1,

      action: `Corrigir o gargalo de ${mainBottleneck.category}.`,

      reason:
        mainBottleneck.explanation,

      metric:
        mainBottleneck.category === "Oferta"
          ? "Taxa de conversão e valor percebido"
          : mainBottleneck.category === "Conversão"
            ? "Taxa de conversão da página"
            : mainBottleneck.category === "Aquisição"
              ? "CTR e CPA"
              : "CPA, margem e retorno sobre investimento",

      successCriteria:
        "A nova versão deve apresentar melhora mensurável em relação ao controle antes de receber mais orçamento.",
    },

    {
      priority: 2,

      action:
        "Criar pelo menos 3 novas hipóteses de comunicação.",

      reason:
        "Uma única mensagem não permite descobrir qual problema, promessa ou mecanismo gera maior resposta do mercado.",

      metric:
        "CTR, CPC e taxa de conversão",

      successCriteria:
        "Identificar pelo menos uma hipótese com desempenho claramente superior ao controle.",
    },

    {
      priority: 3,

      action:
        "Testar novos criativos mantendo a mesma oferta.",

      reason:
        "Separar criativo de oferta permite descobrir se o problema está na mensagem ou na estrutura comercial.",

      metric:
        "CTR, CPA e taxa de conversão",

      successCriteria:
        "Encontrar um criativo vencedor sem piorar significativamente o CPA.",
    },

    {
      priority: 4,

      action:
        "Documentar os vencedores e eliminar hipóteses fracas.",

      reason:
        "O aprendizado precisa virar patrimônio operacional em vez de desaparecer a cada novo teste.",

      metric:
        "Percentual de testes vencedores",

      successCriteria:
        "Construir uma biblioteca organizada de hooks, ângulos, criativos e ofertas vencedoras.",
    },
  ];

  // ==========================================
  // HOOKS
  // ==========================================

  const hooks = uniqueStrings([
    `O erro que impede ${input.audience} de alcançar ${input.promise}.`,

    `Se você é ${input.audience}, preste atenção nisso antes de tentar ${input.promise}.`,

    `Por que ${input.problem} continua acontecendo mesmo quando você tenta resolver?`,

    `A forma tradicional de resolver ${input.problem} pode estar fazendo você perder tempo.`,

    `Descubra o que realmente precisa mudar para ${input.promise}.`,

    ...creativeAngles,
  ])
    .slice(0, 8)
    .map(
      (hook, index) =>
        `${index + 1}. ${hook}`
    );

  // ==========================================
  // ÂNGULOS
  // ==========================================

  const angles = uniqueStrings([
    `Dor: explorar o custo de continuar enfrentando ${input.problem}.`,

    `Erro: mostrar os erros mais comuns cometidos por ${input.audience}.`,

    `Mecanismo: explicar por que o método usado pela oferta funciona de forma diferente.`,

    `Resultado: apresentar uma visão concreta de como chegar a ${input.promise}.`,

    `Contrarian: questionar uma crença comum relacionada a ${input.problem}.`,

    `Prova: utilizar resultados, casos ou demonstrações para diminuir desconfiança.`,

    `Comparação: mostrar por que alternativas tradicionais podem gerar mais dificuldade.`,

    `Simplicidade: apresentar uma maneira mais simples de atacar ${input.problem}.`,

    ...creativeAngles,
  ]).slice(0, 10);

  // ==========================================
  // COPIES
  // ==========================================

  const adCopies = angles
    .slice(0, 5)
    .map(
      (angle) =>
        `${angle}

Se você é ${input.audience} e enfrenta ${input.problem}, existe uma forma mais estruturada de buscar ${input.promise}.

Apresente o mecanismo da solução, mostre uma prova concreta e termine com uma chamada para ação específica.`
    );

  // ==========================================
  // CRIATIVOS
  // ==========================================

  const creatives = tests
    .slice(0, 5)
    .map(
      (test) =>
        `${test.title} — ${test.action}`
    );

  // ==========================================
  // VEREDITO
  // ==========================================

  let finalVerdict =
    "A oferta precisa de correções antes de receber escala.";

  if (score >= 75) {
    finalVerdict =
      "A oferta apresenta sinais fortes o suficiente para entrar em uma rotina de testes de aquisição e buscar escala com controle.";
  } else if (score >= 55) {
    finalVerdict =
      "Existe potencial comercial, mas o gargalo principal precisa ser corrigido e validado antes de aumentar significativamente o investimento.";
  } else if (score >= 40) {
    finalVerdict =
      "A oferta possui elementos aproveitáveis, porém ainda existem problemas relevantes. O próximo passo deve ser validação, não escala.";
  }

  // ==========================================
  // NÃO FAZER
  // ==========================================

  const whatNotToDo = [
    "Não aumente agressivamente o orçamento antes de validar o gargalo principal.",

    "Não altere oferta, página, criativo e público ao mesmo tempo. Você precisa saber o que causou o resultado.",

    "Não tome decisões importantes com base em um único dia de dados.",

    "Não mantenha uma hipótese ruim apenas porque ela parece boa no papel.",

    "Não confunda mais tráfego com uma oferta melhor. Tráfego amplifica aquilo que já existe.",
  ];

  // ==========================================
  // RETORNO
  // ==========================================

  return {
    executiveDiagnosis: {
      summary:
        `A oferta "${input.product}" recebeu ${score}/100. O principal gargalo identificado foi ${mainBottleneck.category}. A prioridade é corrigir essa variável antes de aumentar o volume de aquisição.`,

      strengths,

      weaknesses:
        topProblems,

      opportunity:
        `A oportunidade mais imediata está em transformar o gargalo de ${mainBottleneck.category} em uma sequência de testes controlados. O objetivo é descobrir uma versão comercialmente superior antes de colocar mais dinheiro na operação.`,
    },

    topProblems,

    actionPlan,

    creativePackage: {
      hooks,
      angles,
      adCopies,
      creatives,
    },

    whatNotToDo,

    finalVerdict,
  };
}

// ==========================================
// ENGINE LOCAL
// ==========================================

function createLocalAnalysis(
  input: AnalysisInput
): AnalysisResult {
  const page = input.pageContent;

  const pageText = [
    page?.title || "",
    page?.description || "",
    ...(page?.headings || []),
    page?.bodyText || "",
    ...(page?.faq || []),
    ...(page?.testimonials || []),
  ].join(" ");

  const lowerText =
    pageText.toLowerCase();

  // ==========================================
  // OFERTA
  // ==========================================

  let offer = 4;

  if (input.product.length >= 15) {
    offer += 1;
  }

  if (input.promise.length >= 25) {
    offer += 1;
  }

  if (
    hasAny(lowerText, [
      "resultado",
      "transforme",
      "aprenda",
      "aumente",
      "reduza",
      "economize",
      "conquiste",
      "ganhe",
    ])
  ) {
    offer += 1;
  }

  if (
    hasAny(lowerText, [
      "como funciona",
      "método",
      "metodo",
      "passo a passo",
      "sistema",
      "processo",
      "framework",
    ])
  ) {
    offer += 1;
  }

  if (
    hasAny(lowerText, [
      "diferente",
      "exclusivo",
      "único",
      "unico",
      "especial",
      "por que nós",
      "por que você",
      "por que voce",
    ])
  ) {
    offer += 1;
  }

  if (
    input.audience.length >= 20 &&
    input.problem.length >= 20
  ) {
    offer += 1;
  }

  offer = clamp(offer);

  // ==========================================
  // CONVERSÃO
  // ==========================================

  let conversion = 3;

  const ctaCount =
    page?.ctas?.length || 0;

  const testimonialCount =
    page?.testimonials?.length || 0;

  const faqCount =
    page?.faq?.length || 0;

  const priceCount =
    page?.prices?.length || 0;

  if (ctaCount >= 1) {
    conversion += 1;
  }

  if (ctaCount >= 3) {
    conversion += 1;
  }

  if (priceCount >= 1) {
    conversion += 1;
  }

  if (testimonialCount >= 1) {
    conversion += 1;
  }

  if (testimonialCount >= 3) {
    conversion += 1;
  }

  if (faqCount >= 2) {
    conversion += 1;
  }

  if (
    hasAny(lowerText, [
      "garantia",
      "7 dias",
      "7 dia",
      "reembolso",
      "risco zero",
    ])
  ) {
    conversion += 1;
  }

  if (
    hasAny(lowerText, [
      "bônus",
      "bonus",
      "inclui",
      "você recebe",
      "voce recebe",
    ])
  ) {
    conversion += 1;
  }

  conversion = clamp(conversion);

  // ==========================================
  // AQUISIÇÃO
  // ==========================================

  let acquisition = 4;

  if (
    hasAny(lowerText, [
      "dor",
      "problema",
      "erro",
      "dificuldade",
      "desafio",
      "medo",
      "frustração",
      "frustracao",
    ])
  ) {
    acquisition += 1;
  }

  if (
    hasAny(lowerText, [
      "quem é",
      "quem e",
      "para quem",
      "ideal para",
      "feito para",
      "se você",
      "se voce",
    ])
  ) {
    acquisition += 1;
  }

  if (
    hasAny(lowerText, [
      "antes e depois",
      "caso real",
      "resultado real",
      "depoimento",
      "aluno",
      "cliente",
    ])
  ) {
    acquisition += 1;
  }

  if (
    hasAny(lowerText, [
      "facebook",
      "instagram",
      "google",
      "youtube",
      "whatsapp",
      "anúncio",
      "anuncio",
    ])
  ) {
    acquisition += 1;
  }

  if (pageText.length > 5000) {
    acquisition += 1;
  }

  if (
    input.audience.length >= 20 &&
    input.problem.length >= 20
  ) {
    acquisition += 1;
  }

  acquisition = clamp(acquisition);

  // ==========================================
  // ECONOMIA
  // ==========================================

  let economics = 4;

  if (input.price > 0) {
    economics += 1;
  }

  if (
    input.monthlyBudget &&
    input.monthlyBudget > 0
  ) {
    economics += 1;
  }

  if (input.price >= 97) {
    economics += 1;
  }

  if (input.price >= 197) {
    economics += 1;
  }

  if (
    hasAny(lowerText, [
      "upsell",
      "order bump",
      "recorrência",
      "recorrencia",
      "plano",
      "mensal",
      "assinatura",
      "lifetime",
    ])
  ) {
    economics += 1;
  }

  if (
    hasAny(lowerText, [
      "lifetime",
      "alto valor",
      "premium",
      "premium",
    ])
  ) {
    economics += 1;
  }

  economics = clamp(economics);

  // ==========================================
  // SCORES
  // ==========================================

  const scores: AnalysisScores = {
    offer,
    conversion,
    acquisition,
    economics,
  };

  // ==========================================
  // SCORE GERAL
  // ==========================================

  const score = Math.round(
    offer * 3 +
      conversion * 2.5 +
      acquisition * 2.5 +
      economics * 2
  );

  // ==========================================
  // GARGALO
  // ==========================================

  const categories = [
    {
      key: "Oferta",

      value: offer,

      explanation:
        "A oferta ainda precisa ficar mais clara, específica ou diferenciada.",
    },

    {
      key: "Conversão",

      value: conversion,

      explanation:
        "A página apresenta sinais insuficientes para transformar tráfego em compradores.",
    },

    {
      key: "Aquisição",

      value: acquisition,

      explanation:
        "A comunicação ainda não apresenta sinais fortes o suficiente para sustentar uma operação de aquisição previsível.",
    },

    {
      key: "Economia",

      value: economics,

      explanation:
        "Ainda faltam elementos suficientes para avaliar com segurança a capacidade econômica de escalar a operação.",
    },
  ];

  const weakest = categories.reduce(
    (a, b) =>
      a.value < b.value ? a : b
  );

  const severity =
    weakest.value <= 3
      ? "high"
      : weakest.value <= 6
        ? "medium"
        : "low";

  // ==========================================
  // ÂNGULOS
  // ==========================================

  const creativeAngles = uniqueStrings([
    `O problema que ${input.audience} continua enfrentando`,

    `O erro que impede ${input.audience} de chegar ao resultado`,

    `Como alcançar ${input.promise}`,

    `O método por trás de ${input.product}`,

    `Antes de comprar ${input.product}, descubra isso`,

    `Por que soluções tradicionais não resolvem ${input.problem}`,

    `O caminho mais simples para ${input.promise}`,

    `O que ninguém explica sobre ${input.problem}`,

    `3 sinais de que você está fazendo ${input.problem} do jeito errado`,

    `A nova forma de resolver ${input.problem}`,
  ]);

  // ==========================================
  // TESTES
  // ==========================================

  const tests: CreativeTest[] = [
    {
      title: "Nova promessa",

      hypothesis:
        "Uma promessa mais específica pode aumentar a atenção e a conversão.",

      action:
        "Criar uma segunda versão do título principal focada em um resultado específico.",

      metric:
        "CTR e taxa de conversão",
    },

    {
      title: "Novo ângulo",

      hypothesis:
        "Atacar diretamente a principal dor pode gerar mais interesse.",

      action:
        "Criar 3 anúncios explorando dores diferentes do público.",

      metric:
        "CTR e CPA",
    },

    {
      title: "Prova",

      hypothesis:
        "Mais evidências podem reduzir objeções.",

      action:
        "Adicionar depoimentos, casos, números ou demonstrações reais.",

      metric:
        "Conversão da página",
    },

    {
      title: "CTA",

      hypothesis:
        "Uma chamada orientada ao benefício pode aumentar a ação.",

      action:
        "Testar um CTA específico relacionado ao resultado desejado.",

      metric:
        "Taxa de clique",
    },

    {
      title: "Oferta",

      hypothesis:
        "Uma composição mais clara de benefícios pode aumentar o valor percebido.",

      action:
        "Testar uma nova combinação de benefício principal, mecanismo e bônus.",

      metric:
        "Conversão e receita por visitante",
    },
  ];

  // ==========================================
  // DECISÃO
  // ==========================================

  const decision =
    score >= 75
      ? "A oferta apresenta sinais suficientes para iniciar testes de aquisição e otimização."

      : score >= 55
        ? "Existe potencial, mas o gargalo identificado precisa ser corrigido antes de uma escala agressiva."

        : "Não escale ainda. Corrija o gargalo principal antes de colocar volume significativo de tráfego.";

  // ==========================================
  // RECOMENDAÇÃO
  // ==========================================

  const recommendation =
    weakest.key === "Oferta"
      ? "Reconstrua primeiro a promessa, o mecanismo e a diferenciação da oferta."

      : weakest.key === "Conversão"
        ? "Otimize a página, provas, CTA e redução de objeções antes de aumentar o tráfego."

        : weakest.key === "Aquisição"
          ? "Construa novos ângulos e criativos antes de aumentar o orçamento."

          : "Mapeie CPA, margem, reembolso, LTV e capacidade de investimento antes de escalar.";

  // ==========================================
  // RESULTADO BASE
  // ==========================================

  const analysisResult: AnalysisResult = {
    score,

    scores,

    status:
      score < 40
        ? "red"
        : score < 70
          ? "yellow"
          : "green",

    mainBottleneck: {
      category: weakest.key,

      severity,

      explanation:
        weakest.explanation,
    },

    decision,

    recommendation,

    creativeAngles,

    tests,
  };

  // ==========================================
  // RELATÓRIO PAGO
  // ==========================================

  analysisResult.paidReport =
    buildPaidReport(
      input,
      analysisResult
    );

  return analysisResult;
}

// ==========================================
// ENGINE PRINCIPAL
// ==========================================

export async function analyze(
  input: AnalysisInput
): Promise<AnalysisResult> {
  // ==========================================
  // TENTA IA PRIMEIRO
  // ==========================================

  if (process.env.OPENAI_API_KEY) {
    try {
      const aiResult =
        await analyzeWithAI(input);

      // Garante que o caminho da IA também
      // possua o relatório pago.
      if (!aiResult.paidReport) {
        aiResult.paidReport =
          buildPaidReport(
            input,
            aiResult
          );
      }

      return aiResult;
    } catch (error) {
      console.warn(
        "OpenAI indisponível. Usando Aristo Engine local.",
        error
      );
    }
  }

  // ==========================================
  // FALLBACK LOCAL
  // ==========================================

  return createLocalAnalysis(input);
}
