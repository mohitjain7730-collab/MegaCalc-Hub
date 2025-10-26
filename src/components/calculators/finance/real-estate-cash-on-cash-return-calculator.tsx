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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complete Guide to Real Estate Cash-on-Cash Return
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


