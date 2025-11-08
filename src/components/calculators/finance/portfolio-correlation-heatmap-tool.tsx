'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, BarChart3 } from 'lucide-react';

const formSchema = z.object({
  csv: z.string().min(1, 'Paste CSV data with headers'),
});

type FormValues = z.infer<typeof formSchema>;

type HeatmapData = {
  headers: string[];
  corr: number[][];
  interpretation: string;
};

function parseCsv(csv: string): { headers: string[]; rows: number[][] } | null {
  try {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const headers = lines[0].split(',').map(h => h.trim()).filter(Boolean);
    const rows: number[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length !== headers.length) return null;
      const nums = parts.map(p => {
        const v = parseFloat(p);
        if (!Number.isFinite(v)) throw new Error('Invalid number');
        return v;
      });
      rows.push(nums);
    }
    if (headers.length < 2) return null;
    return { headers, rows };
  } catch {
    return null;
  }
}

function computeCorrelationMatrix(rows: number[][]): number[][] {
  const nObs = rows.length;
  const nVars = rows[0]?.length ?? 0;
  const means = Array(nVars).fill(0);
  for (const r of rows) {
    for (let j = 0; j < nVars; j++) means[j] += r[j];
  }
  for (let j = 0; j < nVars; j++) means[j] /= nObs;
  const stds = Array(nVars).fill(0);
  for (const r of rows) for (let j = 0; j < nVars; j++) stds[j] += (r[j] - means[j]) ** 2;
  for (let j = 0; j < nVars; j++) stds[j] = Math.sqrt(stds[j] / Math.max(1, nObs - 1));
  const corr = Array.from({ length: nVars }, () => Array(nVars).fill(0));
  for (let a = 0; a < nVars; a++) {
    for (let b = 0; b < nVars; b++) {
      if (a === b) { corr[a][b] = 1; continue; }
      let cov = 0;
      for (let i = 0; i < nObs; i++) cov += (rows[i][a] - means[a]) * (rows[i][b] - means[b]);
      cov /= Math.max(1, nObs - 1);
      const denom = stds[a] * stds[b];
      corr[a][b] = denom > 0 ? Math.max(-1, Math.min(1, cov / denom)) : 0;
    }
  }
  return corr;
}

export default function PortfolioCorrelationHeatmapTool() {
  const [result, setResult] = useState<HeatmapData | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { csv: '' } });

  const onSubmit = (v: FormValues) => {
    const parsed = parseCsv(v.csv);
    if (!parsed) { setResult(null); return; }
    const corr = computeCorrelationMatrix(parsed.rows);
    const avgOffDiag: number[] = [];
    for (let i = 0; i < corr.length; i++) {
      let sum = 0; let cnt = 0;
      for (let j = 0; j < corr.length; j++) if (j !== i) { sum += Math.abs(corr[i][j]); cnt++; }
      avgOffDiag.push(cnt ? sum / cnt : 0);
    }
    const maxIdx = avgOffDiag.indexOf(Math.max(...avgOffDiag));
    const minIdx = avgOffDiag.indexOf(Math.min(...avgOffDiag));
    const interpretation = `Highest clustering: ${parsed.headers[maxIdx]} shows strongest average linkage; potential diversifier: ${parsed.headers[minIdx]} shows the weakest average correlation.`;
    setResult({ headers: parsed.headers, corr, interpretation });
  };

  const heatCells = useMemo(() => {
    if (!result) return null;
    const n = result.headers.length;
    return result.corr.map((row, i) => (
      <div key={i} className="flex border-b last:border-b-0">
        <div className="sticky left-0 bg-background z-10 pr-4 py-2 text-sm font-medium border-r min-w-[8rem]">{result.headers[i]}</div>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(4rem, 1fr))` }}>
          {row.map((v, j) => {
            // Color mapping: -1 (red) to +1 (blue/green)
            // Scale from 0 (red) to 240 (blue) for positive, 0 (red) for negative
            const intensity = Math.abs(v);
            let bgColor: string;
            if (v >= 0) {
              // Positive correlations: green to blue (120 to 240)
              const hue = 120 + (v * 120); // 0->120 (green), 1->240 (blue)
              bgColor = `hsl(${hue}, 70%, ${85 - intensity * 25}%)`;
            } else {
              // Negative correlations: red to orange (0 to 30)
              const hue = 0;
              bgColor = `hsl(${hue}, 70%, ${85 + intensity * 10}%)`;
            }
            return (
              <div key={j} className="flex items-center justify-center text-xs font-medium border-r last:border-r-0 p-2" style={{ backgroundColor: bgColor }}>
                {v.toFixed(2)}
              </div>
            );
          })}
        </div>
      </div>
    ));
  }, [result]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> Portfolio Correlation Heatmap Tool</CardTitle>
          <CardDescription>Paste returns with headers (columns = assets, rows = periods). Values can be decimal or percentage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="csv" render={({ field }) => (
                <FormItem>
                  <FormLabel>Returns CSV</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder={"AssetA,AssetB,AssetC\n0.01,0.02,-0.01\n0.00,0.01,0.02"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Generate Heatmap</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Interactive correlation matrix with interpretation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto border rounded-lg">
              <div className="min-w-full">
                <div className="flex border-b bg-muted/50 sticky top-0 z-20">
                  <div className="sticky left-0 bg-muted/50 pr-4 py-2 text-xs font-semibold border-r min-w-[8rem]"></div>
                  <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${result.headers.length}, minmax(4rem, 1fr))` }}>
                    {result.headers.map((h, i) => (
                      <div key={i} className="text-xs font-semibold px-2 py-2 border-r last:border-r-0 text-center">{h}</div>
                    ))}
                  </div>
                </div>
                {heatCells}
              </div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</a></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta-weighted Portfolio Exposure</a></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Use correlation heatmaps to identify diversification opportunities and risk clusters</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Paste CSV data with asset names as headers and returns as rows. Values can be decimals (0.01) or percentages (1%).</li>
            <li>Correlation heatmaps help identify highly linked assets (clusters) and potential diversifiers with weaker correlations.</li>
            <li>Aim for balanced clusters rather than concentrating risk in one correlation cluster.</li>
            <li>When correlations spike during market stress, rely on quality assets, cash, or uncorrelated factors for resilience.</li>
            <li>Use at least 36–60 monthly observations or 250+ daily points for stable correlation estimates.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Correlation heatmaps, portfolio diversification, and data requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a correlation heatmap in portfolio analysis?</h4><p className="text-muted-foreground">It visualizes pairwise correlations among asset returns, helping spot clusters, diversification gaps, and potential redundancy in your portfolio.</p></div>
          <div><h4 className="font-semibold mb-2">What data format should I paste?</h4><p className="text-muted-foreground">CSV with headers where each column is an asset and each row is a time period return. Values can be decimals (0.01) or percentages (1).</p></div>
          <div><h4 className="font-semibold mb-2">How many observations do I need?</h4><p className="text-muted-foreground">More is better; 36–60 monthly points or 250+ daily points typically stabilize correlation estimates.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret strong positive correlation?</h4><p className="text-muted-foreground">Assets tend to move together, reducing diversification benefits. Consider adding assets with lower or negative correlation to improve portfolio resilience.</p></div>
          <div><h4 className="font-semibold mb-2">Can correlations change over time?</h4><p className="text-muted-foreground">Yes. Correlations are regime‑dependent and often rise during market stress; reassess periodically to maintain effective diversification.</p></div>
          <div><h4 className="font-semibold mb-2">Are negative correlations always good?</h4><p className="text-muted-foreground">They can hedge risk but may reduce returns. Balance correlation with expected returns and volatility when constructing portfolios.</p></div>
          <div><h4 className="font-semibold mb-2">Does scaling of returns matter?</h4><p className="text-muted-foreground">Correlation is scale‑invariant; using decimals or percentages consistently yields the same correlations, so either format works.</p></div>
          <div><h4 className="font-semibold mb-2">How do missing values affect results?</h4><p className="text-muted-foreground">This tool expects complete rows. For production workflows, align dates and forward‑fill cautiously, or use specialized correlation estimation methods.</p></div>
          <div><h4 className="font-semibold mb-2">What about non‑linear dependence?</h4><p className="text-muted-foreground">Correlation captures linear co‑movement. Consider rank correlations or copulas for non‑linear relationships in advanced analysis.</p></div>
          <div><h4 className="font-semibold mb-2">How do I use this for portfolio construction?</h4><p className="text-muted-foreground">Identify clusters and diversify across them while optimizing for risk‑adjusted return (e.g., Sharpe ratio). Use the heatmap to avoid over-concentration in highly correlated assets.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





