'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Link2 } from 'lucide-react';

const formSchema = z.object({
  assets: z.string().min(1, 'Enter asset cash flows'),
  liabilities: z.string().min(1, 'Enter liability cash flows'),
  discountRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function parseCashFlows(data: string): { period: number; amount: number }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const flows: { period: number; amount: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;
      const period = parseFloat(parts[0]);
      const amount = parseFloat(parts[1].replace(/[,$]/g, ''));
      if (!Number.isFinite(period) || !Number.isFinite(amount)) continue;
      flows.push({ period, amount });
    }
    return flows.length > 0 ? flows : null;
  } catch {
    return null;
  }
}

export default function AssetLiabilityMatchingCalculator() {
  const [result, setResult] = useState<{
    assetPV: number;
    liabilityPV: number;
    netPV: number;
    coverageRatio: number;
    interpretation: string;
    recommendation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assets: '',
      liabilities: '',
      discountRate: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '%') => (
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
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 && n <= 100 ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            <span className="text-sm text-muted-foreground">{suffix}</span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.discountRate == null) {
      setResult(null);
      return;
    }
    const assetFlows = parseCashFlows(v.assets);
    const liabilityFlows = parseCashFlows(v.liabilities);
    if (!assetFlows || !liabilityFlows || assetFlows.length === 0 || liabilityFlows.length === 0) {
      setResult(null);
      return;
    }
    const r = v.discountRate / 100;
    const assetPV = assetFlows.reduce((sum, cf) => sum + cf.amount / Math.pow(1 + r, cf.period), 0);
    const liabilityPV = liabilityFlows.reduce((sum, cf) => sum + cf.amount / Math.pow(1 + r, cf.period), 0);
    const netPV = assetPV - liabilityPV;
    const coverageRatio = liabilityPV > 0 ? assetPV / liabilityPV : 0;
    let recommendation = '';
    if (coverageRatio >= 1.1) recommendation = 'Assets exceed liabilities with comfortable margin. Portfolio is well-funded.';
    else if (coverageRatio >= 1.0) recommendation = 'Assets match liabilities. Monitor closely and maintain matching strategy.';
    else recommendation = 'Liability shortfall detected. Increase assets or reduce liabilities to restore matching.';
    const interpretation = `Asset PV: $${assetPV.toFixed(2)}. Liability PV: $${liabilityPV.toFixed(2)}. Net PV: $${netPV >= 0 ? '+' : ''}${netPV.toFixed(2)}. Coverage ratio: ${(coverageRatio * 100).toFixed(1)}%. ${recommendation}`;
    setResult({ assetPV, liabilityPV, netPV, coverageRatio, interpretation, recommendation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5"/> Asset-Liability Matching Calculator</CardTitle>
          <CardDescription>Analyze asset-liability matching for portfolios with future liabilities, ensuring cash flows align with obligations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="assets" render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Cash Flows (CSV: Period, Amount)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Period,Amount\n1,50000\n2,52000\n3,54000" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="liabilities" render={({ field }) => (
                <FormItem>
                  <FormLabel>Liability Cash Flows (CSV: Period, Amount)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="Period,Amount\n1,48000\n2,50000\n3,55000" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {numInput('discountRate', 'Discount Rate', 'e.g., 4.5')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Asset-liability matching analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><div className="text-sm text-muted-foreground">Asset PV</div><div className="text-xl font-semibold">${result.assetPV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Liability PV</div><div className="text-xl font-semibold">${result.liabilityPV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Net PV</div><div className={`text-xl font-semibold ${result.netPV >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.netPV >= 0 ? '+' : ''}{result.netPV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              <div><div className="text-sm text-muted-foreground">Coverage Ratio</div><div className={`text-xl font-semibold ${result.coverageRatio >= 1 ? 'text-green-600' : 'text-red-600'}`}>{(result.coverageRatio * 100).toFixed(1)}%</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Institutional portfolio management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/duration-matching-calculator" className="text-primary hover:underline">Duration Matching</a></h4><p className="text-sm text-muted-foreground">Interest rate risk management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</a></h4><p className="text-sm text-muted-foreground">Cash flow discounting.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/net-present-value-calculator" className="text-primary hover:underline">Net Present Value</a></h4><p className="text-sm text-muted-foreground">Investment valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/discounted-cash-flow-calculator" className="text-primary hover:underline">Discounted Cash Flow</a></h4><p className="text-sm text-muted-foreground">DCF valuation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding asset-liability matching for institutional portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Asset-liability matching ensures asset cash flows align with liability obligations, critical for pension funds, insurance companies, and institutional investors.</li>
            <li>Calculate present values of asset and liability cash flows using an appropriate discount rate (e.g., yield curve or required return).</li>
            <li>Coverage ratio = Asset PV / Liability PV. A ratio ≥1.0 indicates assets cover liabilities; &gt;1.1 provides a safety margin.</li>
            <li>Match cash flows by timing and amount. Consider both duration matching (sensitivity) and cash flow matching (exact timing).</li>
            <li>Monitor regularly and rebalance as asset values change, liabilities evolve, or discount rates shift to maintain matching.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Asset-liability matching, institutional portfolios, and cash flow alignment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is asset-liability matching?</h4><p className="text-muted-foreground">Asset-liability matching is a strategy that aligns asset cash flows with liability obligations by timing and amount, ensuring assets can meet liabilities as they come due.</p></div>
          <div><h4 className="font-semibold mb-2">Who uses asset-liability matching?</h4><p className="text-muted-foreground">Pension funds, insurance companies, endowments, and other institutional investors with future liabilities use asset-liability matching to manage funding risk.</p></div>
          <div><h4 className="font-semibold mb-2">What is coverage ratio?</h4><p className="text-muted-foreground">Coverage ratio = Asset PV / Liability PV. A ratio ≥1.0 means assets cover liabilities. Ratios &gt;1.1 provide a safety margin for uncertainty and market volatility.</p></div>
          <div><h4 className="font-semibold mb-2">How do I choose a discount rate?</h4><p className="text-muted-foreground">Use a rate that reflects the risk and timing of cash flows. Common choices include yield curve rates, required return, or liability-specific discount rates (e.g., for pension liabilities).</p></div>
          <div><h4 className="font-semibold mb-2">What's the difference between cash flow matching and duration matching?</h4><p className="text-muted-foreground">Cash flow matching aligns exact timing and amounts. Duration matching aligns sensitivity to interest rates. Both are important for effective asset-liability management.</p></div>
          <div><h4 className="font-semibold mb-2">What if coverage ratio is less than 1.0?</h4><p className="text-muted-foreground">A ratio &lt;1.0 indicates a funding shortfall. Increase assets (contributions, returns), reduce liabilities (benefit adjustments), or adjust discount rate assumptions (with caution).</p></div>
          <div><h4 className="font-semibold mb-2">How often should I recalculate matching?</h4><p className="text-muted-foreground">Recalculate regularly (quarterly or annually) and when significant changes occur: asset value changes, liability updates, discount rate shifts, or regulatory requirements.</p></div>
          <div><h4 className="font-semibold mb-2">Can I match assets and liabilities exactly?</h4><p className="text-muted-foreground">Perfect matching is often impossible due to uncertainty in liability timing/amounts, market constraints, and costs. Aim for close matching within acceptable tolerance.</p></div>
          <div><h4 className="font-semibold mb-2">What about inflation and other risks?</h4><p className="text-muted-foreground">Consider inflation-indexed liabilities, credit risk, liquidity risk, and basis risk. Match assets to liability characteristics beyond just timing and amount.</p></div>
          <div><h4 className="font-semibold mb-2">How does this relate to immunization?</h4><p className="text-muted-foreground">Asset-liability matching is related to immunization (duration matching) but broader—it considers cash flow timing, amounts, and multiple risk factors beyond just interest rate risk.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

