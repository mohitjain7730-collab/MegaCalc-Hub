'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Shield, LineChart } from 'lucide-react';

const formSchema = z.object({
  w1: z.number().min(0).max(100).optional(),
  w2: z.number().min(0).max(100).optional(),
  s1: z.number().min(0).max(500).optional(),
  s2: z.number().min(0).max(500).optional(),
  rho: z.number().min(-1).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  weightedStd: number;
  portfolioStd: number;
  diversificationBenefitAbs: number;
  diversificationBenefitPct: number;
  interpretation: string;
  suggestions: string[];
};

export default function PortfolioDiversificationBenefitCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      w1: undefined as unknown as number,
      w2: undefined as unknown as number,
      s1: undefined as unknown as number,
      s2: undefined as unknown as number,
      rho: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (
      v.w1 === undefined || v.w2 === undefined ||
      v.s1 === undefined || v.s2 === undefined || v.rho === undefined
    ) {
      setResult(null);
      return;
    }
    const w1 = v.w1 / 100;
    const w2 = v.w2 / 100;
    const s1 = v.s1 / 100;
    const s2 = v.s2 / 100;
    const cov = v.rho * s1 * s2;
    const weightedStd = (w1 * s1 + w2 * s2) * 100;
    const variance = (w1*w1*s1*s1) + (w2*w2*s2*s2) + (2*w1*w2*cov);
    const portfolioStd = Math.sqrt(variance) * 100;
    const diversificationBenefitAbs = Math.max(0, weightedStd - portfolioStd);
    const diversificationBenefitPct = weightedStd > 0 ? (diversificationBenefitAbs / weightedStd) * 100 : 0;

    const interpretation = v.rho < 1
      ? 'Diversification reduces risk versus the weighted average of individual risks.'
      : 'With perfect correlation, diversification benefit is minimal or zero.';
    const suggestions = [
      'Seek assets with low or negative correlation for stronger benefits.',
      'Avoid excessive concentration; cap max position sizes.',
      'Refresh correlations periodically; relationships can change.',
      'Consider regime shifts that alter co-movement across assets.',
    ];

    setResult({ weightedStd, portfolioStd, diversificationBenefitAbs, diversificationBenefitPct, interpretation, suggestions });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Portfolio Diversification Benefit Calculator
          </CardTitle>
          <CardDescription>Quantify risk reduction from combining two assets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="w1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Asset 1 (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="w2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Asset 2 (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="text-sm text-muted-foreground self-end">Weights should sum to 100%</div>
                <FormField control={form.control} name="s1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Std. Dev. (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 15" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="s2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Std. Dev. (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 10" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rho" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlation (ρ)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.3" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Results & Insights
            </CardTitle>
            <CardDescription>Risk reduction from diversification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Weighted Average Std</p>
                <p className="text-2xl font-bold">{result.weightedStd.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Portfolio Std</p>
                <p className="text-2xl font-bold">{result.portfolioStd.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Benefit (Abs)</p>
                <p className="text-2xl font-bold">{result.diversificationBenefitAbs.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Benefit (%)</p>
                <p className="text-2xl font-bold">{result.diversificationBenefitPct.toFixed(2)}%</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Interpretation</h4>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Suggestions</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                {result.suggestions.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>More on risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/standard-deviation-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Gauge single-asset risk.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Adjust returns for inflation impact.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Evaluate outcome vs. risk taken.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate total volatility.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Diversification Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Placeholder: Add your full guide content describing diversification theory.</p>
          <p>Discuss correlations, covariance, and practical considerations.</p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Diversification and correlation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What is diversification benefit?</h4>
            <p className="text-muted-foreground">The risk reduction achieved when combining assets versus holding them in isolation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Why doesn’t risk add linearly?</h4>
            <p className="text-muted-foreground">Because combined variance includes covariance, which can offset volatility across assets.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What correlations maximize benefit?</h4>
            <p className="text-muted-foreground">Lower or negative correlations typically maximize diversification benefits.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can correlations change?</h4>
            <p className="text-muted-foreground">Yes. They are time-varying and may rise during stress, reducing benefits temporarily.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do I need many assets?</h4>
            <p className="text-muted-foreground">Even two assets can provide benefit if their correlation is below 1.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is lower risk always better?</h4>
            <p className="text-muted-foreground">Not necessarily—consider return goals, constraints, and drawdown tolerance.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What if weights don’t sum to 100%?</h4>
            <p className="text-muted-foreground">Re-scale weights to 100% or adjust inputs to reflect your actual allocation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How often should I reassess?</h4>
            <p className="text-muted-foreground">Reevaluate quarterly or during regime shifts; correlations can change meaningfully.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


