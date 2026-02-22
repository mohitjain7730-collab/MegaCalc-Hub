'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Globe, Calculator, ArrowRightLeft, TrendingUp, AlertCircle, CheckCircle2, DollarSign, Scale, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  priceDomestic: z.number().min(0.01, "Price must be positive"),
  priceForeign: z.number().min(0.01, "Price must be positive"),
  spotRate: z.number().min(0.0001, "Exchange rate must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PurchasingPowerParityCalculator() {
  const [result, setResult] = useState<{
    impliedRate: number;
    valuation: number;
    valuationStatus: string;
    purchasingPower: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceDomestic: undefined,
      priceForeign: undefined,
      spotRate: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // PPP Implied Exchange Rate = Price Domestic / Price Foreign
    const implied = v.priceDomestic / v.priceForeign;

    // Valuation % = ((Spot - Implied) / Implied) ? No, typically ((Spot - Implied) / Implied) determines if Spot is Over/Under relative to PPP.
    // If Spot > Implied, the Domestic currency is WEAKER than it should be (Undervalued)? 
    // Wait, let's trace:
    // Implied Rate (D/F) = 50 / 5 = 10. (1 Foreign costs 10 Dom).
    // Spot Rate (D/F) = 12. (1 Foreign costs 12 Dom).
    // Foreign is expensive. Domestic is weak (undervalued).
    // Percentage Difference = (Spot - Implied) / Implied = (12 - 10)/10 = 20%.
    // So positive % means Spot > Implied. Domestic unit buys LESS foreign unit than PPP suggests.

    // Convention: Is the DOMESTIC currency overvalued?
    // If Spot (12) > Implied (10), Foreign is Stronger than PPP. Domestic is Weaker (Undervalued).
    // If Spot (8) < Implied (10), Foreign is Weaker. Domestic is Stronger (Overvalued).

    const valuation = ((v.spotRate - implied) / implied) * 100;

    return {
      implied,
      valuation
    };
  };

  const getValuationStatus = (valuation: number) => {
    // Valuation here represents how much the Spot is ABOVE the Implied.
    // Spot (D/F) > Implied => Domestic currency is UNDERVALUED (it takes too many D to buy F).
    // Spot (D/F) < Implied => Domestic currency is OVERVALUED (it takes too few D to buy F).

    if (Math.abs(valuation) < 5) return 'Fairly Valued';
    if (valuation > 0) return 'Domestic Undervalued / Foreign Overvalued';
    return 'Domestic Overvalued / Foreign Undervalued';
  };

  const getPurchasingPower = (valuation: number) => {
    if (valuation > 20) return 'Domestic purchasing power is significantly weaker abroad than at home.';
    if (valuation < -20) return 'Domestic purchasing power is significantly stronger abroad (Your money goes further).';
    if (valuation > 0) return 'Domestic goods are slightly cheaper than foreign goods.';
    return 'Domestic goods are slightly more expensive than foreign goods.';
  };

  const getRecommendation = (valuation: number) => {
    if (Math.abs(valuation) < 10) return 'Exchange rate aligns closely with fundamental price levels. No major arbitrage signal.';
    if (valuation > 0) return 'The domestic currency looks cheap (undervalued). Long-term expectation is for domestic appreciation (Spot moving down to Implied) OR domestic inflation to rise.';
    return 'The domestic currency looks expensive (overvalued). Long-term expectation is for domestic depreciation (Spot moving up to Implied) OR foreign inflation to rise.';
  };

  const getInsights = (implied: number, valuation: number) => {
    const insights = [];
    if (valuation < -10) {
      insights.push('Strong Currency: Importing goods is cheaper than producing locally.');
      insights.push('Tourism Benefit: Domestic residents will find foreign travel cheap.');
      insights.push('Export Drag: Exporters may struggle with price competitiveness.');
    } else if (valuation > 10) {
      insights.push('Weak Currency: Domestic goods are highly competitive globally.');
      insights.push('Tourism Magnet: Foreign tourists will find the country cheap.');
      insights.push('Inflation Risk: Imported goods typically cost more, driving CPI up.');
    } else {
      insights.push('Balanced Trade: Currency competitiveness is neutral.');
      insights.push('Stable Pricing: Low risk of imported inflation shocks.');
    }
    return insights;
  };

  const getRisks = (valuation: number) => {
    const risks = [];
    risks.push('Non-Tradables: Services (haircuts, rent) distort PPP comparisons.');
    if (Math.abs(valuation) > 30) risks.push('Extreme Valuation: Market may be pricing in a regime shift or crisis.');
    risks.push('Taxes & Tariffs: Differences in VAT/GST can fake a PPP disparity.');
    risks.push('Transport Costs: Shipping pricing prevents perfect arbitrage.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);

    setResult({
      impliedRate: calc.implied,
      valuation: calc.valuation,
      valuationStatus: getValuationStatus(calc.valuation),
      purchasingPower: getPurchasingPower(calc.valuation),
      recommendation: getRecommendation(calc.valuation),
      insights: getInsights(calc.implied, calc.valuation),
      risks: getRisks(calc.valuation)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Price Level & Exchange Rate
          </CardTitle>
          <CardDescription>
            Compare the price of a standard good (e.g., Big Mac, standard basket) to find the &quot;Fair Value&quot; exchange rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="priceDomestic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4" />
                        Domestic Price
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 5.50 (USD)" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priceForeign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Foreign Price
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 4.80 (EUR)" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spotRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Actual Spot Rate (Dom/For)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" placeholder="e.g. 1.1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Implied PPP Rate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Globe className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Implied PPP Exchange Rate</CardTitle>
                  <CardDescription>Based on the Law of One Price</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.impliedRate.toFixed(4)}</p>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className={Math.abs(result.valuation) < 5 ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                    Actual Spot is {Math.abs(result.valuation).toFixed(2)}% {result.valuation > 0 ? "Higher" : "Lower"}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2">{result.purchasingPower}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Valuation Status</p>
                  <Badge variant={result.valuationStatus === 'Fairly Valued' ? 'default' : result.valuationStatus.includes('Undervalued') ? 'secondary' : 'outline'}>
                    {result.valuationStatus.split('/')[0]}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Actual Spot</p>
                  <p className="font-medium text-lg">{(form.getValues('spotRate') ?? 0).toFixed(4)}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Calculator className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Difference</p>
                  <p className={`font-medium text-lg ${result.valuation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.valuation > 0 ? '+' : ''}{result.valuation.toFixed(2)}%
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Impact on trade and tourism</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Factors distorting PPP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              PPP Implied Rate = Cost of Good (Domestic) / Cost of Good (Foreign)
            </p>
            <p className="font-mono text-xs text-center text-muted-foreground mt-2">
              Valuation % = ((Actual Spot Rate - Implied Rate) / Implied Rate) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This ratio calculates what the exchange rate "should be" to equalize the purchasing power for the selected good or basket of goods.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other valuation and economic tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/interest-rate-parity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">IRP Calculator</p>
                      <p className="text-sm text-muted-foreground">Interest Rate Parity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/inflation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Inflation Calculator</p>
                      <p className="text-sm text-muted-foreground">Adjust for purchasing power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/currency-exchange-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ArrowRightLeft className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Exchange Rate</p>
                      <p className="text-sm text-muted-foreground">Current spot conversions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Purchasing Power Parity (PPP)" />
        <meta itemProp="description" content="Calculate the 'Fair Value' of currencies using Purchasing Power Parity (PPP). Understand the Big Mac Index, implied exchange rates, and why prices differ globally." />
        <meta itemProp="keywords" content="Purchasing Power Parity, PPP Calculator, Big Mac Index, Implied Exchange Rate, Currency Overvaluation, Undervalued Currency, Law of One Price, Global Economics" />
        <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
        <meta itemProp="datePublished" content="2025-11-28" />
        <meta itemProp="url" content="/definitive-guide-ppp" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Purchasing Power Parity (PPP)</h1>
        <p className="text-lg italic text-muted-foreground">Why does a coffee cost $2 in one country and $5 in another? PPP is the economic compass that points to long-term exchange rate equilibrium.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">What is Purchasing Power Parity?</a></li>
          <li><a href="#calculation" className="hover:underline">How to Calculate Implied Rates</a></li>
          <li><a href="#big-mac" className="hover:underline">The &quot;Big Mac Index&quot; Explained</a></li>
          <li><a href="#limitations" className="hover:underline">Why PPP Fails in the Short Run</a></li>
          <li><a href="#implications" className="hover:underline">Strategic Implications for Investors</a></li>
        </ul>
        <hr />

        {/* CONCEPT */}
        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Purchasing Power Parity?</h2>
        <p>Purchasing Power Parity (PPP) represents the ideal exchange rate at which a given amount of money (&quot;purchasing power&quot;) buys the exact same basket of goods and services in two different countries.</p>
        <p>It rests on the **Law of One Price**, which states that in an efficient market without transport costs or trade barriers, identical goods should sell for the same price everywhere when converted to a common currency. If a laptop costs $1000 in the US, it should cost €900 in Europe (assuming an exchange rate of 0.90 EUR/USD).</p>
        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Implied Rates</h2>
        <p>The Economist&apos;s famous Big Mac Index is a practical application of PPP. It compares the price of a McDonald&apos;s Big Mac across countries. If a Big Mac is cheaper in Japan than in the US (in dollar terms), the Yen is considered &quot;undervalued&quot; relative to the Dollar.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            {'Implied Rate = Price (Domestic) / Price (Foreign)'}
          </p>
        </div>

        <p>If the <strong>Actual Spot Rate</strong> is higher than this Implied Rate, the domestic currency is weak (undervalued). If it is lower, the domestic currency is strong (overvalued).</p>
        <hr />

        {/* BIG MAC */}
        <h2 id="big-mac" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The &quot;Big Mac Index&quot; Concept</h2>
        <p>In 1986, <em>The Economist</em> introduced the Big Mac Index as a lighthearted guide to whether currencies are at their &quot;correct&quot; level. Since McDonald&apos;s Big Macs are made to the same specification globally, they serve as a near-perfect &quot;standard basket&quot; of goods (meat, bread, labor, rent, electricity).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example:</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>US Price:</strong> $5.00</li>
          <li><strong>Eurozone Price:</strong> €4.00</li>
          <li><strong>Implied Rate:</strong> 5.00 / 4.00 = 1.25 USD/EUR.</li>
          <li><strong>Actual Rate:</strong> 1.10 USD/EUR.</li>
        </ul>
        <p>Since the actual rate (1.10) is lower than the implied rate (1.25), the Euro is undervalued against the Dollar. You get &quot;more burger for your buck&quot; in Europe.</p>
        <hr />

        {/* LIMITATIONS */}
        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why PPP Fails in the Short Run</h2>
        <p>While PPP is a powerful long-term anchor (5-10 years), exchange rates deviate wildly from it in the short term. Why?</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Non-Tradable Goods:</strong> You cannot export a haircut, a restaurant meal, or apartment rent. These prices are determined by local wages, not global arbitrage.</li>
          <li><strong>Taxes & Tariffs:</strong> A country with a 20% VAT will naturally have higher prices than one with 0% sales tax, distorting the simple price comparison.</li>
          <li><strong>Transaction Costs:</strong> It costs money to ship goods. The &quot;Iceberg Cost&quot; model suggests prices can vary within a band defined by shipping costs without triggering arbitrage.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Balassa-Samuelson Effect</h3>
        <p>This economic principle explains why prices are generally higher in rich countries. High productivity in manufacturing raises wages across the entire economy (including service sectors where productivity hasn&apos;t increased much), leading to higher overall price levels (CPI) in developed nations compared to developing ones.</p>
        <hr />

        {/* IMPLICATIONS */}
        <h2 id="implications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Implications for Investors</h2>
        <p>For long-term investors, PPP signals &quot;Mean Reversion.&quot; If a currency is 30% undervalued according to PPP, it implies a long-term appreciation potential as the economy matures or inflation differentials adjust.</p>
        <p>For businesses, it helps in setting global pricing strategies. If your product is priced solely on exchange rates, you might be pricing yourself out of a market where local purchasing power is significantly lower.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers regarding PPP and currency valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is &quot;Mean Reversion&quot; in this context?</h4>
              <p className="text-muted-foreground">
                The tendency for exchange rates to eventually move back towards their PPP fair value after deviating. Research suggests the &quot;half-life&quot; of this reversion can be 3-5 years.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Law of One Price&quot;?</h4>
              <p className="text-muted-foreground">
                It is the foundational axiom of PPP. It states that an identical item must have the same price in all efficient markets. If gold trades at $2000 in NY and $1900 in London, traders would buy London gold and sell NY gold until prices met.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does PPP work for all goods?</h4>
              <p className="text-muted-foreground">
                No. It works best for highly tradable, standardized commodities (oil, gold, wheat, electronics). It fails for localized services (healthcare, education, real estate) because these cannot be traded across borders to equalize prices.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the Big Mac used as a benchmark?</h4>
              <p className="text-muted-foreground">
                Because it is uniform (standardized ingredients), sold in over 100 countries, and requires local inputs (labor, rent, electricity) that reflect the broader economy&apos;s price level. It is a brilliant &quot;basket of goods&quot; in a single product.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is Relative PPP vs. Absolute PPP?</h4>
              <p className="text-muted-foreground">
                <strong>Absolute PPP</strong> compares specific price levels (as we do here). <strong>Relative PPP</strong> looks at inflation rates. It predicts that the currency of a country with high inflation will depreciate against a country with low inflation to maintain parity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How long does it take for rates to revert to PPP?</h4>
              <p className="text-muted-foreground">
                Economists estimate the &quot;half-life&quot; of PPP deviations is roughly 3 to 5 years. This means it takes about that long for half of a mispricing gap to close. It is a slow, gravitational force, not a day-trading signal.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why are developing countries usually &quot;cheaper&quot;?</h4>
              <p className="text-muted-foreground">
                Due to lower labor costs in non-tradable sectors (services). Since wages are lower, services are cheaper, dragging down the overall price level relative to rich countries. This is why your dollar goes further in Thailand than in Switzerland.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can a currency allow itself to be undervalued?</h4>
              <p className="text-muted-foreground">
                Yes. Many export-dependent nations (like China historically) intentionally manage their exchange rate to keep it undervalued. This makes their exports cheaper and more competitive globally, boosting their manufacturing sector.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect PPP?</h4>
              <p className="text-muted-foreground">
                If Country A has 10% inflation and Country B has 2%, prices in A rise faster. For PPP to hold, Country A&apos;s currency must depreciate by roughly 8% so that the real cost to a foreigner remains unchanged.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is the US Dollar currently overvalued?</h4>
              <p className="text-muted-foreground">
                Historically, the USD often trades at a premium (overvalued) due to its status as the world reserve currency and &quot;safe haven.&quot; People are willing to pay a premium for the safety and liquidity of Dollar assets, defying strict PPP.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the &quot;Penn Effect&quot;?</h4>
              <p className="text-muted-foreground">
                It is the empirical finding that price levels for services are systematically lower in poorer countries. It contradicts valid PPP in the simplest sense but confirms the Balassa-Samuelson model.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Purchasing Power Parity (PPP) Calculator determines the long-term fair value of an exchange rate.</p>
          <p>By comparing the cost of identical goods, it reveals intrinsic overvaluation or undervaluation.</p>
          <p>Use this tool to gauge the real buying power of your currency abroad.</p>
        </CardContent>
      </Card>
    </div>
  );
}
