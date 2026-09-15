import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const REPORT_PRICE = 97;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "Mercado Pago webhook recebido:",
      JSON.stringify(body)
    );

    // =====================================================
    // 1. IDENTIFICA O PAYMENT ID
    // =====================================================

    const paymentId =
      body?.data?.id ??
      body?.id ??
      null;

    if (!paymentId) {
      console.log(
        "Webhook ignorado: payment ID não encontrado."
      );

      return NextResponse.json({
        success: true,
        ignored: true,
      });
    }

    // =====================================================
    // 2. VALIDA TOKEN DO MERCADO PAGO
    // =====================================================

    const accessToken =
      process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      console.error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Mercado Pago não configurado.",
        },
        { status: 500 }
      );
    }

    // =====================================================
    // 3. BUSCA PAGAMENTO DIRETAMENTE NO MERCADO PAGO
    // =====================================================

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!paymentResponse.ok) {
      const errorText =
        await paymentResponse.text();

      console.error(
        "Erro ao consultar pagamento no Mercado Pago:",
        errorText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Não foi possível consultar o pagamento.",
        },
        { status: 500 }
      );
    }

    const payment =
      await paymentResponse.json();

    console.log(
      "Pagamento consultado:",
      JSON.stringify(payment)
    );

    // =====================================================
    // 4. EXTRAI INFORMAÇÕES IMPORTANTES
    // =====================================================

    const status = payment?.status;

    const externalReference =
      payment?.external_reference;

    const transactionAmount =
      Number(payment?.transaction_amount ?? 0);

    // =====================================================
    // 5. SEM EXTERNAL REFERENCE = NÃO LIBERA
    // =====================================================

    if (!externalReference) {
      console.error(
        "Pagamento sem external_reference:",
        paymentId
      );

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "missing_external_reference",
      });
    }

    // =====================================================
    // 6. VALIDA VALOR
    // =====================================================

    if (transactionAmount !== REPORT_PRICE) {
      console.error(
        "Valor de pagamento inválido:",
        {
          paymentId,
          transactionAmount,
          expected: REPORT_PRICE,
        }
      );

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "invalid_amount",
      });
    }

    // =====================================================
    // 7. SUPABASE
    // =====================================================

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseSecret =
      process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      console.error(
        "Supabase não configurado."
      );

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

    // =====================================================
    // 8. LOCALIZA A COMPRA
    // =====================================================

    const {
      data: purchase,
      error: purchaseError,
    } = await supabase
      .from("purchases")
      .select("*")
      .eq(
        "analysis_id",
        externalReference
      )
      .eq(
        "provider",
        "mercado_pago"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (purchaseError) {
      console.error(
        "Erro ao buscar purchase:",
        purchaseError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar compra.",
        },
        { status: 500 }
      );
    }

    if (!purchase) {
      console.error(
        "Compra não encontrada:",
        externalReference
      );

      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "purchase_not_found",
      });
    }

    // =====================================================
    // 9. DEFINE STATUS
    // =====================================================

    let purchaseStatus = "pending";

    if (status === "approved") {
      purchaseStatus = "approved";
    } else if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      purchaseStatus = "rejected";
    } else if (
      status === "refunded" ||
      status === "charged_back"
    ) {
      purchaseStatus = "refunded";
    } else {
      purchaseStatus = "pending";
    }

    // =====================================================
    // 10. ATUALIZA COMPRA
    // =====================================================

    const {
      error: updateError,
    } = await supabase
      .from("purchases")
      .update({
        payment_id: String(paymentId),
        status: purchaseStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error(
        "Erro ao atualizar purchase:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Erro ao atualizar pagamento.",
        },
        { status: 500 }
      );
    }

    console.log(
      "Compra atualizada com sucesso:",
      {
        purchaseId: purchase.id,
        analysisId: externalReference,
        paymentId,
        mercadoPagoStatus: status,
        purchaseStatus,
        amount: transactionAmount,
      }
    );

    // =====================================================
    // 11. RESPONDE AO MERCADO PAGO
    // =====================================================

    return NextResponse.json({
      success: true,
      status: purchaseStatus,
      paymentId: String(paymentId),
      analysisId: externalReference,
    });
  } catch (error) {
    console.error(
      "Erro no webhook Mercado Pago:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno no webhook.",
      },
      { status: 500 }
    );
  }
}
