import type { AnalysisInput, AnalysisResult } from "./types";

export interface CreativeAsset {
  hook: string;
  angle: string;
  format: string;
  script: string;
  cta: string;
}

export interface CreativePackage {
  hooks: string[];
  angles: string[];
  creatives: CreativeAsset[];
  ads: {
    primaryText: string;
    headline: string;
    cta: string;
  }[];
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function generateCreativePackage(
  input: AnalysisInput,
  analysis: AnalysisResult
): CreativePackage {
  const audience = clean(input.audience);
  const problem = clean(input.problem);
  const promise = clean(input.promise);
  const product = clean(input.product);

  const hooks = [
    `${audience}: pare de tentar resolver ${problem} desse jeito.`,
    `O erro que está impedindo você de ${promise}.`,
    `Se você quer ${promise}, comece corrigindo isso.`,
    `A maioria das pessoas complica ${problem} sem necessidade.`,
    `Antes de investir mais dinheiro, descubra se sua estratégia está errada.`,
    `Por que algumas pessoas conseguem ${promise} enquanto outras continuam travadas?`,
    `Você provavelmente não precisa trabalhar mais. Precisa mudar a estratégia.`,
    `O método simples para começar a resolver ${problem}.`,
    `3 sinais de que você está fazendo ${problem} da maneira errada.`,
    `Existe uma forma mais inteligente de buscar ${promise}.`,
  ];

  const angles = [
    `Dor: explorar o custo de continuar com ${problem}.`,
    `Erro: mostrar o principal erro cometido por ${audience}.`,
    `Oportunidade: apresentar uma maneira diferente de buscar ${promise}.`,
    `Mecanismo: explicar como ${product} resolve o problema.`,
    `Contraste: comparar a abordagem tradicional com uma abordagem mais eficiente.`,
    `Prova: demonstrar resultados ou evidências reais sem inventar números.`,
    `Curiosidade: revelar uma informação que o público normalmente ignora.`,
    `Objeção: responder o principal motivo para não comprar.`,
    `Antes/depois: mostrar a mudança esperada sem prometer resultado garantido.`,
    `Diagnóstico: fazer o público perceber que possui o problema.`,
  ];

  const selectedHooks = hooks.slice(0, 10);
  const selectedAngles = angles.slice(0, 10);

  const creatives: CreativeAsset[] = selectedHooks.slice(0, 5).map(
    (hook, index) => {
      const angle = selectedAngles[index];

      return {
        hook,
        angle,
        format:
          index === 0
            ? "UGC / falando para a câmera"
            : index === 1
              ? "Vídeo curto com cortes rápidos"
              : index === 2
                ? "Carrossel"
                : index === 3
                  ? "Demonstração / tela"
                  : "Story / anúncio vertical",

        script: `
HOOK:
${hook}

DESENVOLVIMENTO:
Apresente rapidamente o problema: ${problem}.

Mostre por que a abordagem comum não resolve bem essa situação.

Apresente ${product} como uma possível solução e explique o mecanismo de forma simples.

Não faça promessas que não possam ser comprovadas.

FECHAMENTO:
Mostre qual é o próximo passo para conhecer a solução.
        `.trim(),

        cta: "Conheça a solução.",
      };
    }
  );

  const ads = selectedHooks.slice(0, 5).map((hook) => ({
    primaryText: `${hook}

Se você se identifica com esse problema, vale entender uma abordagem diferente antes de continuar gastando tempo e dinheiro.

Conheça a solução e veja como ela funciona.`,

    headline: promise,

    cta: "Saiba mais",
  }));

  return {
    hooks: selectedHooks,
    angles: selectedAngles,
    creatives,
    ads,
  };
}
