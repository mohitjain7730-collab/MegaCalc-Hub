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
  downPayment: z.number().nonnegative(),
  closingCosts: z.number().nonnegative(),
  rehabCosts: z.number().nonnegative(),
  noiAnnual: z.number().nonnegative(),
  annualDebtService: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RealEstateCashOnCashReturnCalculator() {
  const [res, setRes] = useState<{ cashInvested: number; annualCashFlow: number; cocPct: number; opinion: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { downPayment: 0, closingCosts: 0, rehabCosts: 0, noiAnnual: 0, annualDebtService: 0 },
  });

  const onSubmit = (v: FormValues) => {
    const cashInvested = (v.downPayment || 0) + (v.closingCosts || 0) + (v.rehabCosts || 0);
    const annualCashFlow = Math.max(0, (v.noiAnnual || 0) - (v.annualDebtService || 0));
    const cocPct = cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;
    let opinion = 'Use cash-on-cash to compare leveraged returns across deals.';
    if (cocPct < 6) opinion = 'Low cash-on-cash. Consider improving NOI or negotiating price.';
    else if (cocPct > 12) opinion = 'Strong cash-on-cash, verify assumptions and risk (vacancy, capex).';
    setRes({ cashInvested, annualCashFlow, cocPct, opinion });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Real Estate ROI / Cash-on-Cash Return Calculator
          </CardTitle>
          <CardDescription>
            Calculate cash-on-cash return for real estate investments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="downPayment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="closingCosts" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closing Costs ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rehabCosts" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rehab/Upfront CapEx ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="noiAnnual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>NOI – annual ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualDebtService" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Debt Service ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value || ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Calculate Cash-on-Cash Return
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {res && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cash-on-Cash ROI</CardTitle></div>
            <CardDescription>Shows leveraged return on your cash invested.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div><p className="text-sm text-muted-foreground">Cash Invested</p><p className="text-2xl font-bold">${res.cashInvested.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Annual Cash Flow</p><p className="text-2xl font-bold">${res.annualCashFlow.toLocaleString()}</p></div>
              <div><p className="text-sm text-muted-foreground">Cash-on-Cash</p><p className="text-2xl font-bold">{res.cocPct.toFixed(2)}%</p></div>
            </div>
            <div className="mt-4 text-center"><CardDescription>{res.opinion}</CardDescription></div>
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
            Explore other real estate investment calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/rental-property-cap-rate-calculator" className="text-primary hover:underline">
                  Rental Property Cap Rate
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the cap rate for rental properties.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/mortgage-payment-calculator" className="text-primary hover:underline">
                  Mortgage Payment Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate monthly mortgage payments for investment properties.
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
                Calculate debt service coverage ratio for rental properties.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Real Estate ROI and Cash-on-Cash Return: Calculation and Interpretation" />
    <meta itemProp="description" content="An expert guide detailing the calculation and interpretation of key real estate investment metrics: overall Return on Investment (ROI) and Cash-on-Cash (CoC) return, the impact of leverage, and how to measure true annual profit." />
    <meta itemProp="keywords" content="real estate ROI formula, cash on cash return calculation, leveraged return analysis, total investment cost real estate, measuring annual cash flow, profitability metrics rental property" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-real-estate-roi-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Real Estate Returns: ROI and Cash-on-Cash Analysis</h1>
    <p className="text-lg italic text-muted-foreground">Master the primary metrics for evaluating the profitability of a rental property investment and the effect of financial leverage.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#roi-basics" className="hover:underline">Overall Return on Investment (ROI) and Total Profitability</a></li>
        <li><a href="#coc-basics" className="hover:underline">Cash-on-Cash (CoC) Return: Measuring Liquidity</a></li>
        <li><a href="#net-income" className="hover:underline">Net Operating Income (NOI) and Net Cash Flow</a></li>
        <li><a href="#leverage" className="hover:underline">The Impact of Leverage on Real Estate Returns</a></li>
        <li><a href="#limitations" className="hover:underline">Limitations and Advanced Return Metrics</a></li>
    </ul>
<hr />

    {/* OVERALL RETURN ON INVESTMENT (ROI) AND TOTAL PROFITABILITY */}
    <h2 id="roi-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overall Return on Investment (ROI) and Total Profitability</h2>
    <p><strong className="font-semibold">Return on Investment (ROI)</strong> is a universal profitability metric used to measure the gain or loss generated on an investment relative to the total cost. In real estate, ROI is typically used to measure the gain over a multi-year holding period, including all sources of profit, such as appreciation and tax benefits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The ROI Formula</h3>
    <p>The core ROI formula compares the total profit received over the investment period against the total initial cost:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'ROI = (Total Benefit - Total Cost) / Total Cost'}
        </p>
    </div>

    <p>In real estate, <strong className="font-semibold">Total Benefit</strong> includes: rental income earned, appreciation in property value, and principal paid down on the mortgage (equity gain). <strong className="font-semibold">Total Cost</strong> includes: the initial down payment, closing costs, renovation capital, and mortgage interest paid over the holding period.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Total Investment Cost (TIC)</h3>
    <p>Accurately defining the Total Investment Cost (TIC) is crucial. It includes the purchase price plus **all capital expenditures (CapEx)** necessary to stabilize the property and make it rentable, such as renovation and necessary repairs, which are key drivers of the final ROI figure.</p>

<hr />

    {/* CASH-ON-CASH (CoC) RETURN: MEASURING LIQUIDITY */}
    <h2 id="coc-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Cash-on-Cash (CoC) Return: Measuring Liquidity</h2>
    <p><strong className="font-semibold">Cash-on-Cash (CoC) Return</strong> is the most practical and immediate metric for measuring the annual performance and liquidity of an income-producing property. Unlike overall ROI, CoC focuses exclusively on the cash flow derived from operations relative to the actual cash invested by the owner.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The CoC Formula</h3>
    <p>CoC return is calculated by dividing the annual pre-tax cash flow generated by the property by the total cash actually invested in the property (excluding borrowed funds):</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'CoC Return = Annual Pre-Tax Cash Flow / Total Cash Invested'}
        </p>
    </div>

    <p>Where <strong className="font-semibold">Total Cash Invested</strong> includes the down payment, closing costs, and initial repair expenses. This metric is favored by investors because it gives a clear view of the investment's performance *relative to the capital at risk*.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation as an Annual Yield</h3>
    <p>CoC return is interpreted as an annual rate of return on the capital invested. If a property yields a 10% CoC return, the investor receives 10 cents back in cash flow for every dollar they put into the deal that year. This figure is directly comparable to the interest rate on a savings account or a bond yield.</p>

<hr />

    {/* NET OPERATING INCOME (NOI) AND NET CASH FLOW */}
    <h2 id="net-income" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Net Operating Income (NOI) and Net Cash Flow</h2>
    <p>Accurate calculation of both NOI and Net Cash Flow is essential for deriving the two primary return metrics (ROI and CoC).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Net Operating Income (NOI)</h3>
    <p><strong className="font-semibold">Net Operating Income (NOI)</strong> is the standard measure of a property's unleveraged (debt-free) operational income. It is calculated before accounting for debt service or taxes, focusing purely on the property's efficiency:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'NOI = (Gross Rental Income + Other Income) - Total Operating Expenses'}
        </p>
    </div>
    <p>Total Operating Expenses include property taxes, insurance, maintenance, property management fees, and utilities, but *exclude* mortgage payments, depreciation, and income taxes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Annual Pre-Tax Cash Flow (for CoC)</h3>
    <p>To calculate the Cash-on-Cash Return, the **Annual Pre-Tax Cash Flow** is required. This metric takes NOI and accounts for the major expense associated with financing:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Annual Cash Flow = NOI - Annual Debt Service'}
        </p>
    </div>
    <p>The Annual Debt Service is the sum of all principal and interest payments made on the mortgage during the year.</p>

<hr />

    {/* THE IMPACT OF LEVERAGE ON REAL ESTATE RETURNS */}
    <h2 id="leverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Impact of Leverage on Real Estate Returns</h2>
    <p>Real estate is one of the few asset classes where debt (<strong className="font-semibold">financial leverage</strong>) is routinely used to magnify returns. This is precisely why CoC return is higher than the property's unleveraged cap rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Magnifying Returns (Positive Leverage)</h3>
    <p>If the return generated by the property (measured by the property's capitalization rate or overall yield) is **greater** than the cost of the borrowed funds (the mortgage interest rate), the investment is operating under **positive leverage**. This excess return accrues entirely to the investor's equity, significantly boosting the Cash-on-Cash Return.</p>
    <p>Example: If the property yields 7% (NOI / Cost) but the mortgage rate is 5%, the 2% difference is multiplied across the entire borrowed principal, leading to a much higher CoC return on the small equity investment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Negative Leverage Risk</h3>
    <p><strong className="font-semibold">Negative leverage</strong> occurs when the return generated by the property is **less** than the cost of borrowing. In this scenario, the investor would be better off paying cash for the property or not buying it at all, as the debt is dragging down the CoC return below the unleveraged rate.</p>

<hr />

    {/* LIMITATIONS AND ADVANCED RETURN METRICS */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Advanced Return Metrics</h2>
    <p>While CoC and ROI are powerful tools, they have limitations, particularly in their failure to account for the timing of cash flows, leading expert investors to rely on advanced metrics.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations of Simple ROI/CoC</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Time Value of Money (TVM):</strong> Both metrics are simple ratio calculations and do not discount future cash flows. They ignore that a dollar received today is worth more than a dollar received five years from now.</li>
        <li><strong className="font-semibold">Holding Period:</strong> CoC only measures annual performance, not the total return realized upon sale of the asset.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Internal Rate of Return (IRR)</h3>
    <p>For professional investment evaluation, the <strong className="font-semibold">Internal Rate of Return (IRR)</strong> is the superior metric. IRR measures the actual annualized rate of return on the invested capital, taking into account the magnitude and timing of every single cash flow (initial investment, annual cash flow, and final sale proceeds). The IRR calculation is equivalent to finding the discount rate that makes the Net Present Value (NPV) of the project equal to zero.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Evaluating real estate profitability requires distinguishing between the <strong className="font-semibold">Cash-on-Cash Return</strong> (the immediate, annual liquidity metric) and the broader <strong className="font-semibold">Overall ROI</strong> (the total, multi-year measure of wealth creation).</p>
    <p>Cash-on-Cash is indispensable for operational planning, directly reflecting the benefit of financial leverage. Ultimately, investors must use CoC to ensure sufficient liquidity while employing time-sensitive metrics like IRR to make final, economically sound decisions that maximize long-term wealth.</p>
</section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about cash-on-cash return
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              Cash-on-cash return measures the annual pre-tax cash flow you receive relative to the total cash invested in the property. It's calculated as annual cash flow divided by total cash invested, expressed as a percentage.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I calculate annual cash flow?</h4>
            <p className="text-muted-foreground">
              Annual cash flow equals net operating income (NOI) minus annual debt service. NOI is rental income minus operating expenses (not including mortgage payments), and debt service is your total annual mortgage payments.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is total cash invested?</h4>
            <p className="text-muted-foreground">
              Total cash invested includes your down payment, closing costs, and any upfront capital expenses like repairs or renovations. It represents all the cash you initially put into the investment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a good cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              A good cash-on-cash return typically ranges from 6-12% for rental properties, depending on the market and property type. Higher returns may indicate higher risk, while lower returns might suggest more stable, appreciating properties.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How does leverage affect cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              Leverage can significantly increase your cash-on-cash return by allowing you to purchase properties with less cash down. However, it also increases risk and monthly payment obligations. Positive leverage occurs when your return exceeds your borrowing costs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between ROI and cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              Cash-on-cash return focuses specifically on cash flow from operations relative to cash invested. Total ROI includes all benefits including cash flow, appreciation, tax benefits, and loan paydown. ROI provides a more comprehensive picture of investment performance.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Can cash-on-cash return be negative?</h4>
            <p className="text-muted-foreground">
              Yes, if your operating expenses and debt service exceed your net operating income, you'll have negative cash flow and thus negative cash-on-cash return. This may be acceptable if you expect significant appreciation, but it requires careful analysis.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do I improve my cash-on-cash return?</h4>
            <p className="text-muted-foreground">
              You can improve cash-on-cash return by increasing rental income, reducing operating expenses, negotiating a better purchase price, or increasing leverage (with caution). Improving NOI while keeping cash invested low maximizes return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I only consider cash-on-cash return when evaluating properties?</h4>
            <p className="text-muted-foreground">
              No, cash-on-cash return is important but should be considered alongside other metrics like cap rate, total ROI, appreciation potential, tax benefits, and overall investment goals. A holistic approach provides the best investment decisions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Does cash-on-cash return change over time?</h4>
            <p className="text-muted-foreground">
              Yes, cash-on-cash return can improve over time as rents increase, you pay down the mortgage, or you refinance at a better rate. Conversely, it can decline if expenses rise or market conditions worsen. Regular monitoring helps track performance.
            </p>
          </div>
        </CardContent>
      </Card>

      <EmbedWidget categorySlug="finance" calculatorSlug="real-estate-cash-on-cash-return-calculator" />
    </div>
  );
}


