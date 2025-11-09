'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Calculator, Globe, FileText, Info, Home } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  purchasePrice: z.number().positive(),
  noi: z.number().nonnegative().optional().nullable(),
  grossRentAnnual: z.number().nonnegative().optional().nullable(),
  operatingExpensesAnnual: z.number().nonnegative().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentalPropertyCapRateCalculator() {
  const [result, setResult] = useState<{ noi: number; capRatePct: number; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchasePrice: 0,
      noi: 0,
      grossRentAnnual: 0,
      operatingExpensesAnnual: 0,
    },
  });

  const onSubmit = (v: FormValues) => {
    const computedNoi = v.noi ?? Math.max(0, (v.grossRentAnnual || 0) - (v.operatingExpensesAnnual || 0));
    const capRatePct = v.purchasePrice > 0 ? (computedNoi / v.purchasePrice) * 100 : 0;
    let opinion = 'Compare cap rate to local market norms for property type and risk.';
    if (capRatePct < 4) opinion = 'Low cap rate: priced for appreciation or prime location, not income.';
    else if (capRatePct > 8) opinion = 'High cap rate: higher income but potentially higher risk or deferred maintenance.';
    setResult({ noi: computedNoi, capRatePct, opinion });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Rental Property Return / Cap Rate Calculator
          </CardTitle>
          <CardDescription>
            Calculate the capitalization rate for rental properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="noi" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Operating Income (NOI) – annual ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grossRentAnnual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Rent – annual ($) [optional]</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="operatingExpensesAnnual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating Expenses – annual ($) [optional]</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | undefined) || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Calculate Cap Rate
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cap Rate Result</CardTitle></div>
            <CardDescription>NOI and cap rate snapshot. Inputs are blank until provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">NOI</p><p className="text-2xl font-bold">${result.noi.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Cap Rate</p><p className="text-2xl font-bold">{result.capRatePct.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{result.opinion}</CardDescription></div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other real estate and investment calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/real-estate-cash-on-cash-return-calculator" className="text-primary hover:underline">
                  Real Estate Cash-on-Cash Return
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate cash-on-cash return for rental properties.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments for rental properties.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-refinance-savings-calculator" className="text-primary hover:underline">
                  Mortgage Refinance Savings
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate potential savings from refinancing rental property.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/dscr-calculator" className="text-primary hover:underline">
                  DSCR Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate debt service coverage ratio for investment properties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Rental Property Return, Cap Rate, and Cash-on-Cash Analysis" />
    <meta itemProp="description" content="An expert guide detailing the formulas and purpose of the Capitalization Rate (Cap Rate) and the impact of debt/leverage, Cash-on-Cash (CoC) return, and Net Operating Income (NOI) in real estate investment valuation." />
    <meta itemProp="keywords" content="cap rate formula explained, how to calculate capitalization rate, net operating income (NOI), cash on cash return vs cap rate, rental property valuation, leveraged return real estate, investment property metrics" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-rental-property-return-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Rental Property Returns: Cap Rate and Cash-on-Cash Analysis</h1>
    <p className="text-lg italic text-muted-foreground">Master the primary metrics that determine property valuation, profitability, and the effectiveness of financial leverage in real estate investment.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#noi" className="hover:underline">Net Operating Income (NOI): The Profit Engine</a></li>
        <li><a href="#cap-rate" className="hover:underline">Capitalization Rate (Cap Rate): Valuation and Benchmarking</a></li>
        <li><a href="#coc" className="hover:underline">Cash-on-Cash (CoC) Return: Measuring Liquidity</a></li>
        <li><a href="#leverage" className="hover:underline">The Impact of Debt (Leverage) on Returns</a></li>
        <li><a href="#limits" className="hover:underline">Limitations of Cap Rate and Advanced Metrics</a></li>
    </ul>
<hr />

    {/* NET OPERATING INCOME (NOI): THE PROFIT ENGINE */}
    <h2 id="noi" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Operating Income (NOI): The Profit Engine</h2>
    <p>The foundation of all commercial and residential rental property valuation is the **Net Operating Income (NOI)**. NOI is the annual income generated by the property after deducting all operating expenses, but *before* accounting for debt service (mortgage payments) or income taxes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating NOI</h3>
    <p>NOI focuses purely on the property's efficiency as an asset, separate from how it is financed. The calculation is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'NOI = Gross Rental Income - Operating Expenses'}
        </p>
    </div>
    <p>Operating Expenses include property taxes, insurance, maintenance, property management fees, utilities (if paid by the owner), and a vacancy allowance (typically 5% to 10% of potential income). **Crucially, mortgage principal and interest are excluded from NOI.**</p>

<hr />

    {/* CAPITALIZATION RATE (CAP RATE): VALUATION AND BENCHMARKING */}
    <h2 id="cap-rate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Capitalization Rate (Cap Rate): Valuation and Benchmarking</h2>
    <p>The <strong className="font-semibold">Capitalization Rate (Cap Rate)</strong> is a measure of the natural, unleveraged rate of return on a real estate investment. It is primarily used by investors to quickly value a property or compare the profitability of different assets.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cap Rate Formula</h3>
    <p>Cap Rate is defined as the property's annual NOI divided by the purchase price (or current market value). It tells the investor the yield they would receive if they purchased the property with all cash (no debt):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Cap Rate = NOI / Property Value'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Using Cap Rate for Valuation</h3>
    <p>The formula can be rearranged to estimate the appropriate market value of a property based on its income stream, provided the average Cap Rate for comparable properties in the area is known:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Property Value = NOI / Market Cap Rate'}
        </p>
    </div>
    <p>This method is known as **Direct Capitalization** and is a fast and reliable way for appraisers and investors to determine value based on current market yield expectations.</p>

<hr />

    {/* CASH-ON-CASH (CoC) RETURN: MEASURING LIQUIDITY */}
    <h2 id="coc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cash-on-Cash (CoC) Return: Measuring Liquidity</h2>
    <p>While Cap Rate ignores financing, the <strong className="font-semibold">Cash-on-Cash (CoC) Return</strong> is the liquidity metric that matters most to the borrower, as it measures the annual return relative to the actual capital they invested (their equity).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The CoC Formula (Leveraged Return)</h3>
    <p>CoC Return is calculated by dividing the annual pre-tax cash flow *after* debt service by the total cash invested (down payment + closing costs + initial CapEx):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'CoC Return = (NOI - Annual Debt Service) / Total Cash Invested'}
        </p>
    </div>
    <p>This metric is the true gauge of the investment's performance from the investor's perspective. It answers the question: "How much cash did I get back this year for every dollar of my own money I put into the deal?"</p>

<hr />

    {/* THE IMPACT OF DEBT (LEVERAGE) ON RETURNS */}
    <h2 id="leverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Impact of Debt (Leverage) on Returns</h2>
    <p>The difference between the Cap Rate (unleveraged return) and the Cash-on-Cash Return (leveraged return) reveals the **Leverage Effect**—how debt magnifies profits or losses.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Positive Leverage</h3>
    <p>If the **Cap Rate is greater than the cost of borrowing** (the mortgage interest rate), the investor is using <strong className="font-semibold">positive leverage</strong>. This borrowed money is earning a return greater than its cost, and the excess profit is channeled back to the investor, causing the CoC Return to be significantly **higher** than the Cap Rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Negative Leverage</h3>
    <p><strong className="font-semibold">Negative leverage</strong> occurs if the Cap Rate is less than the cost of borrowing. In this case, the property's cash flow is insufficient to cover the high-interest debt, causing the CoC Return to be **lower** than the Cap Rate. The debt is destroying the investor's return on equity.</p>

<hr />

    {/* LIMITATIONS OF CAP RATE AND ADVANCED METRICS */}
    <h2 id="limits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of Cap Rate and Advanced Metrics</h2>
    <p>While Cap Rate and CoC provide quick assessment tools, they have serious limitations for long-term investment analysis, particularly in ignoring the Time Value of Money and asset life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What Cap Rate Ignores</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Mortgage (Debt Service):</strong> Cap Rate is unleveraged and ignores the debt structure, making it unsuitable for personal investment analysis where debt is used.</li>
        <li><strong className="font-semibold">Future Returns:</strong> Cap Rate does not account for future appreciation, tax benefits (depreciation), or principal reduction over time.</li>
        <li><strong className="font-semibold">Time Value of Money (TVM):</strong> It treats the annual NOI as constant and does not discount future cash flows.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Internal Rate of Return (IRR)</h3>
    <p>For professional investment decisions, the <strong className="font-semibold">Internal Rate of Return (IRR)</strong> is the gold standard. IRR measures the actual annualized rate of return on the capital invested over the entire holding period, factoring in the timing of all cash flows (initial investment, annual NOI, and the final sale price). The IRR is the only metric that truly captures the leveraged, long-term wealth created by the investment.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Successful real estate valuation hinges on the distinction between two powerful metrics: the **Capitalization Rate (Cap Rate)**, which measures the property's inherent, unleveraged profitability, and the **Cash-on-Cash (CoC) Return**, which measures the actual annual cash return on the investor's equity.</p>
    <p>Investors must use Cap Rate for initial valuation comparison and CoC to confirm that debt is providing **positive leverage**. This dual analysis ensures the property is acquired at fair market value and performs optimally according to the investor's cash flow goals.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about rental property cap rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a cap rate?</h4>
            <p className="text-muted-foreground">
              Cap rate (capitalization rate) is the ratio of net operating income (NOI) to property value. It measures the expected return on an investment property without considering financing costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I calculate NOI?</h4>
            <p className="text-muted-foreground">
              Net Operating Income is gross rental income minus all operating expenses (property taxes, insurance, maintenance, property management, utilities, etc.). It does not include debt service or mortgage payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a good cap rate?</h4>
            <p className="text-muted-foreground">
              A good cap rate depends on location, property type, and market conditions. Generally, 4-7% is typical for stable markets, while 8%+ may indicate higher risk or upside potential. Compare cap rates to similar properties in your market.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Is a higher or lower cap rate better?</h4>
            <p className="text-muted-foreground">
              A higher cap rate typically means higher income relative to price, but also may indicate higher risk or lower appreciation potential. Lower cap rates often suggest premium properties in desirable locations with better appreciation potential.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does cap rate differ from cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              Cap rate measures unleveraged return (without financing), while cash-on-cash return measures leveraged return based on the actual cash invested. Cap rate helps compare properties, while cash-on-cash shows your actual return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What expenses are included in NOI?</h4>
            <p className="text-muted-foreground">
              NOI includes all operating expenses like property taxes, insurance, maintenance, repairs, property management fees, utilities, landscaping, advertising, and legal fees. It excludes mortgage payments, depreciation, and capital improvements.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can cap rate change over time?</h4>
            <p className="text-muted-foreground">
              Yes, cap rates can change as rental income fluctuates, expenses change, or property value appreciates. Regular cap rate analysis helps track property performance and market conditions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I use cap rate to evaluate deals?</h4>
            <p className="text-muted-foreground">
              Compare the cap rate to similar properties in the market. A property with a significantly lower cap rate than comparable properties may be overpriced, while a higher cap rate may indicate a good opportunity or hidden risks.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between cap rate and ROI?</h4>
            <p className="text-muted-foreground">
              Cap rate shows current income return, while ROI (Return on Investment) measures total return including appreciation, tax benefits, and sale proceeds. ROI provides a more comprehensive investment picture.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use cap rate for all property types?</h4>
            <p className="text-muted-foreground">
              Cap rate is most useful for income-producing properties like rental homes, multifamily, and commercial properties. It's less applicable to primary residences, fix-and-flip projects, or properties with significant development potential.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="rental-property-cap-rate-calculator" />
    </div>
  );
}


