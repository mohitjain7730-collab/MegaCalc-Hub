
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Calculator, Info, FileText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  amountForeign: z.number().positive(),
  currentRate: z.number().positive(),
  fluctuation: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyVolatilityCalculator() {
  const [result, setResult] = useState<{ initialValue: number; newValue: number; impact: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amountForeign: 0,
      currentRate: 0,
      fluctuation: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { amountForeign, currentRate, fluctuation } = values;
    const initialValue = amountForeign * currentRate;
    const newRate = currentRate * (1 + (fluctuation / 100));
    const newValue = amountForeign * newRate;
    const impact = newValue - initialValue;
    setResult({ initialValue, newValue, impact });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Currency Volatility Parameters
          </CardTitle>
          <CardDescription>
            Enter currency holding and expected fluctuation to calculate impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  control={form.control} 
                  name="amountForeign" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount in Foreign Currency</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 50000"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="currentRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Exchange Rate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="any"
                          placeholder="e.g., 0.008"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="fluctuation" 
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Expected Fluctuation (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 5 (for 5% increase)"
                          {...field} 
                          value={field.value || ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit">Calculate Impact</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <BarChart2 className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Financial Impact of Fluctuation</CardTitle>
                <CardDescription>Gain or loss from currency movement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <CardDescription>Initial Value</CardDescription>
                <p className="font-bold text-lg mt-2">${result.initialValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <CardDescription>New Value</CardDescription>
                <p className="font-bold text-lg mt-2">${result.newValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
              </div>
              <div className={`p-4 rounded-lg ${result.impact >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                <CardDescription>Gain / Loss</CardDescription>
                <p className={`font-bold text-lg mt-2 ${result.impact >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {result.impact >= 0 ? '+' : ''}${result.impact.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </p>
                <Badge variant={result.impact >= 0 ? 'default' : 'destructive'} className="mt-2">
                  {result.impact >= 0 ? 'Gain' : 'Loss'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Amount in Foreign Currency</h4>
            <p className="text-muted-foreground">
              The value of your transaction or asset in its original currency. For example, if you have 50,000 Japanese Yen, enter 50000 here. This represents the base amount that will be affected by exchange rate changes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Current Exchange Rate</h4>
            <p className="text-muted-foreground">
              The current rate for converting 1 unit of the foreign currency into your domestic currency. Enter this as a decimal (e.g., 0.008 for JPY to USD, or 0.92 for EUR to USD).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Expected Fluctuation (%)</h4>
            <p className="text-muted-foreground">
              The percentage change you want to model in the exchange rate. Use a positive number for an appreciation of the foreign currency (foreign currency strengthens) and a negative number for a depreciation (foreign currency weakens). For example, +10% means the foreign currency gains 10% value.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other currency and financial risk calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">
                  Currency Exchange Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Convert amounts between different currencies using current exchange rates.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/npv-calculator" className="text-primary hover:underline">
                  Net Present Value (NPV) Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the present value of future cash flows to evaluate investment profitability.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/forward-rate-agreement-calculator" className="text-primary hover:underline">
                  Forward Rate Agreement Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate settlement payments for forward rate agreements on interest rates.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/sensitivity-analysis-what-if-calculator" className="text-primary hover:underline">
                  Sensitivity Analysis Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Analyze how changing variables impacts financial outcomes and risk exposure.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Currency Volatility: Calculation, Impact, and Hedging Strategies" />
    <meta itemProp="description" content="An expert guide detailing how currency volatility is calculated (standard deviation), its impact on foreign exchange risk (FX risk), methods for hedging using forwards and options, and the role of implied volatility in market pricing." />
    <meta itemProp="keywords" content="currency volatility calculation, foreign exchange risk analysis, FX risk hedging, standard deviation volatility formula, implied volatility currency, exchange rate risk management, currency derivatives" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-currency-volatility-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Currency Volatility: Measuring, Impact, and Hedging FX Risk</h1>
    <p className="text-lg italic text-gray-700">Master the metrics that quantify exchange rate fluctuations and the financial instruments used to manage resulting risk exposure.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Volatility: Definition and Types of FX Risk</a></li>
        <li><a href="#calculation" className="hover:underline">Calculating Historical Volatility (Standard Deviation)</a></li>
        <li><a href="#impact" className="hover:underline">Impact of Volatility on Business and Investment</a></li>
        <li><a href="#implied" className="hover:underline">Implied Volatility and Market Expectations</a></li>
        <li><a href="#hedging" className="hover:underline">Hedging Strategies for Currency Risk</a></li>
    </ul>
<hr />

    {/* VOLATILITY: DEFINITION AND TYPES OF FX RISK */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Volatility: Definition and Types of FX Risk</h2>
    <p>In foreign exchange (FX) markets, <strong className="font-semibold">Volatility</strong> measures the degree of variation in an exchange rate over a period of time. High volatility indicates that the currency value is changing rapidly and unpredictably, increasing the inherent risk of cross-border transactions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Types of Currency Risk</h3>
    <p>Volatility creates three major types of foreign exchange risk for multinational businesses and investors:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Transaction Risk:</strong> The risk that the exchange rate will change between the time a transaction is initiated (e.g., signing a contract) and the time the cash is actually exchanged (payment).</li>
        <li><strong className="font-semibold">Translation Risk:</strong> The risk that a company's financial statements will fluctuate when foreign assets and liabilities are converted back to the home currency for reporting purposes.</li>
        <li><strong className="font-semibold">Economic Risk:</strong> The long-term risk that exchange rate movements will fundamentally affect a company's competitiveness and future cash flows.</li>
    </ul>

<hr />

    {/* CALCULATING HISTORICAL VOLATILITY (STANDARD DEVIATION) */}
    <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Historical Volatility (Standard Deviation)</h2>
    <p>The standard academic and professional method for quantifying volatility is calculating the <strong className="font-semibold">Standard Deviation</strong> of past daily, weekly, or monthly returns of the exchange rate. This is known as <strong className="font-semibold">Historical Volatility</strong>.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Standard Deviation Approach</h3>
    <p>Standard deviation measures the dispersion of data points around the mean (average). For currency returns, it quantifies how much the exchange rate has typically deviated from its average over the measurement period. The higher the standard deviation, the higher the historical volatility.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annualizing Volatility</h3>
    <p>Daily volatility is often <strong className="font-semibold">annualized</strong> to make it comparable to other financial metrics. This is done by multiplying the daily standard deviation by the square root of the number of trading days in a year (typically 252 for FX markets):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Annual Volatility = Daily Standard Deviation * Square Root (252)'}
        </p>
    </div>
    <p>This annualized figure provides a standardized, one-year measure of the currency's expected movement.</p>

<hr />

    {/* IMPACT OF VOLATILITY ON BUSINESS AND INVESTMENT */}
    <h2 id="impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of Volatility on Business and Investment</h2>
    <p>High currency volatility complicates corporate planning, reduces profit margins, and adds layers of risk to investment portfolio management.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact on Profit Margins</h3>
    <p>A company importing goods may calculate its profit margin based on the current exchange rate. If the rate unexpectedly moves 5% against the importer before payment is due, the cost of the imported goods increases by 5%, directly eroding the profit margin or even turning a profit into a loss. Volatility makes contract pricing unreliable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact on Capital Budgeting</h3>
    <p>Multinational companies use the Discounted Cash Flow (DCF) method to value overseas projects. High volatility increases the uncertainty of future cash flows, forcing analysts to use a higher <strong className="font-semibold">risk-adjusted discount rate</strong> (cost of capital). This higher discount rate lowers the Net Present Value (NPV) of the project, making volatile investments less attractive.</p>

<hr />

    {/* IMPLIED VOLATILITY AND MARKET EXPECTATIONS */}
    <h2 id="implied" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Implied Volatility and Market Expectations</h2>
    <p>While Historical Volatility looks backward, <strong className="font-semibold">Implied Volatility (IV)</strong> is a forward-looking measure derived from the price of currency options.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Deriving IV from Option Prices</h3>
    <p>Implied volatility is the volatility rate that, when plugged into an options pricing model (like Black-Scholes), yields the current market price of the option. If the option is expensive, the implied volatility is high, meaning the market collectively expects large, unpredictable price swings in the future.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">IV as a Sentiment Gauge</h3>
    <p>IV serves as a direct gauge of market fear or uncertainty. When political or economic events are pending (e.g., elections, central bank announcements), IV typically spikes because traders anticipate sharp, volatile movements after the event's outcome is known. High IV increases the cost of hedging because options become more expensive.</p>

<hr />

    {/* HEDGING STRATEGIES FOR CURRENCY RISK */}
    <h2 id="hedging" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Hedging Strategies for Currency Risk</h2>
    <p>Hedging is the strategy of offsetting potential losses from adverse currency movements. The chosen instrument depends on whether the company seeks certainty or flexibility.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Currency Forward Contracts</h3>
    <p>A forward contract is a customized agreement to exchange a specified amount of one currency for another at a fixed exchange rate (the forward rate) on a future date. This provides complete certainty and eliminates transaction risk, but it also locks out any potential gains if the spot rate moves favorably.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Currency Options</h3>
    <p>A currency option gives the buyer the right, but not the obligation, to exchange currency at a predetermined rate (the strike price) on or before a specified date. Options provide flexibility: the buyer is protected against adverse movements but can still benefit if the spot rate moves in their favor.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Operational Hedging (Netting)</h3>
    <p>Companies can use <strong className="font-semibold">netting</strong> to offset currency exposures internally. For example, a subsidiary expecting to receive Euros can be tasked with making Euro-denominated payments, reducing the overall net exposure to the Euro/USD exchange rate volatility.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Currency volatility is the defining measure of risk in foreign exchange markets, quantified historically by the <strong className="font-semibold">Standard Deviation</strong> and prospectively by <strong className="font-semibold">Implied Volatility</strong> (derived from options pricing).</p>
    <p>High volatility directly translates into increased <strong className="font-semibold">transaction, translation, and economic risk</strong> for cross-border operations. Financial risk managers mitigate this exposure by utilizing <strong className="font-semibold">forward contracts</strong> for certainty or <strong className="font-semibold">currency options</strong> for flexibility, ensuring that profit margins are insulated from unpredictable exchange rate movements.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about currency volatility and its financial impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What causes currency volatility?</h4>
            <p className="text-muted-foreground">
              Currency volatility is caused by economic factors (inflation, interest rates, GDP growth), political events, central bank policies, trade balances, market sentiment, and global events. High volatility indicates uncertainty and perceived risk in currency markets.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I interpret a positive vs negative fluctuation?</h4>
            <p className="text-muted-foreground">
              A positive fluctuation means the foreign currency appreciates (gets stronger), increasing its value in domestic currency terms. A negative fluctuation means depreciation (weakening), decreasing its value. The impact on you depends on whether you're buying or selling the foreign currency.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is currency exposure risk?</h4>
            <p className="text-muted-foreground">
              Currency exposure risk is the potential for financial loss due to unfavorable exchange rate movements. It affects businesses with foreign operations, investors holding foreign assets, importers/exporters, and individuals with currency holdings or foreign income.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How can I hedge against currency volatility?</h4>
            <p className="text-muted-foreground">
              Common hedging strategies include forward contracts to lock in rates, currency options for flexibility, currency swaps for long-term exposure, and natural hedging through matching foreign currency assets and liabilities. Consult a financial professional for appropriate strategies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is the difference between transaction and translation exposure?</h4>
            <p className="text-muted-foreground">
              Transaction exposure affects actual cash flows from foreign currency transactions (e.g., receivables, payables). Translation exposure affects the reported value of foreign subsidiaries' financial statements when consolidated. Both create currency risk but have different implications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I assess currency risk for my business?</h4>
            <p className="text-muted-foreground">
              Assess currency risk by identifying exposure sources (sales, purchases, investments), measuring exposure amounts and durations, analyzing potential impact of rate movements, evaluating historical volatility, and considering correlation with business fundamentals. Use scenario analysis to model different outcomes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What are the costs of hedging currency risk?</h4>
            <p className="text-muted-foreground">
              Hedging costs include option premiums, forward contract spreads, swap basis differences, and management time. While hedging reduces risk, it also limits potential gains from favorable rate movements. The cost should be weighed against the risk reduction benefit.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How often should I review currency exposures?</h4>
            <p className="text-muted-foreground">
              Review currency exposures regularly—monthly for active positions, quarterly for routine business, and immediately when material events occur (new contracts, acquisitions, market disruptions). Regular monitoring helps identify changes in exposure that require hedging adjustments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What factors should influence my hedging strategy?</h4>
            <p className="text-muted-foreground">
              Consider transaction size (hedge larger exposures more), time horizon (longer exposures may need hedging), risk tolerance, cash flow impact, correlation with business operations, and competitive position. Balance cost, protection, and operational needs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can currency volatility be beneficial?</h4>
            <p className="text-muted-foreground">
              Yes. If you correctly anticipate currency movements, volatility can create opportunities. Exporters benefit when their domestic currency weakens (cheaper for foreign buyers). Investors can profit from favorable exchange rate movements. However, volatility introduces uncertainty that most businesses and investors prefer to minimize through hedging.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
