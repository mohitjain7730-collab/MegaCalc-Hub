'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Calculator,
  Info,
  Grid3X3,
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BarChart4,
  Layers,
  Zap,
  FunctionSquare,
  HelpCircle,
  LayoutGrid,
  Scale,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  name1: z.string().min(1, "Name is required").default('Asset A'),
  name2: z.string().min(1, "Name is required").default('Asset B'),
  name3: z.string().min(1, "Name is required").default('Asset C'),
  series1: z.string().min(1, "Data is required"),
  series2: z.string().min(1, "Data is required"),
  series3: z.string().min(1, "Data is required"),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] {
  const matches = s.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  return matches
    .map(tok => Number(tok))
    .filter(n => Number.isFinite(n));
}

function calculateCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 3) return NaN;
  const ax = a.slice(0, n);
  const bx = b.slice(0, n);
  const ma = ax.reduce((s, v) => s + v, 0) / n;
  const mb = bx.reduce((s, v) => s + v, 0) / n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = ax[i] - ma;
    const db = bx[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va === 0 || vb === 0) return NaN;
  return cov / Math.sqrt(va * vb);
}

const getHeatmapColor = (val: number) => {
  if (isNaN(val)) return 'bg-muted text-muted-foreground';
  if (val >= 0.8) return 'bg-red-500/20 text-red-700 dark:text-red-400 font-black';
  if (val >= 0.5) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold';
  if (val >= 0.2) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-medium';
  if (val >= -0.1) return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
  return 'bg-green-500/20 text-green-700 dark:text-green-400 font-black';
};

const getCorrelationLabel = (val: number) => {
  if (isNaN(val)) return 'Invalid';
  if (val >= 0.8) return 'Very High';
  if (val >= 0.5) return 'Moderate-High';
  if (val >= 0.2) return 'Moderate-Low';
  if (val >= -0.1) return 'Uncorrelated';
  return 'Inverse/Insurance';
};

export default function AssetCorrelationMatrixCalculator() {
  const [result, setResult] = useState<{
    matrix: number[][];
    labels: string[];
    insights: string[];
    riskAssessments: string[];
    portfolioEfficiency: string;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name1: 'S&P 500',
      name2: 'Treasury Bonds',
      name3: 'Gold',
      series1: '1.2, -0.5, 2.3, -1.8, 0.4, 3.1, -2.2, 1.5',
      series2: '-0.2, 0.8, -1.1, 1.4, -0.3, -0.9, 2.0, -1.0',
      series3: '0.5, 0.1, 1.5, -0.2, 2.0, -1.4, 0.8, 0.3',
    },
  });

  const onSubmit = (v: FormValues) => {
    const s1 = parseSeries(v.series1);
    const s2 = parseSeries(v.series2);
    const s3 = parseSeries(v.series3);

    const labels = [v.name1, v.name2, v.name3];
    const matrix = [
      [1, calculateCorrelation(s1, s2), calculateCorrelation(s1, s3)],
      [calculateCorrelation(s1, s2), 1, calculateCorrelation(s2, s3)],
      [calculateCorrelation(s1, s3), calculateCorrelation(s2, s3), 1],
    ];

    const insights: string[] = [];
    const riskAssessments: string[] = [];

    // Logic for insights
    const avgOffDiag = (matrix[0][1] + matrix[0][2] + matrix[1][2]) / 3;

    if (avgOffDiag > 0.7) {
      insights.push("High cluster correlation detected. Your assets move in lockstep, offering minimal diversification.");
      riskAssessments.push("Redundancy Alert: You essentially own the same risk factor multiple times.");
    } else if (avgOffDiag < 0.2) {
      insights.push("Healthy asset separation. Your portfolio structure is mathematically robust against single-sector crashes.");
      riskAssessments.push("Monitor for 'Correlation Convergence' during extreme market panics.");
    } else {
      insights.push("Standard diversification profile. Assets offer moderate protection against each other.");
    }

    if (matrix[0][1] < 0 || matrix[0][2] < 0 || matrix[1][2] < 0) {
      insights.push("Inverse correlation (Hedge) identified. This is your insurance policy during market volatility.");
    }

    riskAssessments.push("Historical bias: Past correlations may not hold during future inflation or interest rate shocks.");
    riskAssessments.push(`Data Check: Using ${Math.min(s1.length, s2.length, s3.length)} data points. Ensure alignment for accuracy.`);

    setResult({
      matrix,
      labels,
      insights,
      riskAssessments,
      portfolioEfficiency: avgOffDiag < 0.3 ? "High Efficiency" : avgOffDiag < 0.6 ? "Standard" : "Low (Concentrated Risk)"
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <Card className="border-t-4 border-t-primary shadow-2xl overflow-hidden relative">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <Grid3X3 className="h-40 w-40" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-3">
            <LayoutGrid className="h-8 w-8 text-primary" />
            Asset Correlation Engine
          </CardTitle>
          <CardDescription className="text-lg font-medium">
            Analyze historical return series to identify interaction and diversification clusters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-4 p-6 bg-muted/40 rounded-3xl border border-dashed hover:bg-muted/60 transition-all border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black">
                        {num}
                      </div>
                      <h3 className="font-black uppercase tracking-widest text-xs opacity-70 text-primary">Asset Definition</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name={`name${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold">Asset Label</FormLabel>
                          <FormControl><Input className="bg-background/50 font-bold" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`series${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-tighter">Return Series (%)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              className="bg-background/50 font-mono text-xs resize-none"
                              placeholder="e.g. 1.2, -0.5, 2.3..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-[10px] italic">Comma or space separated numeric values</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
              <Button type="submit" className="w-full h-16 text-xl font-black shadow-2xl hover:scale-[1.01] transition-all bg-primary hover:bg-primary/90 text-primary-foreground border-b-4 border-primary-foreground/20">
                <Calculator className="mr-3 h-6 w-6" />
                Compute Pairwise Correlation Matrix
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="border-2 shadow-2xl overflow-hidden ring-4 ring-primary/5">
            <CardHeader className="bg-primary/5 border-b py-8 px-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-primary rounded-[2rem] text-primary-foreground shadow-xl rotate-3">
                    <BarChart4 className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Correlation Grid</CardTitle>
                    <CardDescription className="font-bold text-primary/70">Pairwise Pearson Coefficients (ρ)</CardDescription>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Badge className="px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm shadow-inner">
                    {result.portfolioEfficiency}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="p-8 text-left text-xs font-black uppercase tracking-[0.2em] opacity-50 border-b border-r">Asset Pair</th>
                      {result.labels.map((l, i) => (
                        <th key={i} className="p-8 text-left text-sm font-black text-primary border-b">{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.matrix.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="p-8 font-black text-sm text-foreground bg-muted/5 border-r border-b">{result.labels[i]}</td>
                        {row.map((v, j) => (
                          <td key={j} className={`p-8 border-b text-center group cursor-help transition-all relative`}>
                            <div className={`p-4 rounded-2xl ${getHeatmapColor(v)} shadow-sm transition-transform group-hover:scale-110`}>
                              <span className="text-xl font-black">{Number.isFinite(v) ? v.toFixed(3) : 'N/A'}</span>
                              <div className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
                                {getCorrelationLabel(v)}
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-10 bg-muted/20 border-t flex flex-wrap gap-8 items-center justify-center">
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-md bg-red-500/20" /> <span className="text-xs font-bold">Dangerous Redundancy (+0.8)</span></div>
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-md bg-orange-500/20" /> <span className="text-xs font-bold">Moderate (&gt;0.5)</span></div>
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-md bg-blue-500/20" /> <span className="text-xs font-bold">Uncorrelated (0.0)</span></div>
                <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-md bg-green-500/20" /> <span className="text-xs font-bold">Inverse Hedge (&lt; -0.1)</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-l-4 border-l-primary hover:shadow-2xl transition-shadow group">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl font-black uppercase">Diversification Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-foreground/80 leading-relaxed">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-l-4 border-l-red-500 hover:shadow-2xl transition-shadow group bg-red-50/5 dark:bg-red-900/5">
              <CardHeader className="bg-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 group-hover:shake transition-transform" />
                  <CardTitle className="text-xl font-black uppercase text-red-800 dark:text-red-400">Risk Audit Observations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm">
                    <TrendingDown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-red-900/80 dark:text-red-300 leading-relaxed">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-primary border-none shadow-2xl p-8 rounded-[2rem] text-primary-foreground relative overflow-hidden group">
            <Zap className="h-24 w-24 absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform" />
            <div className="flex items-center gap-8 relative z-10">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tighter uppercase italic">The Efficiency Verdict</h3>
                <AlertDescription className="text-lg font-bold opacity-90 leading-relaxed max-w-2xl">
                  Based on the data provided, your portfolio demonstrates a <strong>{result.portfolioEfficiency}</strong> profile.
                  {result.matrix[0][1] > 0.8 ? " Redundancy between your primary assets is currently undermining your diversification benefit." : " Your asset selection effectively covers divergent risk factors."}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </div>
      )}

      {/* Formula Box */}
      <Card className="overflow-hidden border-2 shadow-xl">
        <CardHeader className="bg-muted px-8 py-6 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <FunctionSquare className="h-6 w-6 text-primary" />
            The Pearson Mathematics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-card border-l-4 border-l-primary p-8 rounded-2xl shadow-inner space-y-6">
            <div className="flex flex-col items-center gap-6">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Pearson Correlation Coefficient (ρ)</p>
              <div className="py-8 px-12 bg-muted rounded-[2rem] font-mono text-xl md:text-3xl text-primary font-black border-2 border-primary/20 shadow-lg">
                ρ(X,Y) = Σ(x<sub>i</sub> - μ<sub>x</sub>)(y<sub>i</sub> - μ<sub>y</sub>) / √(Σ(x<sub>i</sub> - μ<sub>x</sub>)<sup>2</sup> Σ(y<sub>i</sub> - μ<sub>y</sub>)<sup>2</sup>)
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-bold italic leading-relaxed border-t pt-6 text-center">
              The coefficient measures the <strong>linear relationship</strong> between two variables. A value of +1 implies perfect alignment, -1 implies perfect opposition, and 0 implies statistical independence.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Section: Understanding the Inputs */}
      <Card className="shadow-2xl border-none bg-gradient-to-br from-muted/50 to-muted">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <HelpCircle className="h-7 w-7 text-primary" />
            Architecture of the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 pt-4">
          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary uppercase tracking-widest border-b-2 border-primary/10 pb-2">Technical Parameters</h4>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center font-black p-0 shrink-0">1</Badge>
                <div>
                  <p className="text-sm font-black text-foreground">Return Frequencies</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">Ensure all assets use the same frequency (e.g., all Daily or all Monthly). Mixing frequencies will produce meaningless coefficients.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Badge variant="outline" className="h-8 w-8 rounded-full flex items-center justify-center font-black p-0 shrink-0">2</Badge>
                <div>
                  <p className="text-sm font-black text-foreground">Sample Size (N)</p>
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">Mathematically requires N &gt; 2. Statistically, N &gt; 30 is recommended to filter out high-frequency market noise.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-black text-primary uppercase tracking-widest border-b-2 border-primary/10 pb-2">Formatting Rules</h4>
            <div className="p-6 bg-background/50 rounded-2xl border border-dashed border-primary/30">
              <p className="text-xs font-bold text-muted-foreground mb-4 leading-relaxed uppercase tracking-tighter italic">Data should be entered as a list of numbers separated by commas or spaces.</p>
              <div className="font-mono text-[10px] bg-muted p-4 rounded-xl text-primary font-black shadow-inner">
                1.35, -0.42, 2.89, 0.15, -1.22...
              </div>
              <p className="text-[10px] mt-4 font-black opacity-50 italic">Note: The system automatically ignores non-numeric characters like '%' or currency symbols.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Guide Section */}
      <section className="space-y-12 text-muted-foreground leading-relaxed bg-card p-8 md:p-16 lg:p-24 rounded-[3rem] border shadow-2xl relative overflow-hidden" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60 pointer-events-none" />

        <meta itemProp="name" content="The Ultimate Masterclass on Asset Correlation Matrices" />
        <meta itemProp="description" content="A comprehensive guide to understanding and calculating asset correlation matrices for portfolio optimization. Learn about Pearson coefficients, diversification benefits, and market regimes." />
        <meta itemProp="keywords" content="Asset Correlation Matrix, Pearson Correlation, Portfolio Diversification, Risk Management, Financial Mathematics, Correlation Coefficient Formula" />

        <div className="max-w-4xl space-y-8 relative z-10">
          <Badge className="bg-primary/20 text-primary font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full mb-6">Investment Intelligence Report</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.8]">The Matrix of<br /><span className="text-primary italic">Interaction</span></h1>
          <p className="text-2xl text-muted-foreground font-medium max-w-3xl border-l-[12px] border-primary pl-10 py-4 italic shadow-sm bg-muted/20 rounded-r-3xl">
            "Your portfolio is not a collection of items; it is a system of interactions. Understanding the grid is the first step toward institutional management."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t border-dashed mt-16">
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase">
              <Layers className="h-10 w-10 text-primary" /> Roadmap
            </h2>
            <ul className="space-y-6">
              {[
                { id: "defining", label: "The Pearson Definition", desc: "Linear relationships across time" },
                { id: "diversification", label: "Harvesting Beta", desc: "How correlation builds safety" },
                { id: "heatmap", label: "The Heatmap Model", desc: "Interpreting intensity levels" },
                { id: "instability", label: "Market Regimes", desc: "Why correlations are dynamic" },
                { id: "pitfalls", label: "Statistical Pitfalls", desc: "Spurious data and noise" }
              ].map((item, i) => (
                <li key={i} className="group">
                  <a href={`#${item.id}`} className="flex items-center gap-6 hover:translate-x-4 transition-transform p-4 rounded-2xl hover:bg-muted duration-300">
                    <span className="text-3xl font-black text-primary/20 italic group-hover:text-primary transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <p className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase">{item.label}</p>
                      <p className="text-sm font-bold opacity-60">{item.desc}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-muted p-12 rounded-[3.5rem] border-8 border-background shadow-2xl relative flex flex-col justify-center overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="h-32 w-32" /></div>
            <h3 className="text-3xl font-black text-foreground mb-6 leading-tight">&quot;Diversification is the only &apos;Free Lunch&apos; in finance.&quot;</h3>
            <p className="text-lg italic font-medium opacity-80 leading-relaxed">
              &mdash; Harry Markowitz, Nobel Laureate in Economics and Father of Modern Portfolio Theory. The correlation matrix is the tool used to serve that lunch.
            </p>
          </div>
        </div>

        <div id="defining" className="space-y-8 pt-20 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">The Pearson Standard</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <p className="text-xl font-medium leading-relaxed">
                The **Pearson Correlation Coefficient** is the gold standard for measuring how two assets move in relation to one another. It quantifies the degree to which an asset’s returns can be explained by the returns of another.
              </p>
              <div className="p-8 bg-muted rounded-3xl border-2 border-primary/10 shadow-inner italic font-bold">
                &quot;If Asset A goes up by 1% every time Asset B goes up by 1%, they are perfectly correlated (1.0). If they move in opposite directions, the correlation is negative (-1.0).&quot;
              </div>
            </div>
            <div className="space-y-6 p-8 bg-primary/5 rounded-3xl border border-primary/20">
              <h4 className="text-lg font-black uppercase text-primary tracking-widest">Pairwise Logic</h4>
              <p className="text-sm font-bold opacity-80 leading-relaxed">
                In a matrix, every asset is compared to every other asset. This creates a symmetric grid where the row-column intersection (A,B) shows the statistical &quot;tightness&quot; of their relationship.
              </p>
            </div>
          </div>
        </div>

        <div id="diversification" className="space-y-8 pt-12">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">The Mechanics of Safety</h2>
          <p className="text-xl leading-relaxed">
            Diversification works best when assets have **Low Correlation (ρ &lt; 0.3)**. When assets are uncorrelated, the unique (unsystematic) risks of each asset cancel each other out over time. This allows for a smoother equity curve and a higher Sharpe Ratio.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <Card className="bg-muted/50 border-none rounded-3xl p-8 space-y-4 text-center">
              <TrendingUp className="h-10 w-10 text-red-600 mx-auto" />
              <h4 className="font-black uppercase text-xs tracking-widest">Positive ρ</h4>
              <p className="text-xs font-bold opacity-70">Assets rise and fall together. Higher potential for large drawdowns.</p>
            </Card>
            <Card className="bg-primary/10 border-2 border-primary/20 rounded-3xl p-8 space-y-4 text-center scale-105 shadow-xl">
              <Link className="h-10 w-10 text-blue-600 mx-auto" href="#" />
              <h4 className="font-black uppercase text-xs tracking-widest text-primary">Zero ρ</h4>
              <p className="text-xs font-bold opacity-80">Assets ignore each other. The core of mathematical diversification.</p>
            </Card>
            <Card className="bg-muted/50 border-none rounded-3xl p-8 space-y-4 text-center">
              <TrendingDown className="h-10 w-10 text-green-600 mx-auto" />
              <h4 className="font-black uppercase text-xs tracking-widest">Negative ρ</h4>
              <p className="text-xs font-bold opacity-70">Hedging effect. One asset acts as a parachute for the other.</p>
            </Card>
          </div>
        </div>

        <div id="instability" className="space-y-8 pt-20 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">Correlation Stability & Market Regimes</h2>
          <p className="text-xl leading-relaxed">
            Correlations are not static laws; they are dynamic artifacts. During stable economic growth, Stocks and Bonds often move inversely. However, during an **Inflation Shock**, both can crash simultaneously, causing correlation to spike toward 1.0.
          </p>
          <div className="p-10 bg-red-500 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 group-hover:rotate-[24deg] transition-transform"><AlertCircle className="h-40 w-40" /></div>
            <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Warning: Correlation Convergence</h4>
            <p className="text-lg font-bold opacity-90 leading-relaxed italic max-w-3xl">
              &quot;In a crisis, all correlations go to 1.&quot; This market adage warns that diversification benefits often evaporate precisely when you need them most as liquidity flees the system.
            </p>
          </div>
        </div>

        <Alert className="bg-primary p-10 border-none shadow-2xl rounded-[3rem] text-primary-foreground">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <Zap className="h-16 w-16 text-yellow-400 shrink-0 shadow-glow" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Strategic Audit Protocol</h3>
              <p className="text-lg font-bold opacity-90 leading-relaxed italic">
                Professional managers re-evaluate their correlation matrices quarterly. If you see two assets consistently holding a correlation above 0.85, you should consider consolidating them to reduce management complexity and thematic overlap.
              </p>
            </div>
          </div>
        </Alert>
      </section>

      {/* FAQ Section */}
      <Card id="faq" className="shadow-2xl border-none">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-4xl font-black flex items-center gap-4">
            <HelpCircle className="h-10 w-10 text-primary" />
            Mastering the Matrix: FAQ
          </CardTitle>
          <CardDescription className="text-lg font-bold tracking-tight text-primary/70">Expert technical and strategic answers</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What is a 'Symmetric' matrix?", a: "In a correlation matrix, the value for Asset A vs Asset B is the same as Asset B vs Asset A. This makes the grid symmetric across the diagonal, which always contains 1.0 since an asset is perfectly correlated with itself." },
              { q: "Does a correlation of 0.0 mean 0.0 risk?", a: "No. Correlation only measures how assets move relative to each other. Even with 0.0 correlation, each individual asset still possesses its own variance and risk of loss. It simply means their risks don't arrive at the same time." },
              { q: "What's the difference between Correlation and Causation?", a: "Correlation is a statistical measure of relationship strength. Causation implies one asset's move FORCES the other. Assets can be highly correlated due to a common third factor (like Interest Rates) without causing each other to move." },
              { q: "Can correlation lead to 'Di-worse-ification'?", a: "Yes. Adding an asset with low correlation but negative expected returns will lower your portfolio risk but will also drag down your total wealth. Real diversification requires low correlation AND positive expected utility." },
              { q: "What is 'Rolling Correlation'?", a: "A technique where you calculate correlation over a moving window of time (e.g., 60 days). This exposes how stable or unstable the relationship is across different market environments." },
              { q: "Is a negative correlation (-0.5) better than low correlation (0.1)?", a: "For pure risk reduction, yes. A negative correlation actively offsets losses with gains. However, for growth-oriented portfolios, 0.1 is often preferred as it provides independence without the 'drag' of a permanent hedge." },
              { q: "Why do I need at least 30 data points?", a: "The Law of Large Numbers. With too few points, a single outlier can wildly swing the correlation coefficient, giving you a false sense of security or danger. More data increases 'statistical significance'." },
              { q: "What is 'Tail Risk' in correlation?", a: "The phenomenon where assets that are uncorrelated during 99% of market conditions suddenly become 100% correlated during extreme crash events. Normal correlation models often fail to capture this 'tail' behavior." },
              { q: "Can I correlate different asset classes (e.g., Real Estate and Bonds)?", a: "Yes, provided the data frequency matches. You can correlate anything that has a measurable return series, though you must be aware of liquidity differences (Real Estate prices are less frequent than Bond prices)." },
              { q: "How does 'Mean Reversion' affect correlation?", a: "If assets tend to return to a long-term average, their correlation might fluctuate significantly in the short term but remain stable over decades. Investors should match their analysis period to their investment horizon." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-none">
                <AccordionTrigger className="text-left font-black text-xl py-8 group hover:text-primary transition-all underline-none">
                  <div className="flex items-center gap-6">
                    <span className="text-primary/20 text-3xl font-black italic">{(i + 1).toString().padStart(2, '0')}</span>
                    {faq.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-10 pl-20 text-lg font-medium leading-relaxed border-l-4 border-primary/20 ml-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-black flex items-center gap-3 italic">
            <BarChart4 className="h-6 w-6 text-primary" />
            The Quantitative Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Portfolio Variance", desc: "Total risk aggregation", href: "/finance/portfolio-variance-calculator" },
              { title: "Efficient Frontier", desc: "Optimal allocation sweep", href: "/finance/efficient-frontier-visualizer" },
              { title: "Sharpe Ratio", desc: "Efficiency benchmarking", href: "/finance/sharpe-ratio-calculator" },
              { title: "Beta Adjuster", desc: "Market sensitivity audit", href: "/finance/beta-adjusted-portfolio-return-calculator" }
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg bg-muted/20 hover:bg-muted/40 overflow-hidden relative">
                  <div className="absolute right-0 bottom-0 p-2 opacity-10 group-hover:scale-125 transition-transform"><ArrowRightLeft className="h-10 w-10 text-primary" /></div>
                  <CardContent className="p-6">
                    <p className="font-black text-sm group-hover:text-primary transition-colors uppercase tracking-tighter">{calc.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold italic">{calc.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="bg-primary/5 border-primary/20 border-dashed border-2 shadow-inner">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] mb-4 opacity-50">Scientific Portfolio Audit Report</p>
          <p className="text-sm text-muted-foreground font-bold italic leading-relaxed max-w-4xl mx-auto">
            &quot;Asset correlation is the DNA of risk. By mastering the matrix, you transition from hopeful investing to engineered wealth management. Use these coefficients as the blueprints for your portfolio&apos;s architectural stability.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
