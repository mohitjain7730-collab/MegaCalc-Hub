'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calculator,
  Info,
  LineChart,
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
  ArrowUpRight,
  Search,
  BookOpen,
  Milestone
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.coerce.number().min(-100, "Return cannot be less than -100%").max(1000, "Unrealistic return"),
  benchmarkReturn: z.coerce.number().min(-100, "Return cannot be less than -100%").max(1000, "Unrealistic return"),
  trackingError: z.coerce.number().positive("Tracking error must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

export default function InformationRatioCalculator() {
  const [result, setResult] = useState<{
    activeReturn: number;
    informationRatio: number;
    skillLevel: string;
    efficiencyRating: string;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: 12.5,
      benchmarkReturn: 8.0,
      trackingError: 3.2,
    },
  });

  const getSkillLevel = (ir: number) => {
    if (ir >= 1.0) return 'Exceptional';
    if (ir >= 0.75) return 'Professional Grade';
    if (ir >= 0.5) return 'Above Average';
    if (ir >= 0) return 'Average/Market Hugger';
    return 'Value Destructive';
  };

  const getEfficiencyRating = (ir: number) => {
    if (ir >= 0.5) return 'High Alpha Efficiency';
    if (ir >= 0) return 'Low Alpha Efficiency';
    return 'Inefficient Asset Selection';
  };

  const onSubmit = (v: FormValues) => {
    const activeReturn = v.portfolioReturn - v.benchmarkReturn;
    const ir = activeReturn / v.trackingError;

    const insights: string[] = [];
    const riskAssessments: string[] = [];

    // General Insights
    if (ir > 0.75) {
      insights.push("Your active strategy is generating significant alpha per unit of risk.");
      insights.push("Consistency Analysis: High probability that performance is result of skill rather than luck.");
    } else if (ir > 0) {
      insights.push("Positive outperformance, but with moderate risk efficiency.");
      insights.push("Consider if management fees justify the active deviation from the benchmark.");
    } else {
      insights.push("The portfolio is underperforming the benchmark on a risk-adjusted basis.");
      insights.push("Strategic Pivot: Evaluate if individual sector bets are cancelling each other out.");
    }

    // Risk Factors
    if (v.trackingError > 8) {
      riskAssessments.push("High Tracking Error: Significant deviation from benchmark increases 'career risk' and drawdown potential.");
    } else if (v.trackingError < 2) {
      riskAssessments.push("Low Tracking Error: Strategy is very close to benchmark. Beware of 'closet indexing' after fees.");
    }

    riskAssessments.push("Survivorship Bias: Ensure historical tracking error isn't understated due to short lookback periods.");
    riskAssessments.push("Style Drift: Monitor if the IR is driven by a temporary factor (e.g., Growth vs Value) rather than core skills.");

    setResult({
      activeReturn,
      informationRatio: ir,
      skillLevel: getSkillLevel(ir),
      efficiencyRating: getEfficiencyRating(ir),
      insights,
      riskAssessments,
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <Card className="border-t-4 border-t-primary shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <TrendingUp className="h-40 w-40" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-3">
            <BarChart4 className="h-8 w-8 text-primary" />
            Information Ratio Engine
          </CardTitle>
          <CardDescription className="text-lg font-medium italic">
            Differentiate investment skill from market beta by measuring risk-adjusted active returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="portfolioReturn"
                  render={({ field }) => (
                    <FormItem className="p-6 bg-muted/30 rounded-3xl border border-primary/10">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Portfolio Return (%)
                      </FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold text-lg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="benchmarkReturn"
                  render={({ field }) => (
                    <FormItem className="p-6 bg-muted/30 rounded-3xl border border-primary/10">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Search className="h-4 w-4" /> Benchmark Return (%)
                      </FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold text-lg" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackingError"
                  render={({ field }) => (
                    <FormItem className="p-6 bg-muted/30 rounded-3xl border border-primary/10">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Scale className="h-4 w-4" /> Tracking Error (%)
                      </FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold text-lg" {...field} /></FormControl>
                      <FormDescription className="text-[10px] italic">Annualized Std Dev of Active Return</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-16 text-xl font-black shadow-2xl hover:scale-[1.01] transition-all bg-primary hover:bg-primary/90">
                <Calculator className="mr-3 h-6 w-6" />
                Audit Active SKill
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
                  <div className="p-4 bg-primary rounded-3xl text-primary-foreground shadow-xl">
                    <Zap className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Performance Audit</CardTitle>
                    <CardDescription className="font-bold text-primary/70 italic">Active Skill Quantification</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant={result.informationRatio >= 0.5 ? "default" : "secondary"} className="px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-inner mb-2">
                    {result.skillLevel}
                  </Badge>
                  <p className="text-[10px] font-black uppercase opacity-40">Skill Consistency Rating</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="p-8 bg-muted/40 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2 relative z-10">Information Ratio (IR)</p>
                    <span className={`text-7xl font-black tracking-tighter relative z-10 ${result.informationRatio >= 0.5 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {result.informationRatio.toFixed(3)}
                    </span>
                    <Badge variant="outline" className="mt-4 font-black border-primary uppercase text-xs px-4">{result.efficiencyRating}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="p-8 bg-primary/5 rounded-3xl flex items-center justify-between border border-primary/10 shadow-sm group hover:scale-[1.02] transition-transform">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Alpha Return</p>
                      <p className="text-3xl font-black tracking-tighter">{result.activeReturn > 0 ? '+' : ''}{result.activeReturn.toFixed(2)}%</p>
                    </div>
                    <ArrowUpRight className={`h-10 w-10 ${result.activeReturn >= 0 ? 'text-green-500' : 'text-red-500'} opacity-30`} />
                  </div>
                  <div className="p-8 bg-muted/20 rounded-3xl flex items-center justify-between group hover:scale-[1.02] transition-transform">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tracking Error Allocation</p>
                      <p className="text-3xl font-black tracking-tighter text-muted-foreground">{form.getValues().trackingError.toFixed(2)}%</p>
                    </div>
                    <Scale className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-l-4 border-l-primary group">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl font-black uppercase">Alpha Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-foreground/80 leading-relaxed italic">&quot;{msg}&quot;</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-l-4 border-l-red-500 bg-red-50/5 dark:bg-red-900/5 group">
              <CardHeader className="bg-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 group-hover:shake transition-transform" />
                  <CardTitle className="text-xl font-black uppercase text-red-800 dark:text-red-400">Risk Matrix Audits</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/40 shadow-sm">
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
        <CardHeader className="bg-muted px-8 py-6 border-b">
          <CardTitle className="text-xl font-black flex items-center gap-3 italic">
            <FunctionSquare className="h-6 w-6 text-primary" />
            Performance Algebra
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-card border-l-4 border-l-primary p-8 rounded-2xl shadow-inner space-y-6">
            <div className="flex flex-col items-center gap-6">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Information Ratio Formula</p>
              <div className="py-8 px-12 bg-muted rounded-[2rem] font-mono text-xl md:text-3xl text-primary font-black border-2 border-primary/20 shadow-lg relative">
                IR = (R<sub>p</sub> - R<sub>b</sub>) / σ<sub>active</sub>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-muted-foreground italic px-4">
              <div className="flex gap-2 border-b pb-2"><Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center">p</Badge> <span>Portfolio Portfolio annualized return</span></div>
              <div className="flex gap-2 border-b pb-2"><Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center">b</Badge> <span>Benchmark annualized return</span></div>
              <div className="flex gap-2 border-b pb-2"><Badge variant="outline" className="h-4 w-4 p-0 flex items-center justify-center">σ</Badge> <span>Tracking Error (Sample Std Dev of active returns)</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Section: Understanding the Inputs */}
      <Card className="shadow-2xl border-none bg-gradient-to-br from-primary/5 via-muted to-muted/50 rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-4">
            <HelpCircle className="h-10 w-10 text-primary" />
            Deciphering the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 pt-4 relative">
          <div className="space-y-6">
            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-3xl border shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <Milestone className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Portfolio & Benchmark Return</h4>
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                These must be <strong>Annualized</strong> and <strong>Net of Fees</strong>. Most performance errors come from comparing a gross-of-fees portfolio to a net-of-fees index. Ensure apples-to-apples timeframe matching (e.g., both trailing 3-year).
              </p>
            </div>
            <div className="p-6 bg-background/80 backdrop-blur-sm rounded-3xl border shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest">Tracking Error (Active Risk)</h4>
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
                This is not total volatility. It is the &quot;wobble&quot; around the benchmark. A fund that perfectly mimics the index has 0% Tracking Error, regardless of how volatile the market itself is.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center p-10 bg-primary/10 rounded-[3rem] border-4 border-dashed border-primary/20">
            <ShieldCheck className="h-16 w-16 text-primary mb-6 mx-auto opacity-30" />
            <p className="text-sm font-bold text-primary/80 text-center leading-relaxed italic">
              &quot;The Information Ratio is the truth serum of finance. It exposes managers who 'hit it big' once through leverage while performing poorly on a consistent risk-adjusted basis.&quot;
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Guide Section */}
      <section className="space-y-12 text-muted-foreground leading-relaxed bg-card p-8 md:p-16 lg:p-24 rounded-[3rem] border shadow-2xl relative overflow-hidden" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60 pointer-events-none" />

        <meta itemProp="name" content="The Definitive Guide to Information Ratio: Quantitative Skill Audit" />
        <meta itemProp="description" content="Master the calculation and interpretation of the Information Ratio. Learn how to distinguish between investment luck and consistent skill using active risk analysis." />
        <meta itemProp="keywords" content="Information Ratio, Active Return, Tracking Error, Portfolio Optimization, Investment Skill, Alpha vs Beta, Performance Measurement" />

        <div className="max-w-4xl space-y-8 relative z-10">
          <Badge className="bg-primary/20 text-primary font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full mb-6 italic">Strategic Performance Series</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.8]">The Information<br /><span className="text-primary italic">Ratio Masterclass</span></h1>
          <p className="text-2xl text-muted-foreground font-medium max-w-3xl border-l-[12px] border-primary pl-10 py-4 italic shadow-sm bg-muted/20 rounded-r-3xl leading-snug">
            &quot;Investing is a game of probability. The Information Ratio is the scorecard that tells you if your odds are actually in your favor.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-20 border-t border-dashed mt-16">
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase underline decoration-primary/30 decoration-8 underline-offset-8">
              <BookOpen className="h-10 w-10 text-primary" /> Curated Syllabus
            </h2>
            <ul className="space-y-8">
              {[
                { id: "active-skill", label: "Defining Active Skill", desc: "The IR vs Sharpe Ratio" },
                { id: "consistency", label: "Consistency Mechanics", desc: "The role of Tracking Error" },
                { id: "benchmarks", label: "The Benchmark Trap", desc: "Choosing the right hurdles" },
                { id: "interpretation", label: "Interpreting Scores", desc: "Grinold & Kahn standards" },
                { id: "fundamental-law", label: "The Fundamental Law", desc: "Breadth vs Insight" }
              ].map((item, i) => (
                <li key={i} className="group">
                  <a href={`#${item.id}`} className="flex items-center gap-8 hover:translate-x-4 transition-transform p-6 rounded-[2rem] hover:bg-muted duration-300 border-2 border-transparent hover:border-primary/10">
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
          <div className="bg-muted p-12 rounded-[4rem] border-[12px] border-background shadow-2xl relative flex flex-col justify-center overflow-hidden">
            <div className="absolute top-4 right-4 p-8 opacity-10"><Zap className="h-32 w-32" /></div>
            <h3 className="text-3xl font-black text-foreground mb-8 leading-[1.1]">&quot;Luck is what happens when preparation meets opportunity; Skill is making that luck consistent.&quot;</h3>
            <p className="text-lg italic font-bold opacity-80 leading-relaxed border-l-4 border-primary pl-6">
              In asset management, luck is often mistaken for genius in bull markets. The Information Ratio (IR) is the tool designed to separate the two.
            </p>
          </div>
        </div>

        <div id="active-skill" className="space-y-8 pt-24 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter italic">Active Skill vs. Market Beta</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <p className="text-xl font-medium leading-relaxed">
                The **Information Ratio** differs from the Sharpe Ratio in its relative focus. While the Sharpe Ratio measures total return per unit of total risk, the Information Ratio measures **active return** per unit of **active risk**.
              </p>
              <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 shadow-inner">
                <p className="text-sm font-bold leading-relaxed italic opacity-80">
                  &quot;Any manager can beat a benchmark by simply taking more market risk (Beta). IR ensures the beat came from specific asset selection or factor timing (Alpha).&quot;
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-8 bg-muted/40 rounded-3xl border border-primary/10">
                <h4 className="text-lg font-black uppercase text-primary tracking-[0.2em] mb-4">The IR Advantage</h4>
                <ul className="space-y-4 text-sm font-bold opacity-80 italic">
                  <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> Benchmarking against specific mandates</li>
                  <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> Identifying 'Closet Indexers'</li>
                  <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" /> Evaluating active risk efficiency</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div id="interpretation" className="space-y-8 pt-20">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">The Benchmarks of Excellence</h2>
          <p className="text-xl leading-relaxed font-medium">
            Quantitative research (notably by the pioneers at Wells Fargo Investment Advisors) has established the following thresholds for IR analysis over long cycles:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8">
            <Card className="bg-red-500/10 border-none rounded-3xl p-10 space-y-4 text-center">
              <TrendingDown className="h-10 w-10 text-red-600 mx-auto" />
              <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-red-800">Below 0.0</h4>
              <p className="text-sm font-black italic">Value Drain</p>
              <p className="text-xs font-bold opacity-70">Underperforming the benchmark despite active risk taking.</p>
            </Card>
            <Card className="bg-primary/10 border-2 border-primary/20 rounded-3xl p-10 space-y-4 text-center scale-110 shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"><Badge className="font-black px-4">Pro Target</Badge></div>
              <TrendingUp className="h-10 w-10 text-primary mx-auto" />
              <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-primary">0.5 to 0.75</h4>
              <p className="text-sm font-black italic text-primary">Top Tier Manager</p>
              <p className="text-xs font-bold opacity-80 text-primary/80 uppercase">Consistently beating the index through specific skill.</p>
            </Card>
            <Card className="bg-green-500/10 border-none rounded-3xl p-10 space-y-4 text-center">
              <Zap className="h-10 w-10 text-green-600 mx-auto" />
              <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-green-800">Above 1.0</h4>
              <p className="text-sm font-black italic text-green-800">Legendary Skill</p>
              <p className="text-xs font-bold opacity-70">Exceptional risk-adjusted alpha. Rarely sustained over 10+ years.</p>
            </Card>
          </div>
        </div>

        <div id="fundamental-law" className="space-y-8 pt-24 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">The Fundamental Law of Active Management</h2>
          <p className="text-xl leading-relaxed italic font-medium">
            Richard Grinold proposed that a manager’s IR is determined by two factors: **Skill** (Information Coefficient) and **Breadth** (the number of independent bets made).
          </p>
          <div className="p-10 bg-muted/50 rounded-[3rem] border-2 border-primary/20 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Layers className="h-60 w-60" /></div>
            <div className="relative z-10 space-y-6">
              <h4 className="text-2xl font-black uppercase text-foreground italic border-b-4 border-primary/20 pb-4 inline-block tracking-tighter">IR ≈ IC × √Breadth</h4>
              <p className="text-lg font-bold opacity-90 leading-relaxed max-w-3xl border-l-8 border-primary pl-8 py-2">
                This proves that even a moderate level of insight (low IC) can produce an exceptional Information Ratio if applied across many independent opportunities (high Breadth), a key principle behind modern Quantitative Hedge Funds.
              </p>
            </div>
          </div>
        </div>

        <Alert className="bg-primary p-12 border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-[3.5rem] text-primary-foreground mt-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="p-6 bg-white/20 rounded-full backdrop-blur-lg shadow-inner"><ShieldCheck className="h-12 w-12 text-white" /></div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black uppercase tracking-tight italic">Manager Audit Protocol</h3>
              <p className="text-xl font-bold opacity-90 leading-relaxed italic max-w-4xl">
                Always request IR on a **rolling basis**. A single 5-year snapshot can hide 4 years of underperformance masked by 1 lucky year. True skill is discovered in the persistence of the ratio across various market volatility cycles.
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
            Performance Audit: FAQ
          </CardTitle>
          <CardDescription className="text-lg font-bold tracking-tight text-primary/70">Technical deep-dive for institutional analysis</CardDescription>
        </CardHeader>
        <CardContent className="px-10 pb-10">
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What exactly is the difference between IR and Sharpe?", a: "Sharpe Ratio uses total volatility and risk-free rates (absolute efficiency). Information Ratio uses Tracking Error and benchmark returns (relative efficiency). IR is for active managers; Sharpe is for asset classes." },
              { q: "Is a high Tracking Error always &apos;bad&apos;?", a: "No. High Tracking Error just means you are very different from the index. If that difference leads to consistent outperformance, your IR will remain high. It only becomes a problem when IR stays low (~0) while Tracking Error is high." },
              { q: "Can IR be negative?", a: "Yes. If the portfolio return is lower than the benchmark, the IR will be negative. This suggests the manager&apos;s active &apos;skill&apos; is actually destroying value compared to a passive index fund." },
              { q: "What is &apos;Closet Indexing&apos;?", a: "This describes managers who have low tracking error (move like the index) but charge active fees. Their IR is usually near zero or negative because their small alpha doesn&apos;t overcome their high fees." },
              { q: "How does the &apos;Law of Small Numbers&apos; impact IR?", a: "Calculating IR over a very short period (e.g., 6 months) is highly unreliable. Random noise can cause a temporarily high IR that has no statistical significance for long-term skill." },
              { q: "What benchmark should I choose?", a: "The benchmark must match the manager&apos;s mandate. Comparing a Small-Cap fund to the S&P 500 will give a &apos;fake&apos; Information Ratio because the returns are driven by size factors, not skill." },
              { q: "What is the &apos;Information Coefficient&apos; (IC)?", a: "IC measures the correlation between a manager&apos;s predictions and the actual results. It is the core input for manager&apos;s skill in the Fundamental Law of Active Management." },
              { q: "Do fees affect the Information Ratio?", a: "Significantly. IR should always be calculated net-of-fees. High fees lower the numerator (active return) without reducing the risk, leading to lower risk-adjusted efficiency for the end investor." },
              { q: "What&apos;s the relationship between IR and Alpha?", a: "Alpha is the active return (the numerator). The Information Ratio is simply Alpha scaled by the volatility of that Alpha. It puts Alpha into context." },
              { q: "How often should IR be re-calculated?", a: "Quarterly for monitoring, but decisions should be based on 3- to 5-year rolling windows to ensure &apos;Style Drift&apos; or luck isn&apos;t the primary driver of the score." }
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
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Performance Analyst's Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Treynor Ratio", desc: "Beta-adjusted performance", href: "/category/finance/treynor-ratio-calculator" },
              { title: "Sortino Ratio", desc: "Downside risk focus", href: "/category/finance/sortino-ratio-calculator" },
              { title: "Tracking Error", desc: "Active deviation audit", href: "/category/finance/tracking-error-calculator" },
              { title: "Jensen&apos;s Alpha", desc: "Pure outperformance score", href: "/category/finance/jensens-alpha-calculator" }
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg bg-muted/20 hover:bg-muted/40 relative overflow-hidden group">
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
      <Card className="bg-primary/5 border-primary/20 border-dashed border-2 shadow-inner rounded-[2.5rem]">
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] mb-4 opacity-50">Quantitative Assessment Summary</p>
          <p className="text-sm text-muted-foreground font-bold italic leading-relaxed max-w-4xl mx-auto uppercase">
            &quot;The Information Ratio is the definitive scorecard for active management. It reveals whether outperformance is a result of structural skill or erratic variance. In a world of market noise, the IR provides the signal.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
