import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyze } from "@/lib/aristo/analyzer";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      url,
      product,
      audience,
      problem,
      promise,
      price,
      channel,
      monthlyBudget,
    } = body;

    // ==========================================
    // VALIDAÇÃO
    // ==========================================

    if (
      !url ||
      !product ||
      !audience ||
      !problem ||
      !promise ||
      !channel
    ) {
      return NextResponse.json(
        {
          error:
            "Preencha todos os campos obrigatórios da análise.",
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
          error:
            "Supabase não está configurado corretamente.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret
    );

    // ==========================================
    // INPUT
    // ==========================================

    const input = {
      url: String(url),
      product: String(product),
      audience: String(audience),
      problem: String(problem),
      promise: String(promise),
      price: Number(price) || 0,
      channel: String(channel),
      monthlyBudget:
        monthlyBudget !== undefined
          ? Number(monthlyBudget) || 0
          : undefined,
    };

    // ==========================================
    // SALVA A ANÁLISE
    // ==========================================

    const { data: analysis, error: analysisError } =
      await supabase
        .from("analyses")
        .insert({
          url: input.url,
          product: input.product,
          audience: input.audience,
          problem: input.problem,
          promise: input.promise,
          price: input.price,
          channel: input.channel,
          monthly_budget:
            input.monthlyBudget ?? null,
          status: "processing",
        })
        .select()
        .single();

    if (analysisError || !analysis) {
      console.error(
        "Erro ao criar análise:",
        analysisError
      );

      return NextResponse.json(
        {
          error: "Não foi possível criar a análise.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // EXECUTA O ARISTO ENGINE
    // ==========================================

    const result = await analyze(input);

    // ==========================================
    // SALVA O RESULTADO
    // ==========================================

    const { error: resultError } = await supabase
  .from("analysis_results")
  .insert({
    analysis_id: analysis.id,

    score: result.score,

    offer_score: result.scores.offer,

    conversion_score: result.scores.conversion,

    acquisition_score: result.scores.acquisition,

    economics_score: result.scores.economics,

    result,
  });

    if (resultError) {
      console.error(
        "Erro ao salvar resultado:",
        resultError
      );

      await supabase
        .from("analyses")
        .update({
          status: "error",
        })
        .eq("id", analysis.id);

      return NextResponse.json(
        {
          error:
            "A análise foi processada, mas não foi possível salvar o resultado.",
        },
        { status: 500 }
      );
    }

    // ==========================================
    // ATUALIZA STATUS
    // ==========================================

    const { error: updateError } =
      await supabase
        .from("analyses")
        .update({
          status: "completed",
        })
        .eq("id", analysis.id);

    if (updateError) {
      console.error(
        "Erro ao atualizar status:",
        updateError
      );
    }

    // ==========================================
    // RESPOSTA
    // ==========================================

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
    });
  } catch (error) {
    console.error(
      "Erro na API de análise:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar análise.",
      },
      { status: 500 }
    );
  }
}
