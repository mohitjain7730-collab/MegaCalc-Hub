
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Currency Volatility
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

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
