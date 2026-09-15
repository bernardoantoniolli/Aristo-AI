import { AnalysisInput, AnalysisResult } from "./types";
import { calculateScore, getStatus } from "./scoring";

export function createMockAnalysis(
  input: AnalysisInput
): AnalysisResult {
  const scores = {
    offer: 7,
    conversion: 6,
    acquisition: 5,
    economics: input.price >= 197 ? 7 : 5,
  };

  const score = calculateScore(scores);

  return {
    score,

    scores,

    status: getStatus(score) as "red" | "yellow" | "green",

    mainBottleneck: {
      category: "Aquisição",
      severity: "high",

      explanation:
        "A oferta possui potencial, mas apresenta poucos ângulos de comunicação para sustentar uma operação consistente de aquisição.",
    },

    decision:
      "Não aumentaria o orçamento agora. Primeiro testaria novos ângulos de aquisição.",

    recommendation:
      "Criar três novas abordagens de comunicação para a mesma oferta e testar cada uma com criativos diferentes.",

    creativeAngles: [
      "O erro que impede seu público de alcançar o resultado",
      "O método diferente para resolver o problema",
      "O caminho mais simples para chegar ao resultado",
      "A oportunidade que seu público ainda não percebeu",
      "A prova de que o problema pode ser resolvido",
    ],

    tests: [
      {
        title: "Novo ângulo de dor",
        hypothesis:
          "Uma comunicação centrada no principal problema pode aumentar a relevância do anúncio.",
        action:
          "Criar 3 criativos utilizando o mesmo problema com hooks diferentes.",
        metric: "CPA",
      },
      {
        title: "Nova promessa",
        hypothesis:
          "Uma promessa mais específica pode aumentar a conversão.",
        action:
          "Testar uma promessa mais concreta na página e nos anúncios.",
        metric: "Taxa de conversão",
      },
      {
        title: "Prova",
        hypothesis:
          "Uma prova apresentada antes da explicação pode reduzir objeções.",
        action:
          "Mover um caso real para uma posição mais próxima da promessa.",
        metric: "Conversão",
      },
    ],
  };
}
