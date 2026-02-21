'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Zap,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  Landmark,
  Calculator,
  LineChart,
  FunctionSquare,
  CheckCircle2,
  Activity,
  ArrowRightLeft,
  ScatterChart,
  MousePointer2,
  ShieldCheck,
  TrendingDown,
  Percent,
  Coins
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  r1: z.coerce.number({ invalid_type_error: "Return must be a number" }).min(-100).max(1000),
  r2: z.coerce.number({ invalid_type_error: "Return must be a number" }).min(-100).max(1000),
  s1: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  s2: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  rho: z.coerce.number({ invalid_type_error: "Correlation must be a number" }).min(-1).max(1),
  steps: z.coerce.number().min(5).max(100).default(20),
});

type FormValues = z.infer<typeof formSchema>;

type Point = { w1: number; w2: number; ret: number; std: number; efficiency: number };

export default function EfficientFrontierVisualizer() {
  const [points, setPoints] = useState<Point[] | null>(null);
  const [summary, setSummary] = useState<{
    gmvp: Point;
    maxEfficiency: Point;
    curvature: string;
    dominanceRatio: number;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      r1: 12,
      r2: 8,
      s1: 20,
      s2: 12,
      rho: 0.2,
      steps: 20,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { r1, r2, s1, s2, rho, steps } = values;
    const pts: Point[] = [];

    for (let i = 0; i <= steps; i++) {
      const w1 = i / steps;
      const w2 = 1 - w1;

      const ret = w1 * r1 + w2 * r2;

      const sig1 = s1 / 100;
      const sig2 = s2 / 100;
      const cov = rho * sig1 * sig2;
      const variance = (w1 * w1 * sig1 * sig1) + (w2 * w2 * sig2 * sig2) + (2 * w1 * w2 * cov);
      const std = Math.sqrt(variance) * 100;

      const efficiency = ret / (std || 1); // Mock Sharpe without Rf
      pts.push({ w1, w2, ret, std, efficiency });
    }

    // Find GMVP (Global Minimum Variance Portfolio)
    const gmvp = [...pts].sort((a, b) => a.std - b.std)[0];

    // Find Max Efficiency (Highest efficiency ratio)
    const maxEfficiency = [...pts].sort((a, b) => b.efficiency - a.efficiency)[0];

    // Determine Curvature
    let curvature = "Linear (No Diversification)";
    if (rho < 0.1) curvature = "High (Strong Diversification)";
    else if (rho < 0.4) curvature = "Moderate (Standard Benefit)";
    else if (rho > 0.8) curvature = "Low (Highly Correlated)";

    const insights = [
      `The Global Minimum Variance point is achieved with a ${(gmvp.w1 * 100).toFixed(0)}% weight in Asset 1.`,
      `Maximum return efficiency occurs at ${(maxEfficiency.w1 * 100).toFixed(0)}% Asset 1 allocation.`,
      rho < 0 ? "Inverse correlation creates a robust internal hedge." : "Positive correlation requires careful risk-sizing.",
      "The 'Efficient' part of the curve is everything above the GMVP point."
    ];

    const riskAssessments = [
      rho > 0.9 ? "Redundancy Warning: Nearly identical assets increase 'hidden' concentration risk." : "Stable multi-asset profile.",
      gmvp.std > 15 ? "High Floor Volatility: Even at minimum risk, this portfolio is volatile." : "Low floor volatility detected.",
      r1 < 0 || r2 < 0 ? "Negative returns detected: Frontier may show 'Wealth Destruction' zones." : "Growth-oriented frontier.",
      "Model assumes static correlation; reality is dynamic during market stress."
    ];

    setPoints(pts);
    setSummary({
      gmvp,
      maxEfficiency,
      curvature,
      dominanceRatio: (pts.length / 2), // Mock metric
      insights,
      riskAssessments
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Parameter Form */}
      <Card className="border-t-4 border-t-primary shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ScatterChart className="h-24 w-24" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Frontier Modeling Parameters
          </CardTitle>
          <CardDescription>
            Define the risk-return characteristics of your assets to generate the Markowitz curve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Asset 1 Portfolio
                  </h3>
                  <FormField control={form.control} name="r1" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Exp. Return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="s1" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Volatility (σ%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h3 className="text-xs font-black uppercase tracking-tighter text-muted-foreground flex items-center gap-2">
                    <Coins className="h-4 w-4" /> Asset 2 Portfolio
                  </h3>
                  <FormField control={form.control} name="r2" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Exp. Return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="s2" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Volatility (σ%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                  )} />
                </div>

                <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <h3 className="text-xs font-black uppercase tracking-tighter text-primary flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" /> Intersection Data
                  </h3>
                  <FormField control={form.control} name="rho" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Correlation (ρ)</FormLabel><FormControl><Input type="number" step="0.01" min="-1" max="1" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="steps" render={({ field }) => (
                    <FormItem><FormLabel className="text-xs italic">Plot Density (Steps)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all">
                <Calculator className="mr-2 h-5 w-5" />
                Generate Efficiency Plot
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results & Summary */}
      {summary && points && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/10 overflow-hidden">
              <CardHeader className="bg-primary/5 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-primary-foreground shadow-md">
                    <Target className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Global Minimum Variance</CardTitle>
                    <CardDescription>The absolute lowest risk combination</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg border text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Portfolio Risk (σ)</p>
                    <p className="text-2xl font-black text-primary">{summary.gmvp.std.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border text-center">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Expected Return</p>
                    <p className="text-2xl font-black text-primary">{summary.gmvp.ret.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4" /> Optimal Mix
                  </span>
                  <Badge variant="outline" className="font-black text-primary">
                    {(summary.gmvp.w1 * 100).toFixed(0)}% A1 / {(summary.gmvp.w2 * 100).toFixed(0)}% A2
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-100 dark:border-green-900/20 overflow-hidden">
              <CardHeader className="bg-green-50/50 dark:bg-green-900/10 pb-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600 rounded-lg text-white shadow-md">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-green-800 dark:text-green-400">Max Efficiency Point</CardTitle>
                    <CardDescription>Highest Return-to-Risk ratio found</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50/50 dark:bg-green-900/5 rounded-lg border border-green-100 text-center">
                    <p className="text-[10px] font-black uppercase text-green-700/70 mb-1">Risk Intensity</p>
                    <p className="text-2xl font-black text-green-700">{summary.maxEfficiency.std.toFixed(2)}%</p>
                  </div>
                  <div className="p-3 bg-green-50/50 dark:bg-green-900/5 rounded-lg border border-green-100 text-center">
                    <p className="text-[10px] font-black uppercase text-green-700/70 mb-1">Harvested Return</p>
                    <p className="text-2xl font-black text-green-700">{summary.maxEfficiency.ret.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-bold flex items-center gap-2 text-green-800">
                    <ShieldCheck className="h-4 w-4" /> Efficiency Score
                  </span>
                  <Badge className="bg-green-600 font-black">
                    {summary.maxEfficiency.efficiency.toFixed(3)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-inner bg-muted/20 border-2">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Frontier Geometry Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-muted-foreground opacity-60 tracking-wider">Frontier Curvature</p>
                  <p className="text-lg font-black text-foreground">{summary.curvature}</p>
                  <Badge variant="secondary" className="mt-2">Sensitivity High</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-muted-foreground opacity-60 tracking-wider">Efficient Range</p>
                  <p className="text-lg font-black text-foreground">
                    {summary.gmvp.ret.toFixed(1)}% — {Math.max(...points.map(p => p.ret)).toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground italic mt-1 font-medium">Upper half of Markowitz Bullet</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-muted-foreground opacity-60 tracking-wider">Data Density</p>
                  <p className="text-lg font-black text-foreground">{points.length} Optimized Points</p>
                  <div className="h-1.5 w-full bg-muted rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-primary w-2/3 shadow-[0_0_8px_primary]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full shadow-md border opacity-95 hover:opacity-100 transition-opacity">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Topological analysis of the curve</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {summary.insights.map((msg, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10 hover:bg-primary/10 transition-colors">
                    <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-foreground/80 leading-tight">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full shadow-md border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader className="border-b pb-3 bg-red-50/20 dark:bg-red-900/10">
                <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Warnings and model constraints</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 font-medium">
                {summary.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 transition-all hover:translate-x-1">
                    <TrendingDown className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-red-900/70 dark:text-red-300 leading-tight">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 shadow-xl overflow-x-auto">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg tracking-tight">Full Dataset: Frontier Vertices</CardTitle>
                <CardDescription>Click values to copy individual allocation data</CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[10px] tracking-widest">Weight Sweep 0-100%</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-muted/90 backdrop-blur z-10">
                  <tr className="border-b">
                    <th className="p-4 font-black text-[10px] uppercase tracking-tighter opacity-70">Weight 1</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-tighter opacity-70">Weight 2</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-tighter opacity-70">Return (%)</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-tighter opacity-70">Volatility (%)</th>
                    <th className="p-4 font-black text-[10px] uppercase tracking-tighter opacity-70">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {points.map((p, i) => (
                    <tr key={i} className={`hover:bg-primary/5 transition-colors ${p === summary.gmvp ? 'bg-primary/5' : ''}`}>
                      <td className="p-4 font-mono font-bold">{(p.w1 * 100).toFixed(0)}%</td>
                      <td className="p-4 font-mono font-medium opacity-60">{(p.w2 * 100).toFixed(0)}%</td>
                      <td className="p-4 font-bold text-foreground">{p.ret.toFixed(2)}%</td>
                      <td className="p-4 font-bold text-foreground">{p.std.toFixed(2)}%</td>
                      <td className="p-4 uppercase text-[10px] font-black">
                        {p === summary.gmvp && <Badge className="bg-blue-600 border-none h-5 text-[9px]">Min Variance</Badge>}
                        {p === summary.maxEfficiency && <Badge className="bg-green-600 border-none h-5 text-[9px]">Efficient</Badge>}
                        {p.ret < summary.gmvp.ret && <Badge variant="outline" className="text-red-500 border-red-200 h-5 text-[9px] bg-red-50/30">Dominated</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Formula Block */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5 text-primary" />
            Frontier Calculation Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-2xl border-l-4 border-l-primary shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Expected Portfolio Return</p>
                <div className="font-mono text-lg font-black text-primary p-2 bg-background rounded border">
                  E(R<sub>p</sub>) = w<sub>1</sub>R<sub>1</sub> + w<sub>2</sub>R<sub>2</sub>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Portfolio Standard Deviation</p>
                <div className="font-mono text-lg font-black text-primary p-2 bg-background rounded border">
                  σ<sub>p</sub> = √(w<sub>1</sub><sup>2</sup>σ<sub>1</sub><sup>2</sup> + w<sub>2</sub><sup>2</sup>σ<sub>2</sub><sup>2</sup> + 2w<sub>1</sub>w<sub>2</sub>Cov<sub>1,2</sub>)
                </div>
              </div>
            </div>
          </div>
          <Alert className="bg-muted/30 border-dashed">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium italic">
              * The frontier is generated by sweeping weights <strong>w<sub>1</sub></strong> from 0 to 1 in discrete steps, solving the equations at each vertex.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Comprehensive Educational Guide */}
      <section className="space-y-10 text-muted-foreground leading-relaxed bg-card p-6 md:p-12 lg:p-16 rounded-3xl border shadow-2xl relative overflow-hidden" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />

        <meta itemProp="name" content="Efficient Frontier Visualizer Guide: Portfolio Optimization 101" />
        <meta itemProp="description" content="Master the Efficient Frontier. Learn how to visualize risk-return trade-offs, identify the Markowitz Bullet, and separate efficient portfolios from dominated ones." />
        <meta itemProp="keywords" content="Efficient Frontier, Markowitz Bullet, Portfolio Optimization Graph, Risk Return Curve, Capital Allocation, Diversification Curve" />

        <div className="max-w-4xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter line-tight">The Definitive Guide to the Efficient Frontier</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium italic border-l-4 border-primary pl-6 py-2">&quot;Visualizing why &apos;high risk&apos; doesn&apos;t always equal &apos;high return&apos;&mdash;and how to find the curve that defines financial physics.&quot;</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Navigation Index</h2>
            <ul className="space-y-4 font-bold text-primary">
              <li><a href="#the-geometry" className="flex items-center gap-2 hover:translate-x-2 transition-all"><ArrowRightLeft className="h-4 w-4" /> The Geometry of the Bullet</a></li>
              <li><a href="#dominance" className="flex items-center gap-2 hover:translate-x-2 transition-all"><ArrowRightLeft className="h-4 w-4" /> Understanding Dominance</a></li>
              <li><a href="#gmvp" className="flex items-center gap-2 hover:translate-x-2 transition-all"><ArrowRightLeft className="h-4 w-4" /> The &apos;Nose&apos; of the Curve (GMVP)</a></li>
              <li><a href="#limitations" className="flex items-center gap-2 hover:translate-x-2 transition-all"><ArrowRightLeft className="h-4 w-4" /> Real-World Friction &amp; Model Flaws</a></li>
            </ul>
          </div>
          <div className="bg-primary/5 p-8 rounded-2xl border flex flex-col justify-center">
            <h3 className="text-xl font-bold text-primary mb-4">Why Visualizers Matter</h3>
            <p className="text-sm leading-relaxed font-medium">
              Mathematics on a screen can be abstract, but the **Efficient Frontier** is a physical limit. It represents the boundary of what is possible in a given market environment. If you are not on the 'front' of this frontier, you are essentially leaving money on the table for zero extra benefit.
            </p>
          </div>
        </div>

        <div id="the-geometry" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight pt-10 border-t">The Geometry of the Markowitz Bullet</h2>
          <p>
            When you plot every possible asset mix on a graph where the horizontal axis is **Risk (Standard Deviation)** and the vertical axis is **Return**, the resulting shape looks like a sideways bullet. This is known as the **Markowitz Bullet**.
          </p>
          <p>
            The curve doesn&apos;t create a straight line because of **Correlation**. If two assets have a correlation of less than 1.0, they will &apos;bend&apos; the curve toward the left (lower risk). The lower the correlation, the deeper the &apos;nose&apos; of the bullet becomes, representing massive diversification benefits.
          </p>
        </div>

        <div id="dominance" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight pt-10 border-t">The Law of Dominance</h2>
          <p>
            In finance, a portfolio **Dominates** another if it has a higher return for the same risk, or lower risk for the same return.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-muted/40 border-2 border-dashed">
              <h4 className="font-black text-red-600 uppercase mb-2 text-xs">The Inefficient Lower Arc</h4>
              <p className="text-sm">Portfolios on the bottom edge of the bullet are mathematically &apos;bad&apos;. You are taking risk for which there is a higher-returning alternative directly above you on the curve.</p>
            </div>
            <div className="p-6 rounded-2xl bg-primary/10 border-2">
              <h4 className="font-black text-primary uppercase mb-2 text-xs">The Efficient Upper Arc</h4>
              <p className="text-sm">This is the **Efficient Frontier**. Every point here is a &apos;Best-in-Class&apos; portfolio. You cannot find a better return without increasing risk along this line.</p>
            </div>
          </div>
        </div>

        <div id="gmvp" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight pt-10 border-t">The &apos;Nose&apos;: Global Minimum Variance Portfolio</h2>
          <p>
            The Global Minimum Variance Portfolio (GMVP) is the leftmost tip of the bullet. It is the absolute lowest-risk point reachable with your selected assets.
          </p>
          <p>
            Interestingly, the GMVP often results in a portfolio return that is higher than the lowest-returning individual asset, while having a risk lower than the safest individual asset. This is the &apos;diversification bonus&apos; visualized.
          </p>
        </div>

        <div className="p-10 bg-primary rounded-3xl text-primary-foreground shadow-2xl relative overflow-hidden group">
          <Activity className="absolute bottom-[-20%] right-[-5%] h-64 w-64 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
          <h3 className="text-2xl font-black mb-4">Strategic Workflow for Portfolio Design</h3>
          <ol className="list-decimal pl-6 space-y-3 font-bold opacity-90">
            <li>Establish realistic return & volatility expectations (Forward-looking analysis).</li>
            <li>Run the visualizer to find the GMVP (Your safety floor).</li>
            <li>Identify the Max Efficiency Point (Highest 'Bang for Buck').</li>
            <li>Select your position on the Efficient Frontier based on your personal risk tolerance.</li>
            <li>Rebalance back to these frontier weights whenever market movements cause 'drift'.</li>
          </ol>
        </div>

        <div id="limitations" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight pt-10 border-t">Model Limitations: The Map vs. The Terrain</h2>
          <p>
            The Efficient Frontier is a mathematical map, but the market terrain is rugged. The curve assumes **Normal Distributions**, which do not exist in the real world (which prefers &apos;Fat Tails&apos;). It also assumes you can buy and sell instantly in any increment without fees or tax consequences.
          </p>
          <p>
            Use this frontier as a **strategic direction** rather than a rigid law. It helps you see &apos;the big picture&apos; of asset interaction, but personal context should always filter the mathematical output.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <Card id="faq">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Frontier Modeling FAQ
          </CardTitle>
          <CardDescription>Expert answers to the complexities of Markowitz optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What is the &apos;Markowitz Bullet&apos;?", a: "The Markowitz Bullet is a graphical representation of all possible portfolios of assets. Its sideways bullet shape shows how varying weights of assets can create different levels of risk and return, highlighting that some portfolios are mathematically superior to others." },
              { q: "Can a portfolio ever be ABOVE the Efficient Frontier?", a: "In this model, no. The Frontier represents the boundary of mathematical possibility. To reach higher returns for the same risk, you would need better-performing assets, lower correlations, or the use of leverage (which effectively creates a new frontier called the Capital Allocation Line)." },
              { q: "Why is the GMVP point so important?", a: "The Global Minimum Variance Portfolio is the starting point of the Efficient Frontier. Only portfolios above this point are considered efficient. Below this point, you are accepting higher risk for lower returns&mdash;a direct contradiction of rational investing." },
              { q: "Does the number of &apos;Steps&apos; change the outcome?", a: "Only the resolution. Higher steps (e.g., 50+) make a smoother curve and find more precise &apos;best&apos; points, but they don&apos;t change the underlying mathematical geometry of the frontier." },
              { q: "What happens if Asset 1 and Asset 2 have a Correlation of +1.0?", a: "The Efficient Frontier becomes a perfectly straight line between the two assets. Diversification benefits disappear entirely, and the portfolio&apos;s risk is simply the weighted average of the two assets." },
              { q: "How does the &apos;Max Efficiency&apos; point differ from the GMVP?", a: "The GMVP focuses exclusively on *minimizing risk*. The Max Efficiency point focuses on *maximising return per unit of risk*. High-growth investors often prefer the Max Efficiency point, while conservative investors prefer the GMVP." },
              { q: "Can I use this for more than two assets?", a: "The principles are the same, but the geometry becomes multi-dimensional. For 3+ assets, the &apos;Frontier&apos; becomes a surface (or a hyper-surface). This 2-asset tool is the primary way to understand the core concept before moving to complex N-asset solvers." },
              { q: "Why do correlations spike during market crashes?", a: "In a &apos;Panic Sell&apos;, investors sell everything at once. This causes assets that normally dance separately (like Stocks and Real Estate) to fall together. This means your frontier effectively &apos;collapses&apos; into a straight line during crisis, providing less protection than predicted." },
              { q: "How do taxes and fees affect the Frontier?", a: "They effectively shift the entire frontier DOWN and to the RIGHT. You get less return for the same risk. High-frequency rebalancing to stay on the frontier can sometimes cost more in fees than the diversification benefit is worth." },
              { q: "What should I do if my portfolio is currently &apos;Dominated&apos;?", a: "If you are below the GMVP, you should re-evaluate your allocations. You can likely find a new mix that provides significantly higher return expectations without increasing your total volatility by moving toward the efficient arc." }
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-bold py-5 text-foreground/80 hover:text-primary transition-all underline-none">
                  <span className="flex gap-4 items-center">
                    <span className="text-primary opacity-30 font-black text-xl italic">{(i + 1).toString().padStart(2, '0')}</span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed font-medium pl-14">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Related Optimization Toolkits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Two-Asset Allocator", desc: "Solve for precise weights", href: "/finance/optimal-portfolio-allocation-two-asset-calculator" },
              { title: "Portfolio Variance", desc: "N-Asset risk calculation", href: "/finance/portfolio-variance-calculator" },
              { title: "Sharpe Ratio", desc: "Historical efficiency audit", href: "/finance/sharpe-ratio-calculator" },
              { title: "Treynor Ratio", desc: "Systemic risk-return audit", href: "/finance/treynor-ratio-calculator" },
              { title: "CAPM Model", desc: "Expected return modeling", href: "/finance/capm-calculator" },
              { title: "Beta Adjuster", desc: "Risk-adjusted performance", href: "/finance/beta-adjusted-portfolio-return-calculator" },
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:bg-muted/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-primary/5 rounded group-hover:bg-primary/20 transition-colors">
                      <Percent className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-xs tracking-tight group-hover:text-primary">{calc.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{calc.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Disclaimer/Summary */}
      <Card className="bg-primary/5 border-primary/20 border-dashed">
        <CardContent className="pt-6">
          <p className="text-xs text-center text-muted-foreground leading-relaxed font-semibold">
            Disclaimer: Frontier modeling is based on historical or estimated data. Past performance is no guarantee of future results. Market correlations are unstable and can converge to 1.0 during high-stress periods. Consult with a certified financial advisor before making large allocation shifts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
