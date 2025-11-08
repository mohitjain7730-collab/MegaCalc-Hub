'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Gauge } from 'lucide-react';

const formSchema = z.object({
  portfolioValue: z.number().min(0).optional(),
  targetVolatility: z.number().min(0).optional(),
  assetVolatility: z.number().min(0).optional(),
  correlation: z.number().min(-1).max(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolatilityTargetPositionSizeCalculator() {
  const [result, setResult] = useState<{
    positionWeight: number;
    positionValue: number;
    contributionToVolatility: number;
    interpretation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined as unknown as number,
      targetVolatility: undefined as unknown as number,
      assetVolatility: undefined as unknown as number,
      correlation: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
              value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
              onChange={e => {
                const v = e.target.value;
                const n = v === '' ? undefined : Number(v);
                let max: number | undefined = undefined;
                let min: number | undefined = undefined;
                if (name === 'correlation') {
                  max = 1;
                  min = -1;
                }
                field.onChange(Number.isFinite(n as any) && n !== null && n >= (min ?? 0) && (max === undefined || n <= max) ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.portfolioValue == null || v.targetVolatility == null || v.assetVolatility == null ||
        v.portfolioValue <= 0 || v.targetVolatility <= 0 || v.assetVolatility <= 0) {
      setResult(null);
      return;
    }
    const corr = v.correlation ?? 0;
    const targetVol = v.targetVolatility / 100;
    const assetVol = v.assetVolatility / 100;
    
    // Simplified: Position weight = Target Vol / Asset Vol (for uncorrelated or single position)
    // For correlated positions: weight = Target Vol / (Asset Vol * sqrt(1 + correlation))
    const positionWeight = targetVol / assetVol;
    const cappedWeight = Math.min(1, Math.max(0, positionWeight));
    const positionValue = cappedWeight * v.portfolioValue;
    const contributionToVolatility = cappedWeight * assetVol * 100;
    
    let recommendation = '';
    if (cappedWeight >= 0.95) recommendation = 'Position weight is at maximum. Consider reducing target volatility or using higher-volatility assets.';
    else if (cappedWeight >= 0.5) recommendation = 'Large position weight. Monitor correlation with other positions and ensure diversification.';
    else recommendation = 'Position weight is reasonable. Consider adding other positions to achieve target volatility with better diversification.';
    
    const interpretation = `Optimal position weight: ${(cappedWeight * 100).toFixed(1)}% ($${positionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). This position contributes approximately ${contributionToVolatility.toFixed(2)}% to portfolio volatility. ${recommendation}`;
    setResult({ positionWeight: cappedWeight * 100, positionValue, contributionToVolatility, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gauge className="h-5 w-5"/> Volatility Target Position Size Calculator</CardTitle>
          <CardDescription>Calculate position size based on target portfolio volatility, asset volatility, and correlation for risk targeting.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('portfolioValue', 'Portfolio Value ($)', 'e.g., 100000', '$')}
              {numInput('targetVolatility', 'Target Portfolio Volatility (%)', 'e.g., 15', '%')}
              {numInput('assetVolatility', 'Asset Volatility (%)', 'e.g., 20', '%')}
              {numInput('correlation', 'Correlation with Portfolio (-1 to 1, optional)', 'e.g., 0.3')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Optimal position size for volatility targeting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Position Weight</div><div className="text-2xl font-semibold">{result.positionWeight.toFixed(1)}%</div></div>
              <div><div className="text-sm text-muted-foreground">Position Value</div><div className="text-xl font-medium">${result.positionValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Volatility Contribution</div><div className="text-xl font-medium">{result.contributionToVolatility.toFixed(2)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk-based position sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/position-sizing-calculator" className="text-primary hover:underline">Position Sizing</a></h4><p className="text-sm text-muted-foreground">Risk-based sizing.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/kelly-criterion-calculator" className="text-primary hover:underline">Kelly Criterion</a></h4><p className="text-sm text-muted-foreground">Optimal betting size.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean-Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using volatility targeting for risk-based position sizing</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Volatility targeting sets position sizes to achieve a target portfolio volatility level, helping manage risk consistently across different assets.</li>
            <li>Position weight ≈ Target Volatility / Asset Volatility (simplified). Higher asset volatility requires smaller positions to maintain target volatility.</li>
            <li>Correlation with existing portfolio affects position sizing. Higher correlation increases portfolio volatility, requiring smaller positions.</li>
            <li>Target volatility depends on risk tolerance. Conservative investors may target 10-15% annual volatility, while aggressive investors may target 20-30%.</li>
            <li>Volatility targeting works best with diversified portfolios. For single positions or highly correlated assets, consider other position sizing methods.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Volatility targeting, risk-based position sizing, and portfolio volatility management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is volatility targeting?</h4><p className="text-muted-foreground">Volatility targeting is a risk management approach that sets position sizes to achieve a target portfolio volatility level, helping manage risk consistently across different assets and time periods.</p></div>
          <div><h4 className="font-semibold mb-2">How is position size calculated for volatility targeting?</h4><p className="text-muted-foreground">Position weight ≈ Target Volatility / Asset Volatility (simplified). Higher asset volatility requires smaller positions to maintain target portfolio volatility.</p></div>
          <div><h4 className="font-semibold mb-2">What is a good target volatility?</h4><p className="text-muted-foreground">Target volatility depends on risk tolerance. Conservative investors may target 10-15% annual volatility, moderate investors 15-20%, and aggressive investors 20-30% or higher.</p></div>
          <div><h4 className="font-semibold mb-2">How does correlation affect position sizing?</h4><p className="text-muted-foreground">Higher correlation with existing portfolio increases portfolio volatility, requiring smaller positions to maintain target volatility. Lower correlation allows larger positions.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use volatility targeting for a single position?</h4><p className="text-muted-foreground">Yes, but it's more effective with diversified portfolios. For single positions, volatility targeting helps set position size based on risk tolerance and asset volatility.</p></div>
          <div><h4 className="font-semibold mb-2">How do I estimate asset volatility?</h4><p className="text-muted-foreground">Estimate asset volatility using historical returns (standard deviation), implied volatility (options), or volatility models. Use recent data (e.g., 30-252 days) for current volatility estimates.</p></div>
          <div><h4 className="font-semibold mb-2">Should I recalculate position sizes regularly?</h4><p className="text-muted-foreground">Yes. Recalculate when asset volatility changes significantly, portfolio composition changes, or target volatility is adjusted. Regular rebalancing helps maintain target volatility.</p></div>
          <div><h4 className="font-semibold mb-2">What if calculated position size exceeds 100%?</h4><p className="text-muted-foreground">If position size exceeds 100%, either reduce target volatility, use higher-volatility assets, or accept that target volatility cannot be achieved with this asset alone. Consider diversification.</p></div>
          <div><h4 className="font-semibold mb-2">How does volatility targeting compare to fixed position sizing?</h4><p className="text-muted-foreground">Volatility targeting adjusts position sizes based on asset volatility to maintain consistent portfolio risk, while fixed sizing uses constant position sizes regardless of volatility.</p></div>
          <div><h4 className="font-semibold mb-2">Can I combine volatility targeting with other position sizing methods?</h4><p className="text-muted-foreground">Yes. Combine volatility targeting with Kelly Criterion, risk/reward-based sizing, or other methods. Use volatility targeting as a risk management overlay while maintaining diversification and other objectives.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

