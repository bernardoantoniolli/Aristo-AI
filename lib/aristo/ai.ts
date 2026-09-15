import OpenAI from "openai";
import type {
  AnalysisInput,
  AnalysisResult,
} from "./types";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  return new OpenAI({
    apiKey,
  });
}

export async function analyzeWithAI(
  input: AnalysisInput
): Promise<AnalysisResult> {
  const openai = getOpenAI();

  const page = input.pageContent;

  const pageData = page
    ? `
===== PÁGINA DE VENDAS CAPTURADA =====

URL:
${page.url}

TÍTULO:
${page.title}

DESCRIÇÃO:
${page.description}

HEADINGS:
${page.headings.join("\n")}

CTAs:
${page.ctas.join("\n")}

PREÇOS ENCONTRADOS:
${page.prices.join("\n")}

FAQ:
${page.faq.join("\n")}

DEPOIMENTOS:
${page.testimonials.join("\n")}

TEXTO PRINCIPAL:
${page.bodyText}

===== FIM DA PÁGINA =====
`
    : `
Nenhuma página de vendas pôde ser capturada.
Faça a análise apenas com os dados fornecidos pelo usuário.
`;

  const systemPrompt = `
Você é o ARISTO ENGINE.

Sua função não é elogiar o produto.

Sua função é encontrar o maior gargalo comercial e determinar
o que deve ser feito para aumentar a capacidade de venda.

Analise:

1. Oferta
2. Conversão
3. Aquisição
4. Economia
5. Clareza da promessa
6. Diferenciação
7. Mecanismo
8. Provas
9. CTA
10. Estrutura da página

REGRAS:

- Seja crítico.
- Não invente provas.
- Não invente números.
- Não trate afirmações da página como fatos comprovados.
- Diferencie fatos observados de hipóteses.
- Priorize o maior impacto comercial.
- Não entregue uma lista genérica de dicas.
- Escolha o principal gargalo.
- Cada teste precisa possuir uma hipótese.
- Diga claramente o que NÃO deve ser feito.
- Se a oferta for ruim, diga que é ruim.
- Se a página for o problema, diga que a página é o problema.
- Se a aquisição for o problema, diga que a aquisição é o problema.

A resposta deve ser SOMENTE JSON válido.

Formato:

{
  "score": 0,
  "scores": {
    "offer": 0,
    "conversion": 0,
    "acquisition": 0,
    "economics": 0
  },
  "status": "red",
  "mainBottleneck": {
    "category": "",
    "severity": "high",
    "explanation": ""
  },
  "decision": "",
  "recommendation": "",
  "creativeAngles": [],
  "tests": [
    {
      "title": "",
      "hypothesis": "",
      "action": "",
      "metric": ""
    }
  ]
}

Score de 0 a 100.

Scores individuais de 0 a 10.

Status:
- red = 0 a 39
- yellow = 40 a 69
- green = 70 a 100
`;

  const userPrompt = `
===== DADOS FORNECIDOS PELO USUÁRIO =====

Produto:
${input.product}

Público:
${input.audience}

Problema:
${input.problem}

Promessa:
${input.promise}

Preço:
R$ ${input.price}

Canal:
${input.channel}

Orçamento mensal:
${input.monthlyBudget ?? "não informado"}

${pageData}

Agora faça o diagnóstico comercial.
`;

  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  const text = response.output_text;

  if (!text) {
    throw new Error("A IA não retornou nenhum resultado.");
  }

  try {
    return JSON.parse(text) as AnalysisResult;
  } catch {
    console.error("Resposta recebida da IA:", text);
    throw new Error("A IA retornou um formato inválido.");
  }
}
