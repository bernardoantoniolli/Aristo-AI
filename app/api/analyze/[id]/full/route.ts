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

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da análise é obrigatório.",
        },
        { status: 400 }
      );
    }

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

    // =====================================================
    // 1. VERIFICA PAGAMENTO
    // =====================================================

    const {
      data: purchase,
      error: purchaseError,
    } = await supabase
      .from("purchases")
      .select(
        "id, analysis_id, provider, status, payment_id, created_at"
      )
      .eq("analysis_id", id)
      .eq("provider", "mercado_pago")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (purchaseError) {
      console.error(
        "Erro ao verificar pagamento:",
        purchaseError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao verificar pagamento.",
        },
        { status: 500 }
      );
    }

    // Nenhuma compra encontrada
    if (!purchase) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum pagamento encontrado.",
          code: "PAYMENT_REQUIRED",
        },
        { status: 403 }
      );
    }

    // Compra existe, mas ainda não foi aprovada
    if (purchase.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Pagamento ainda não aprovado.",
          code: "PAYMENT_REQUIRED",
          paymentStatus: purchase.status,
        },
        { status: 403 }
      );
    }

    // =====================================================
    // 2. BUSCA A ANÁLISE
    // =====================================================

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

    // =====================================================
    // 3. BUSCA O RESULTADO
    // =====================================================

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
          error: "Resultado da análise não encontrado.",
        },
        { status: 404 }
      );
    }

    const result =
      resultRow.result as AnalysisResult;

    // =====================================================
    // 4. GARANTE QUE O RELATÓRIO PAGO EXISTE
    // =====================================================

    if (!result.paidReport) {
      console.error(
        "paidReport não encontrado para análise:",
        id
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Relatório completo ainda não foi gerado.",
          code: "PAID_REPORT_NOT_FOUND",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 5. LIBERA O RELATÓRIO COMPLETO
    // =====================================================

    return NextResponse.json({
      success: true,

      analysis,

      result,

      purchase: {
        status: purchase.status,
        paymentId: purchase.payment_id,
      },
    });
  } catch (error) {
    console.error(
      "Erro ao buscar relatório completo:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao buscar relatório.",
      },
      { status: 500 }
    );
  }
}
