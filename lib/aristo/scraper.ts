import * as cheerio from "cheerio";

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  headings: string[];
  ctas: string[];
  prices: string[];
  bodyText: string;
  faq: string[];
  testimonials: string[];
}

const MAX_HTML_SIZE = 2_000_000;
const MAX_TEXT_SIZE = 15_000;
const TIMEOUT_MS = 10_000;

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}

function isSafeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);

    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
    ];

    if (blockedHosts.includes(hostname)) {
      return false;
    }

    if (hostname.endsWith(".local")) {
      return false;
    }

    // Bloqueia IPs privados IPv4 mais comuns.
    const privateIpPatterns = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2\d|3[0-1])\./,
    ];

    if (privateIpPatterns.some((pattern) => pattern.test(hostname))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function scrapePage(rawUrl: string): Promise<ScrapedPage> {
  if (!isSafeUrl(rawUrl)) {
    throw new Error("URL inválida ou não permitida.");
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AristoBot/1.0; +https://aristo-ia.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`A página retornou HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error("A URL não parece apontar para uma página HTML.");
    }

    const contentLength = response.headers.get("content-length");

    if (contentLength && Number(contentLength) > MAX_HTML_SIZE) {
      throw new Error("Página muito grande para análise.");
    }

    const html = await response.text();

    if (html.length > MAX_HTML_SIZE) {
      throw new Error("Página muito grande para análise.");
    }

    const $ = cheerio.load(html);

    // Remove elementos que não fazem parte da oferta.
    $("script, style, noscript, svg, iframe, canvas").remove();

    const title = cleanText($("title").first().text());

    const description = cleanText(
      $('meta[name="description"]').attr("content") || ""
    );

    const headings = unique(
      $("h1, h2, h3")
        .map((_, element) => cleanText($(element).text()))
        .get()
    ).slice(0, 50);

    const ctaKeywords = [
      "comprar",
      "quero",
      "começar",
      "comece",
      "garantir",
      "garanta",
      "inscrever",
      "inscreva",
      "matricular",
      "acessar",
      "adquirir",
      "assinar",
      "participar",
      "testar",
      "conhecer",
      "aprender",
    ];

    const ctas = unique(
      $("a, button")
        .map((_, element) => cleanText($(element).text()))
        .get()
        .filter((text) => {
          const lower = text.toLowerCase();
          return (
            text.length >= 3 &&
            text.length <= 100 &&
            ctaKeywords.some((keyword) => lower.includes(keyword))
          );
        })
    ).slice(0, 30);

    const bodyText = cleanText($("body").text()).slice(0, MAX_TEXT_SIZE);

    // Detecta valores monetários encontrados na página.
    const priceMatches =
      bodyText.match(
        /(?:R\$\s*)?\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*(?:\/mês|\/mes|por mês|por mes)?/gi
      ) || [];

    const prices = unique(priceMatches).slice(0, 30);

    // Procura blocos relacionados a FAQ.
    const faq: string[] = [];

    $("h2, h3, h4, summary, dt").each((_, element) => {
      const text = cleanText($(element).text());

      if (
        text.length > 5 &&
        /faq|dúvida|duvida|pergunta|como funciona|o que|posso|quando/i.test(
          text
        )
      ) {
        faq.push(text);
      }
    });

    // Procura elementos que parecem depoimentos.
    const testimonials: string[] = [];

    $(
      '[class*="testimonial"], [class*="depoimento"], [class*="review"], [class*="avalia"]'
    ).each((_, element) => {
      const text = cleanText($(element).text());

      if (text.length >= 20 && text.length <= 1_000) {
        testimonials.push(text);
      }
    });

    return {
      url: rawUrl,
      title,
      description,
      headings,
      ctas,
      prices,
      bodyText,
      faq: unique(faq).slice(0, 20),
      testimonials: unique(testimonials).slice(0, 20),
    };
  } finally {
    clearTimeout(timeout);
  }
}
