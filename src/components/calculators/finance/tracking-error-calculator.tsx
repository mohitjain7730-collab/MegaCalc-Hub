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
  Activity,
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BarChart4,
  Zap,
  FunctionSquare,
  HelpCircle,
  LayoutGrid,
  Scale,
  ArrowRightLeft,
  Search,
  BookOpen,
  Milestone,
  BoxSelect,
  Waves
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  portfolioSeries: z.string().min(1, "Portfolio data is required"),
  benchmarkSeries: z.string().min(1, "Benchmark data is required"),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] {
  const matches = (s || '').match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  return matches.map(Number).filter(n => Number.isFinite(n));
}

export default function TrackingErrorCalculator() {
  const [result, setResult] = useState<{
    trackingError: number;
    n: number;
    convictionLevel: string;
    riskProfile: string;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioSeries: '1.2, -0.5, 2.3, -1.8, 0.4, 3.1, -2.2, 1.5',
      benchmarkSeries: '0.9, -0.2, 1.8, -1.1, 0.1, 2.7, -1.5, 1.2',
    },
  });

  const getConvictionLevel = (te: number) => {
    if (te >= 8) return 'High Conviction / Specialized';
    if (te >= 4) return 'Active Management';
    if (te >= 1) return 'Enhanced Index';
    if (te >= 0.2) return 'Index Hugger';
    return 'Pure Passive';
  };

  const onSubmit = (v: FormValues) => {
    const p = parseSeries(v.portfolioSeries);
    const b = parseSeries(v.benchmarkSeries);
    const n = Math.min(p.length, b.length);

    if (n < 3) {
      setResult(null);
      return;
    }

    const diffs = Array.from({ length: n }, (_, i) => p[i] - b[i]);
    const meanDiff = diffs.reduce((s, x) => s + x, 0) / n;
    const variance = diffs.reduce((s, x) => s + (x - meanDiff) * (x - meanDiff), 0) / (n - 1);
    const te = Math.sqrt(variance);

    const insights: string[] = [];
    const riskAssessments: string[] = [];

    // Logic for insights
    if (te > 5) {
      insights.push(`Your strategy is highly differentiated from the benchmark (${te.toFixed(2)}% TE).`);
      insights.push("Opportunity: This level of 'Active Risk' is necessary to generate significant alpha.");
    } else if (te < 1) {
      insights.push("Minimal deviation from the benchmark detected.");
      insights.push("Strategic Audit: Ensure management fees are low, as this profile mimics an index fund.");
    } else {
      insights.push("Moderate tracking error common in balanced active funds.");
    }

    // Risk assessments
    if (te > 10) {
      riskAssessments.push("Extreme Active Risk: Significant relative drawdowns are possible even if the market is rising.");
    }

    riskAssessments.push("Survivorship Bias: Past tracking error doesn't guarantee future index adherence.");
    riskAssessments.push("Cash Drag: If holding significant cash, TE will spike during market rallies.");

    setResult({
      trackingError: te,
      n,
      convictionLevel: getConvictionLevel(te),
      riskProfile: te > 4 ? 'High Active Risk' : 'Low-Moderate Active Risk',
      insights,
      riskAssessments,
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <Card className="border-t-4 border-t-primary shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <Activity className="h-40 w-40" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-3 tracking-tighter">
            <Search className="h-8 w-8 text-primary" />
            Active Risk Auditor
          </CardTitle>
          <CardDescription className="text-lg font-medium italic">
            Quantify the &quot;Maverick Risk&quot; of your portfolio relative to a benchmark return series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="portfolioSeries"
                  render={({ field }) => (
                    <FormItem className="space-y-4 p-6 bg-muted/40 rounded-3xl border border-dashed border-primary/20">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> Portfolio Returns (%)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          className="bg-background/80 font-mono text-xs resize-none placeholder:opacity-50"
                          placeholder="e.g. 1.2, -0.5, 2.3..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">Comma or space separated return series</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benchmarkSeries"
                  render={({ field }) => (
                    <FormItem className="space-y-4 p-6 bg-muted/40 rounded-3xl border border-dashed border-primary/20">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <BoxSelect className="h-4 w-4" /> Benchmark Returns (%)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          className="bg-background/80 font-mono text-xs resize-none placeholder:opacity-50"
                          placeholder="e.g. 0.9, -0.2, 1.8..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">Benchmark series for the same period</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-16 text-xl font-black shadow-2xl hover:scale-[1.01] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                <Calculator className="mr-3 h-6 w-6" />
                Deduce Tracking Error (Active Risk)
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
                  <div className="p-4 bg-primary rounded-[2.5rem] text-primary-foreground shadow-xl group hover:rotate-12 transition-transform">
                    <Waves className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Tracking Error Audit</CardTitle>
                    <CardDescription className="font-bold text-primary/70 italic uppercase text-[10px] tracking-widest">Active Standard Deviation (σ<sub>act</sub>)</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant={result.trackingError > 4 ? "default" : "secondary"} className="px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-inner mb-2">
                    {result.convictionLevel}
                  </Badge>
                  <p className="text-[10px] font-black uppercase opacity-40 italic">Active Conviction Rating</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-12 flex flex-col items-center justify-center bg-muted/20 border-r border-b lg:border-b-0 space-y-4">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Tracking Error (%)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-8xl font-black tracking-tighter text-primary">
                      {result.trackingError.toFixed(3)}%
                    </span>
                  </div>
                  <Badge variant="outline" className="font-black border-primary uppercase text-[10px] px-4 py-1">{result.riskProfile}</Badge>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Data Depth</p>
                      <p className="text-2xl font-black">{result.n} Periodic Pairs</p>
                    </div>
                    <div className="p-6 bg-muted rounded-3xl flex flex-col justify-center border-2 border-dashed">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Precision</p>
                      <p className="text-2xl font-black text-muted-foreground italic">±{result.trackingError.toFixed(2)}%</p>
                    </div>
                  </div>
                  <Alert className="bg-primary border-none text-primary-foreground p-8 rounded-[2rem] shadow-xl group">
                    <Zap className="h-10 w-10 absolute right-6 top-6 opacity-20 transition-transform group-hover:scale-125" />
                    <AlertDescription className="text-lg font-bold italic leading-relaxed relative z-10">
                      Meaning: Statistically, your portfolio&apos;s return will deviate from the benchmark by more than {result.trackingError.toFixed(2)}% roughly 32% of the time.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-l-[12px] border-l-primary group">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                  <Milestone className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl font-black uppercase tracking-tighter">Strategic Observations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-muted/40 rounded-2xl border border-transparent hover:border-primary/20 transition-all shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-foreground/80 leading-relaxed italic">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-l-[12px] border-l-red-500 bg-red-50/5 dark:bg-red-900/5 group">
              <CardHeader className="bg-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 group-hover:shake transition-transform" />
                  <CardTitle className="text-xl font-black uppercase text-red-800 dark:text-red-400 tracking-tighter">Relative Risk Audit</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-red-100/30 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-900/40 shadow-sm">
                    <TrendingDown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold text-red-900/80 dark:text-red-300 leading-relaxed italic">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Box */}
      <Card className="overflow-hidden border-2 shadow-xl">
        <CardHeader className="bg-muted px-8 py-6 border-b flex items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-3 italic">
            <FunctionSquare className="h-6 w-6 text-primary" />
            The Active Risk Function
          </CardTitle>
          <Badge variant="outline" className="font-black">Standard Deviation Analysis</Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-card border-l-4 border-l-primary p-8 rounded-2xl shadow-inner space-y-6">
            <div className="flex flex-col items-center gap-6">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Tracking Error (TE) Formula</p>
              <div className="py-8 px-12 bg-muted rounded-[2rem] font-mono text-xl md:text-3xl text-primary font-black border-2 border-primary/20 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
                TE = √[ Σ(R<sub>active,i</sub> - R<sub>active,avg</sub>)<sup>2</sup> / (n-1) ]
              </div>
            </div>
            <p className="text-sm font-bold text-muted-foreground italic text-center max-w-2xl mx-auto leading-relaxed border-t pt-8">
              Where **R<sub>active</sub>** is defined as the periodic difference: **(Portfolio Return - Benchmark Return)**. This measures the dispersion of &quot;alpha&quot; over time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Section: Understanding the Inputs */}
      <Card className="shadow-2xl border-none bg-gradient-to-br from-primary/5 via-muted to-muted/50 rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-4 tracking-tighter italic">
            <HelpCircle className="h-10 w-10 text-primary" />
            Input Logic Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-background rounded-3xl border shadow-sm space-y-2 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart4 className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest opacity-70">Matching Frequencies</h4>
              </div>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                The series must be temporally aligned. If your portfolio returns are monthly (Jan, Feb, Mar), the benchmark must also be the same months. Gaps in data will distort the standard deviation.
              </p>
            </div>
            <div className="p-6 bg-background rounded-3xl border shadow-sm space-y-2 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <BoxSelect className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest opacity-70">Unit Consistency</h4>
              </div>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                Ensure both series use the same units (e.g. percentages). Mixing decimal (0.01) with percentage (1.0) will result in a 100x error in the tracking error calculation.
              </p>
            </div>
          </div>
          <div className="bg-primary/10 p-10 rounded-[3rem] border-4 border-dashed border-primary/20 flex flex-col justify-center text-center">
            <ShieldCheck className="h-16 w-16 text-primary mb-6 mx-auto opacity-30" />
            <h4 className="text-lg font-black uppercase mb-2">The Statistical Minimum</h4>
            <p className="text-sm text-primary/80 font-bold leading-relaxed italic">
              While the engine works with 3 pairs, institutional grade tracking error requires at least **36 data points** (3 years of monthly data) to filter out market &apos;noise&apos; and establish a reliable active risk profile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Guide Section */}
      <section className="space-y-12 text-muted-foreground leading-relaxed bg-card p-8 md:p-16 lg:p-24 rounded-[3rem] border shadow-2xl relative overflow-hidden" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60 pointer-events-none" />

        <meta itemProp="name" content="The Ultimate Guide to Tracking Error: Measuring Active Conviction" />
        <meta itemProp="description" content="A comprehensive guide to calculating and interpreting Tracking Error in investment portfolios. Learn how to distinguish between closet indexing and high-conviction management." />
        <meta itemProp="keywords" content="Tracking Error, Active Risk, Portfolio Benchmarking, Closet Indexing, Information Ratio, Investment Management, Risk Assessment" />

        <div className="max-w-4xl space-y-8 relative z-10">
          <Badge className="bg-primary/20 text-primary font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full mb-6 italic shadow-inner">Institutional Risk Series</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.8] uppercase italic">The Maverick<br /><span className="text-primary not-italic">Metric</span></h1>
          <p className="text-2xl text-muted-foreground font-medium max-w-3xl border-l-[12px] border-primary pl-10 py-4 italic shadow-sm bg-muted/20 rounded-r-3xl leading-snug">
            &quot;To beat the market, you must deviate from the market. Tracking Error is the measure of that deviation.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-20 border-t border-dashed mt-16">
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase underline decoration-primary/20 underline-offset-8">
              <BookOpen className="h-10 w-10 text-primary" /> Curated Syllabus
            </h2>
            <ul className="space-y-8">
              {[
                { id: "defining", label: "Defining Active Risk", desc: "Beyond total volatility" },
                { id: "closet-indexing", label: "The Closet Index Alert", desc: "Spotting the fee thieves" },
                { id: "ranges", label: "Standard Error Ranges", desc: "Benchmarking the deviation" },
                { id: "conviction", label: "Conviction vs. Luck", desc: "The Information Ratio link" },
                { id: "limitations", label: "Non-Linear Risks", desc: "Where the metric fails" }
              ].map((item, i) => (
                <li key={i} className="group">
                  <a href={`#${item.id}`} className="flex items-center gap-8 hover:translate-x-4 transition-transform p-6 rounded-[2.5rem] hover:bg-muted duration-300 border-2 border-transparent hover:border-primary/10">
                    <span className="text-4xl font-black text-primary/20 italic group-hover:text-primary transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <p className="text-xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight uppercase">{item.label}</p>
                      <p className="text-sm font-bold opacity-60 italic">{item.desc}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-muted p-12 rounded-[4rem] border-[12px] border-background shadow-2xl relative flex flex-col justify-center overflow-hidden group">
            <div className="absolute -top-4 -right-4 p-8 opacity-10 rotate-12 group-hover:rotate-[30deg] transition-transform duration-700"><Zap className="h-32 w-32" /></div>
            <h3 className="text-3xl font-black text-foreground mb-8 leading-[1.1] italic">&quot;Being different is the only way to be better.&quot;</h3>
            <p className="text-lg italic font-bold opacity-80 leading-relaxed border-l-4 border-primary pl-6">
              In asset management, being &apos;different&apos; is the structural price of outperformance. Tracking Error quantifies that price tag.
            </p>
          </div>
        </div>

        <div id="defining" className="space-y-8 pt-24 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter italic">Defining Active Risk</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <p className="text-xl font-medium leading-relaxed">
                While standard volatility measures how much an asset swings relative to 0%, **Tracking Error** measures how much it swings relative to a **Benchmark**.
              </p>
              <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 shadow-inner">
                <p className="text-sm font-bold leading-relaxed italic opacity-80">
                  &quot;You can have a very volatile portfolio that has zero tracking error (an index ETF) or a very stable portfolio that has high tracking error (a market-neutral hedge fund).&quot;
                </p>
              </div>
            </div>
            <div className="space-y-8 p-10 bg-muted rounded-[2rem] border shadow-sm">
              <h4 className="text-lg font-black uppercase text-primary tracking-[0.2em] mb-4">The Fundamental Split</h4>
              <ul className="space-y-6 text-sm font-bold opacity-80 italic">
                <li className="flex gap-4"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> <span><strong>Passive:</strong> Minimized Tracking Error (Adherence)</span></li>
                <li className="flex gap-4"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> <span><strong>Active:</strong> Budgeted Tracking Error (Opportunity)</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div id="closet-indexing" className="space-y-8 pt-24 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase italic tracking-tight">The Closet Index Scam</h2>
          <p className="text-xl leading-relaxed font-medium max-w-4xl">
            A &quot;Closet Indexer&quot; is an active manager who charges active fees (1%+ Management Fees) but maintains a Tracking Error below 2%.
          </p>
          <div className="p-12 bg-red-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 -rotate-12 group-hover:rotate-0 transition-transform"><AlertCircle className="h-40 w-40" /></div>
            <h4 className="text-2xl font-black uppercase italic mb-6 border-b border-white/30 pb-4 inline-block tracking-widest">Financial Audit Warning</h4>
            <p className="text-lg font-bold opacity-90 leading-relaxed italic max-w-4xl relative z-10">
              &quot;If you are paying 1.5% for a fund that moves 99% in lockstep with the S&P 500, you are mathematically guaranteed to underperform after fees. Positive active risk is the only thing that justifies active pricing.&quot;
            </p>
          </div>
        </div>

        <div id="ranges" className="space-y-8 pt-24">
          <h2 className="text-5xl font-black text-foreground tracking-tighter underline underline-offset-8 decoration-primary/20 italic">Benchmark Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-10">
            {[
              { range: "< 0.5%", label: "ETF / Index", bg: "bg-muted" },
              { range: "0.5 - 2%", label: "Enhanced Index", bg: "bg-primary/5" },
              { range: "3 - 8%", label: "Traditional Active", bg: "bg-primary/10" },
              { range: "> 8%", label: "High Conviction", bg: "bg-primary/20" },
            ].map((tier, i) => (
              <Card key={i} className={`${tier.bg} border-none rounded-[2rem] p-8 text-center space-y-2 group hover:scale-105 transition-transform`}>
                <p className="text-2xl font-black tracking-tighter text-primary">{tier.range}</p>
                <p className="text-[10px] font-black uppercase opacity-60 italic">{tier.label}</p>
              </Card>
            ))}
          </div>
        </div>

        <Alert className="bg-primary p-12 border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-[3.5rem] text-primary-foreground mt-20 relative overflow-hidden">
          <Zap className="absolute -left-4 -top-4 h-32 w-32 opacity-10 -rotate-12" />
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="p-6 bg-white/20 rounded-[2rem] backdrop-blur-md"><ShieldCheck className="h-12 w-12 text-white" /></div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tight italic">Portfolio Health Protocol</h3>
              <p className="text-xl font-bold opacity-90 leading-relaxed italic max-w-4xl">
                Always evaluate Tracking Error alongside the **Information Ratio**. High Tracking Error without high Alpha is mere gambling; High Alpha with low Tracking Error is the &quot;Holy Grail&quot; of investment skill.
              </p>
            </div>
          </div>
        </Alert>
      </section>

      {/* FAQ Section */}
      <Card id="faq" className="shadow-2xl border-none p-4 md:px-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-black flex items-center gap-4 italic tracking-tighter uppercase underline underline-offset-8 decoration-primary/20">
            <HelpCircle className="h-12 w-12 text-primary" />
            Active Risk: FAQ
          </CardTitle>
          <CardDescription className="text-lg font-bold tracking-tight text-primary/70">Technical audit for professional allocators</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Is a high Tracking Error 'good' or 'bad'?", a: "Neither. It is simply a measure of deviation. If the manager has high skill, you want higher TE to capture their insights. If they have low skill, you want zero TE to avoid paying for mistakes." },
              { q: "How does Tracking Error relate to the Sharpe Ratio?", a: "Sharpe Ratio looks at total risk regardless of benchmark. Tracking Error only looks at risk relative to the index. You can have a stable fund with a high Sharpe Ratio that has high Tracking Error because it's invested in assets the index doesn't hold." },
              { q: "What causes Tracking Error in Index Funds?", a: "Fees, transaction costs, and 'dividend drag' (the time between the dividend payment and the fund reinvesting it) are the primary drivers of tracking error in passive ETFs." },
              { q: "Can Tracking Error be negative?", a: "No. Because it is a standard deviation (which involves squaring the values), tracking error is always a positive number or zero." },
              { q: "Does cash holding increase Tracking Error?", a: "Significantly. If the market is volatile and you hold 10% Cash, your portfolio will under-react to every market move, creating a large standard deviation in the difference between your returns and the benchmark's." },
              { q: "What is the 'Information Ratio' formula?", a: "IR = Alpha / Tracking Error. It effectively tells you how much 'reward' you got for every unit of 'being different' (Tracking Error) you accepted." },
              { q: "Does rebalancing affect Tracking Error?", a: "Yes. Frequent rebalancing to model weights reduces tracking error by cutting off 'drift'. However, the transaction costs of rebalancing can then increase tracking error relative to the index." },
              { q: "What's the difference between Ex-Ante and Ex-Post?", a: "Ex-Post is historical (what actually happened). Ex-Ante is predictive (based on today's holdings using a risk model like Barra to guess future deviation)." },
              { q: "Why is 3 years of data standard?", a: "Mathematically, tracking error is a standard deviation. You need enough 'n' (observations) to ensure that a few lucky months don't skew the results. 36 monthly points is the institutional minimum." },
              { q: "What is 'Style Drift'?", a: "Style drift is when a manager's tracking error suddenly spikes because they have changed their investment approach (e.g., a Value manager buying high-beta Momentum stocks). Tracking Error audits help catch this." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b last:border-none">
                <AccordionTrigger className="text-left font-black text-xl py-8 group hover:text-primary transition-all underline-none">
                  <div className="flex items-center gap-6">
                    <span className="text-primary/10 text-4xl font-black italic">{(i + 1).toString().padStart(2, '0')}</span>
                    {faq.q}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-10 pl-24 text-lg font-medium leading-relaxed border-l-4 border-primary/20 ml-6">
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
            <LayoutGrid className="h-6 w-6 text-primary" />
            Quant Specialist Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Information Ratio", desc: "Risk-adjusted active returns", href: "/information-ratio-calculator" },
              { title: "Jensen's Alpha", desc: "Differential skill audit", href: "/jensens-alpha-calculator" },
              { title: "Standard Deviation", desc: "Total volatility engine", href: "/volatility-standard-deviation-calculator" },
              { title: "Sharpe Ratio", desc: "Absolute return efficiency", href: "/sharpe-ratio-calculator" }
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg bg-muted/20 hover:bg-muted/40 relative overflow-hidden">
                  <div className="absolute -right-2 -bottom-2 p-2 opacity-5 group-hover:scale-150 transition-transform"><BookOpen className="h-12 w-12 text-primary" /></div>
                  <CardContent className="p-6">
                    <p className="font-black text-sm group-hover:text-primary transition-colors uppercase tracking-widest">{calc.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold italic tracking-tighter opacity-70 uppercase">{calc.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="bg-primary/5 border-primary/20 border-dashed border-2 shadow-inner rounded-[2.5rem] mt-10">
        <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
          <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-50 italic">Quantitative Performance Audit Report</p>
          <p className="text-sm font-bold italic leading-relaxed max-w-4xl mx-auto p-6 bg-background/50 rounded-3xl shadow-sm border border-primary/10">
            &quot;Tracking Error is the price of active management. It is not an indicator of goodness, but of conviction. By quantifying the deviation, investors can determine if a manager is truly active or simply an expensive passenger on the market&apos;s beta.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
