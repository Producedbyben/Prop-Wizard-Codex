const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ProductResult {
  id: string;
  provider: string;
  asin: string;
  title: string;
  url: string;
  imageUrl: string;
  priceAmount: number;
  priceCurrency: string;
  isPrime: boolean;
  isNextDayConfirmed: boolean;
  expectedDeliveryIso: string;
  ratingStars: number | null;
  ratingCount: number | null;
  merchantSoldBy: string | null;
  fulfilledByAmazon: boolean;
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function extractASIN(url: string): string {
  // Match /dp/ASIN, /gp/product/ASIN, or /gp/aw/d/ASIN patterns
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /amazon\.co\.uk\/[^/]*\/dp\/([A-Z0-9]{10})/i,
    /amazon\.co\.uk.*[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function isAmazonProductUrl(url: string): boolean {
  return url.includes("amazon.co.uk") || url.includes("amazon.com");
}

function dedupeQuery(propName: string, description?: string): string {
  // Avoid "pink gown pink gown" when name === description
  if (!description || description.trim().toLowerCase() === propName.trim().toLowerCase()) {
    return propName.trim();
  }
  return `${propName} ${description}`.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured", options: [], status: "error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { propName, description, tags, searchQueryOverride } = body as {
      propName: string;
      description?: string;
      tags?: string[];
      searchQueryOverride?: string;
    };

    const rawQuery = searchQueryOverride || dedupeQuery(propName, description);
    const query = rawQuery.trim().slice(0, 120);

    if (!query) {
      return new Response(
        JSON.stringify({ options: [], status: "no_results" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Searching for:", query);

    // Step 1: Firecrawl search for Amazon UK products
    const searchResponse = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${query} site:amazon.co.uk`,
        limit: 10,
      }),
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error("Firecrawl search error:", searchResponse.status, errText);
      return new Response(
        JSON.stringify({ error: `Search failed: ${searchResponse.status}`, options: [], status: "error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchData = await searchResponse.json();
    const results = searchData?.data || [];

    console.log(`Found ${results.length} search results`);

    // Log URLs for debugging
    for (const r of results) {
      const url = r.url || "";
      const asin = extractASIN(url);
      console.log(`  URL: ${url} → ASIN: ${asin || "NONE"}`);
    }

    // Filter to Amazon product URLs and extract ASINs
    const amazonResults = results
      .filter((r: { url?: string }) => {
        const url = r.url || "";
        return isAmazonProductUrl(url) && extractASIN(url);
      })
      .slice(0, 5);

    console.log(`Amazon product results: ${amazonResults.length}`);

    if (amazonResults.length === 0) {
      // If no Amazon product URLs found, try to use search metadata directly
      const fallbackProducts: ProductResult[] = results
        .filter((r: { url?: string }) => isAmazonProductUrl(r.url || ""))
        .slice(0, 3)
        .map((r: { url?: string; title?: string; description?: string; metadata?: { title?: string } }) => ({
          id: crypto.randomUUID(),
          provider: "firecrawl",
          asin: extractASIN(r.url || "") || "unknown",
          title: r.title || r.metadata?.title || query,
          url: r.url || "",
          imageUrl: "",
          priceAmount: 0,
          priceCurrency: "GBP",
          isPrime: false,
          isNextDayConfirmed: false,
          expectedDeliveryIso: "",
          ratingStars: null,
          ratingCount: null,
          merchantSoldBy: null,
          fulfilledByAmazon: false,
        }));

      if (fallbackProducts.length > 0) {
        return new Response(
          JSON.stringify({ options: fallbackProducts, status: "options_found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ options: [], status: "no_results" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Scrape each product page for structured data
    const products: ProductResult[] = [];
    const seenAsins = new Set<string>();

    for (const result of amazonResults) {
      const url = result.url || "";
      const asin = extractASIN(url);
      if (!asin || seenAsins.has(asin)) continue;
      seenAsins.add(asin);

      try {
        console.log(`Scraping product ${asin}...`);
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: `https://www.amazon.co.uk/dp/${asin}`,
            formats: [
              {
                type: "json",
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Full product title" },
                    price: { type: "number", description: "Current price in GBP as a number (e.g. 12.99)" },
                    rating: { type: "number", description: "Average star rating out of 5" },
                    ratingCount: { type: "number", description: "Total number of customer ratings" },
                    imageUrl: { type: "string", description: "Main product image URL (https://...)" },
                    isPrime: { type: "boolean", description: "Whether Prime delivery is available" },
                    seller: { type: "string", description: "Sold by / seller name" },
                  },
                  required: ["title"],
                },
              },
            ],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        if (!scrapeResponse.ok) {
          console.warn(`Scrape failed for ${asin}: ${scrapeResponse.status}`);
          // Use search result metadata as fallback
          products.push({
            id: crypto.randomUUID(),
            provider: "firecrawl",
            asin,
            title: result.title || result.metadata?.title || query,
            url: `https://www.amazon.co.uk/dp/${asin}`,
            imageUrl: "",
            priceAmount: 0,
            priceCurrency: "GBP",
            isPrime: false,
            isNextDayConfirmed: false,
            expectedDeliveryIso: "",
            ratingStars: null,
            ratingCount: null,
            merchantSoldBy: null,
            fulfilledByAmazon: false,
          });
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const product = scrapeData?.data?.json || scrapeData?.json || {};

        console.log(`Scraped ${asin}: title="${(product.title || "").slice(0, 60)}" price=${product.price}`);

        products.push({
          id: crypto.randomUUID(),
          provider: "firecrawl",
          asin,
          title: product.title || result.title || result.metadata?.title || query,
          url: `https://www.amazon.co.uk/dp/${asin}`,
          imageUrl: product.imageUrl || "",
          priceAmount: Number(product.price) || 0,
          priceCurrency: "GBP",
          isPrime: Boolean(product.isPrime),
          isNextDayConfirmed: Boolean(product.isPrime),
          expectedDeliveryIso: product.isPrime ? getTomorrow() : "",
          ratingStars: product.rating ? Number(product.rating) : null,
          ratingCount: product.ratingCount ? Number(product.ratingCount) : null,
          merchantSoldBy: product.seller || null,
          fulfilledByAmazon: Boolean(product.isPrime),
        });

        if (products.length >= 3) break;
      } catch (scrapeErr) {
        console.warn(`Scrape error for ${asin}:`, scrapeErr);
        products.push({
          id: crypto.randomUUID(),
          provider: "firecrawl",
          asin,
          title: result.title || result.metadata?.title || query,
          url: `https://www.amazon.co.uk/dp/${asin}`,
          imageUrl: "",
          priceAmount: 0,
          priceCurrency: "GBP",
          isPrime: false,
          isNextDayConfirmed: false,
          expectedDeliveryIso: "",
          ratingStars: null,
          ratingCount: null,
          merchantSoldBy: null,
          fulfilledByAmazon: false,
        });
      }
    }

    // Sort: priced items first, then by price ascending
    products.sort((a, b) => {
      if (a.priceAmount && !b.priceAmount) return -1;
      if (!a.priceAmount && b.priceAmount) return 1;
      if (a.priceAmount !== b.priceAmount) return a.priceAmount - b.priceAmount;
      return (b.ratingStars ?? 0) - (a.ratingStars ?? 0);
    });

    const top3 = products.slice(0, 3);
    console.log(`Returning ${top3.length} products`);

    return new Response(
      JSON.stringify({
        options: top3,
        status: top3.length > 0 ? "options_found" : "no_results",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("search-props error:", error);
    return new Response(
      JSON.stringify({ error: String(error), options: [], status: "error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
