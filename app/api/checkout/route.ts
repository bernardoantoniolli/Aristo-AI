import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { analysisId } = await request.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId é obrigatório" },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!accessToken) {
      return NextResponse.json(
        { error: "MERCADO_PAGO_ACCESS_TOKEN não configurado" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_APP_URL não configurado" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Confirma que a análise existe
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("id, product")
      .eq("id", analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: "Análise não encontrada" },
        { status: 404 }
      );
    }

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: "aristo-full-analysis",
            title: "Aristo IA — Análise Comercial Completa",
            description:
              "Diagnóstico comercial completo com plano de ação, hooks, ângulos, criativos e testes.",
            quantity: 1,
            currency_id: "BRL",
            unit_price: 97,
          },
        ],

        external_reference: analysisId,

        back_urls: {
          success: `${appUrl}/pagamento/sucesso?analysisId=${analysisId}`,
          failure: `${appUrl}/pagamento/falhou?analysisId=${analysisId}`,
          pending: `${appUrl}/pagamento/pendente?analysisId=${analysisId}`,
        },

        auto_return: "approved",

        notification_url: `${appUrl}/api/webhooks/mercadopago`,
      },
    });

    // Registra a tentativa de compra
    const { error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        analysis_id: analysisId,
        provider: "mercado_pago",
        preference_id: response.id,
        status: "pending",
        amount: 97,
      });

    if (purchaseError) {
      console.error("Erro ao registrar compra:", purchaseError);
    }

    return NextResponse.json({
      success: true,
      initPoint: response.init_point,
      preferenceId: response.id,
    });
  } catch (error) {
    console.error("Erro no checkout:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o checkout",
      },
      { status: 500 }
    );
  }
}
