'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  roa: z.number().min(-100).max(100).optional(),
  debtToEquity: z.number().min(0).max(100).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialLeverageEffectCalculator() {
  const [result, setResult] = useState<{ roe: number; leverageEffect: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { roa: undefined as unknown as number, debtToEquity: undefined as unknown as number, interestRate: undefined as unknown as number, taxRate: undefined as unknown as number },
  });

  const onSubmit = (v: FormValues) => {
    if (v.roa === undefined || v.debtToEquity === undefined || v.interestRate === undefined || v.taxRate === undefined) { setResult(null); return; }
    const rdAfterTax = v.interestRate * (1 - v.taxRate / 100);
    const roe = v.roa + v.debtToEquity * (v.roa - rdAfterTax);
    const leverageEffect = roe - v.roa;
    const interpretation = leverageEffect >= 0 ? 'Leverage increases ROE because ROA exceeds after-tax cost of debt.' : 'Leverage reduces ROE because ROA is less than after-tax cost of debt.';
    setResult({ roe, leverageEffect, interpretation, suggestions: ['Aim for ROA above the after-tax cost of debt to amplify ROE.', 'Avoid excessive leverage; rising rates or falling ROA can invert the benefit.', 'Stress-test scenarios for rate hikes and lower profitability.', 'Consider covenants and liquidity risk in leverage decisions.'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Financial Leverage Effect Calculator</CardTitle>
          <CardDescription>Estimate how leverage changes ROE given ROA, debt cost, and taxes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="roa" render={({ field }) => (<FormItem><FormLabel>ROA (%)</FormLabel><FormControl>{num('e.g., 8', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="debtToEquity" render={({ field }) => (<FormItem><FormLabel>Debt-to-Equity (x)</FormLabel><FormControl>{num('e.g., 1.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (<FormItem><FormLabel>Interest Rate on Debt (%)</FormLabel><FormControl>{num('e.g., 6', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ROE impact from leverage</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated ROE</p><p className="text-2xl font-bold">{result.roe.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Leverage Effect</p><p className={`text-2xl font-bold ${result.leverageEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.leverageEffect.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Capital structure optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Positive leverage effect amplifies returns to shareholders</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Negative leverage effect destroys shareholder value rapidly</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Capital structure and returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Assess profitability to shareholders.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Evaluate blended financing cost.</p></div>
          </div>
        </CardContent>
      </Card>

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
              ROE = ROA + (D/E) × (ROA - r_d × (1 - Tax Rate))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Leverage amplifies ROE when ROA exceeds the after-tax cost of debt.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">ROA & Interest Rate (%)</h4>
              <p className="text-sm text-muted-foreground">Return on assets and the borrowing cost on debt.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">D/E & Tax Rate</h4>
              <p className="text-sm text-muted-foreground">Debt-to-equity ratio and effective tax rate for interest shield.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <div itemScope itemType="https://schema.org/FinanceSummary">
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="name">The Definitive Guide to Financial Leverage Effect</h1>
          <meta itemProp="description" content="Calculate how financial leverage impacts your Return on Equity (ROE). Understand the benefits and risks of using debt financing." />
          <meta itemProp="author" content="MegaCalc Hub" />
          <meta itemProp="keywords" content="Financial Leverage, ROE, ROA, Debt Financing, Capital Structure, Leverage Effect, Tax Shield, Bankruptcy Risk" />

          <p className="text-lg italic text-muted-foreground">Leverage is a double-edged sword: it magnifies gains when times are good, but amplifies losses when markets turn against you.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">What is Financial Leverage?</h2>
          <p>Financial leverage involves using borrowed capital (debt) to finance investments. The goal is to increase the potential Return on Equity (ROE). It works because debt has a fixed cost (interest), while equity returns are residual (everything left over).</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4" itemProp="articleSection">The Golden Rule of Leverage</h2>
          <p>Leverage creates value if and only if:</p>
          <div className="bg-muted/50 p-4 rounded-lg my-4 font-mono font-bold text-center">
            ROA (Return on Assets) &gt; After-Tax Cost of Debt
          </div>
          <p>If your business earns 10% on its assets, and you can borrow at 5%, the 5% spread goes straight to the shareholders, boosting ROE. This is "Positive Leverage." If assets only earn 3%, you still have to pay the 5% interest, which eats into shareholder capital. This is "Negative Leverage."</p>

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>Prudent leverage is a powerful tool for wealth creation, used by everything from real estate investors to private equity firms. However, excessive leverage is the primary cause of corporate bankruptcy. Balance is key.</p>
        </section>

        {/* FAQ Section */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Expert answers on debt and equity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does leverage boost ROE?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Leverage allows you to control a larger asset base with the same amount of equity. If the asset return exceeds the borrowing cost, the surplus return on the borrowed portion accrues to the equity holders, mathematically increasing ROE.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the "Tax Shield"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">In many jurisdictions, interest payments on debt are tax-deductible. This reduces the effective cost of debt. For example, if interest is 10% and tax is 30%, the real cost to the company is only 7% (10% * (1 - 0.30)).</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is "Negative Leverage"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Negative leverage occurs when the return on investment (ROA) is lower than the cost of the borrowed money. In this scenario, borrowing money actively destroys shareholder value.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is an optimal Debt-to-Equity ratio?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">It varies by industry. Stable industries like utilities can handle high leverage (D/E 2.0+). Volatile industries like tech usually stick to low leverage (D/E &lt; 0.5) because their cash flows are unpredictable.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does inflation affect leverage?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Unexpected inflation benefits borrowers (leverage users) because they repay fixed debts with cheaper, inflated dollars. However, inflation often leads to higher interest rates, which increases the cost of new or floating-rate debt.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is the difference between Operating and Financial Leverage?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Operating leverage relates to fixed costs in operations (e.g., factories). Financial leverage relates to fixed costs in financing (interest). Both magnify volatility of earnings, but from different sources.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What happens in bankruptcy?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Debt holders have priority claims. In bankruptcy, assets are sold to pay debt first. Equity holders get paid last, often receiving nothing if liabilities exceed assets. This is the ultimate risk of leverage.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">Can individuals use financial leverage?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Yes. The most common form is a mortgage (using debt to buy a house). Buying stocks on margin is another example. The same rules apply: if the asset appreciates faster than the interest rate, your net worth grows faster.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">What is "Deleveraging"?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Deleveraging is the process of reducing debt levels, either by paying down loans from cash flow or selling assets. Companies often deleverage after a major acquisition or during economic downturns to reduce risk.</p>
                </div>
              </div>

              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h4 className="font-semibold text-lg mb-3" itemProp="name">How does WACC relate to this?</h4>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-muted-foreground" itemProp="text">Debt is usually cheaper than equity (due to seniority and tax shields). Adding some debt lowers the Weighted Average Cost of Capital (WACC), increasing firm value—up to a point where bankruptcy risk rises too much.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Financial Leverage Effect Calculator quantifies how debt financing amplifies returns. When ROA exceeds the cost of debt, leverage acts as a multiplier for shareholder equity; when it falls below, it accelerates losses.</p></CardContent>
      </Card>
    </div>
  );
}


