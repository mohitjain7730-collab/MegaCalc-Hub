'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

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
    return result.corr.map((row, i) => (
      <div key={i} className="grid grid-cols-[12rem_repeat(var(--n),minmax(2.5rem,1fr))]" style={{ ['--n' as any]: row.length }}>
        <div className="sticky left-0 bg-background z-10 pr-2 py-1 text-sm font-medium">{result.headers[i]}</div>
        {row.map((v, j) => {
          const hue = ((v + 1) / 2) * 120; // -1 red -> 0; +1 green -> 120
          const intensity = 0.85;
          return (
            <div key={j} className="flex items-center justify-center text-xs font-medium border" style={{ backgroundColor: `hsl(${hue} 75% ${Math.round(100 - intensity * 50)}%)` }}>
              {v.toFixed(2)}
            </div>
          );
        })}
      </div>
    ));
  }, [result]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Correlation Heatmap</CardTitle>
          <CardDescription>Paste returns with headers (columns = assets, rows = periods). Values can be decimal or %.</CardDescription>
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
              <Button type="submit">Generate Heatmap</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Interactive correlation matrix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-[12rem_repeat(var(--n),minmax(2.5rem,1fr))]" style={{ ['--n' as any]: result.headers.length }}>
                <div />
                {result.headers.map((h, i) => (
                  <div key={i} className="text-xs font-semibold px-2 py-1 border sticky top-0 bg-background">{h}</div>
                ))}
              </div>
              {heatCells}
            </div>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Portfolio analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio</Link></h4><p className="text-sm text-muted-foreground">Max Sharpe mix.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance</Link></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/portfolio-drawdown-calculator" className="text-primary hover:underline">Portfolio Drawdown</Link></h4><p className="text-sm text-muted-foreground">Path risk metrics.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta-weighted Exposure</Link></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sample Guide: Building Diversified Portfolios with Correlations</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Use correlation heatmaps to identify highly linked assets and potential diversifiers. Aim for balanced clusters rather than concentrating risk in one cluster.</p>
          <p>When correlations spike (e.g., in stress), rely on quality, cash, or uncorrelated factors for resilience.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <details><summary>What is a correlation heatmap in portfolio analysis?</summary><p>It visualizes pairwise correlations among asset returns, helping spot clusters, diversification gaps, and potential redundancy.</p></details>
          <details><summary>What data format should I paste?</summary><p>CSV with headers where each column is an asset and each row is a time period return. Values can be decimals (0.01) or percentages (1).</p></details>
          <details><summary>How many observations do I need?</summary><p>More is better; 36–60 monthly points or 250+ daily points typically stabilize estimates.</p></details>
          <details><summary>How do I interpret strong positive correlation?</summary><p>Assets tend to move together, reducing diversification benefits. Consider adding assets with lower or negative correlation.</p></details>
          <details><summary>Can correlations change over time?</summary><p>Yes. Correlations are regime‑dependent and often rise during market stress; reassess periodically.</p></details>
          <details><summary>Are negative correlations always good?</summary><p>They can hedge risk but may reduce returns. Balance correlation with expected returns and volatility.</p></details>
          <details><summary>Does scaling of returns matter?</summary><p>Correlation is scale‑invariant; using decimals or percentages consistently yields the same correlations.</p></details>
          <details><summary>How do missing values affect results?</summary><p>This tool expects complete rows. For production workflows, align dates and forward‑fill cautiously.</p></details>
          <details><summary>What about non‑linear dependence?</summary><p>Correlation captures linear co‑movement. Consider rank correlations or copulas for non‑linear relationships.</p></details>
          <details><summary>How do I use this for portfolio construction?</summary><p>Identify clusters and diversify across them while optimizing for risk‑adjusted return (e.g., Sharpe).</p></details>
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="portfolio-correlation-heatmap-tool" calculatorName="Portfolio Correlation Heatmap Tool" />
    </div>
  );
}




