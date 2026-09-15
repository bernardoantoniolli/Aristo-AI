import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ analysisId: string }>;
  }
) {
  try {
    const { analysisId } = await context.params;

    if (!analysisId) {
      return NextResponse.json(
        {
          success: false,
          error: "analysisId é obrigatório.",
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
          error: "Supabase não configurado.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret
    );

    const {
      data: purchase,
      error,
    } = await supabase
      .from("purchases")
      .select("status, payment_id, created_at")
      .eq("analysis_id", analysisId)
      .eq("provider", "mercado_pago")
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao consultar pagamento:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao consultar pagamento.",
        },
        { status: 500 }
      );
    }

    if (!purchase) {
      return NextResponse.json({
        success: true,
        status: "not_found",
        approved: false,
        paymentId: null,
      });
    }

    return NextResponse.json({
      success: true,
      status: purchase.status,
      approved: purchase.status === "approved",
      paymentId: purchase.payment_id,
    });
  } catch (error) {
    console.error(
      "Payment status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno.",
      },
      { status: 500 }
    );
  }
}
