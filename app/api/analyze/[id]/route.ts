import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AnalysisResult } from "@/lib/aristo/types";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await context.params;

    // ==========================================
    // VALIDA ID
    // ==========================================

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da análise não informado.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // SUPABASE
    // ==========================================

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecret =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Configuração do Supabase não encontrada.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret
    );

    // ==========================================
    // BUSCA ANÁLISE
    // ==========================================

    const {
      data: analysis,
      error: analysisError,
    } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        {
          success: false,
          error: "Análise não encontrada.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // BUSCA RESULTADO
    // ==========================================

    const {
      data: resultRow,
      error: resultError,
    } = await supabase
      .from("analysis_results")
      .select("*")
      .eq("analysis_id", id)
      .single();

    if (resultError || !resultRow) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resultado da análise não encontrado.",
        },
        { status: 404 }
      );
    }

    const result =
      resultRow.result as AnalysisResult;

    // ==========================================
    // RESULTADO GRATUITO
    // ==========================================
    //
    // IMPORTANTE:
    //
    // O paidReport NÃO é enviado aqui.
    //
    // O relatório completo só pode ser acessado
    // através de:
    //
    // /api/analyze/[id]/full
    //
    // depois da confirmação do pagamento.
    //
    // ==========================================

    const freeResult = {
      score: result.score ?? 0,

      scores: {
        offer: result.scores?.offer ?? 0,

        conversion:
          result.scores?.conversion ?? 0,

        acquisition:
          result.scores?.acquisition ?? 0,

        economics:
          result.scores?.economics ?? 0,
      },

      status: result.status ?? null,

      mainBottleneck:
        result.mainBottleneck ?? null,

      decision:
        result.decision ?? null,

      recommendation:
        result.recommendation ?? null,

      creativeAngles:
        result.creativeAngles ?? [],

      tests:
        result.tests ?? [],

      createdAt:
        resultRow.created_at,
    };

    // ==========================================
    // RESPOSTA
    // ==========================================

    return NextResponse.json({
      success: true,

      analysis: {
        id: analysis.id,

        url: analysis.url,

        product: analysis.product,

        audience: analysis.audience,

        problem: analysis.problem,

        promise: analysis.promise,

        price: analysis.price,

        channel: analysis.channel,

        monthlyBudget:
          analysis.monthly_budget,

        status: analysis.status,

        createdAt:
          analysis.created_at,
      },

      result: freeResult,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar análise:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar análise.",
      },
      { status: 500 }
    );
  }
}
