
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, Info, FileText, Globe } from 'lucide-react';

const formSchema = z.object({
  nominalYield: z.number(),
  realYield: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreakevenInflationRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nominalYield: 0,
      realYield: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    const nominal = values.nominalYield / 100;
    const real = values.realYield / 100;
    const breakevenRate = ((1 + nominal) / (1 + real)) - 1;
    setResult(breakevenRate * 100);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Breakeven Inflation Rate Calculation
          </CardTitle>
          <CardDescription>
            Enter bond yields to calculate the breakeven inflation rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="nominalYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nominal Bond Yield (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 4.5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="realYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Real Yield (TIPS) (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="e.g., 1.5"
                        {...field} 
                        value={field.value || ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit">Calculate Breakeven Rate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result !== null && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Breakeven Inflation Rate</CardTitle>
                <CardDescription>Market expectation for average annual inflation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>This is the market's expectation for average annual inflation over the bond's maturity.</CardDescription>
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
            <h4 className="font-semibold text-foreground mb-2">Nominal Bond Yield (%)</h4>
            <p className="text-muted-foreground">
              The yield on a standard government bond of a certain maturity (e.g., 10-year Treasury Note). This yield includes both the real return and an expected inflation component.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">Real Yield (TIPS) (%)</h4>
            <p className="text-muted-foreground">
              The yield on an inflation-protected government bond of the same maturity (e.g., 10-year TIPS). The principal of this bond adjusts with inflation, so its yield represents a "real" return above inflation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>
            Explore other bond and inflation calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/bond-yield-calculator" className="text-primary hover:underline">
                  Bond Yield Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate current yield and yield to maturity for bonds.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/inflation-calculator" className="text-primary hover:underline">
                  Inflation Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the impact of inflation on purchasing power over time.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/present-value-calculator" className="text-primary hover:underline">
                  Present Value Calculator
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Calculate the present value of future cash flows.
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2">
                <a href="/category/finance/interest-rate-converter" className="text-primary hover:underline">
                  Interest Rate Converter
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">
                Convert between different interest rate formats and compounding frequencies.
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
            Complete Guide to Breakeven Inflation Rates
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
            Common questions about breakeven inflation rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">What is a breakeven inflation rate?</h4>
            <p className="text-muted-foreground">
              The breakeven inflation rate is the expected inflation rate implied by the difference between nominal and real yields on bonds of the same maturity. It represents the market's consensus expectation for inflation over a specific time period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How is breakeven inflation calculated?</h4>
            <p className="text-muted-foreground">
              Breakeven inflation is calculated using the Fisher Equation: (1 + Nominal Yield) = (1 + Real Yield) × (1 + Inflation Rate). Solving for the inflation rate gives you the breakeven rate that would make both bonds equivalent in return.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What's the difference between nominal and real yields?</h4>
            <p className="text-muted-foreground">
              Nominal yields include both the real return and expected inflation, while real yields (from inflation-protected bonds like TIPS) represent only the inflation-adjusted return. The difference reflects expected inflation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Are breakeven rates accurate predictions?</h4>
            <p className="text-muted-foreground">
              Breakeven rates reflect market expectations but are not guaranteed predictions. Actual inflation may differ due to unexpected economic events, policy changes, or market inefficiencies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">How do investors use breakeven rates?</h4>
            <p className="text-muted-foreground">
              Investors use breakeven rates to assess inflation expectations, compare nominal vs. inflation-protected bonds, make asset allocation decisions, and identify potential mispricing between different bond types.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Why do breakeven rates fluctuate?</h4>
            <p className="text-muted-foreground">
              Breakeven rates fluctuate due to changes in economic conditions, central bank policy expectations, supply and demand for bonds, and changes in risk premiums for inflation-protected securities.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">What affects the accuracy of breakeven rates?</h4>
            <p className="text-muted-foreground">
              Factors include liquidity differences between nominal and TIPS markets, inflation risk premiums, supply and demand imbalances, tax treatment differences, and technical factors affecting bond pricing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Should I use nominal or real yields for planning?</h4>
            <p className="text-muted-foreground">
              Use nominal yields for comparing against nominal expenses, and real yields for inflation-adjusted planning. Breakeven rates help you understand the cost of inflation protection in your portfolio.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
