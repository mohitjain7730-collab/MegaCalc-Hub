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
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  BarChart4,
  Zap,
  FunctionSquare,
  HelpCircle,
  LayoutGrid,
  Scale,
  ArrowUpRight,
  TrendingUp as AlphaIcon,
  Search,
  BookOpen,
  Milestone,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  portfolioReturn: z.coerce.number().min(-100, "Return cannot be less than -100%").max(1000, "Unrealistic return"),
  marketReturn: z.coerce.number().min(-100, "Return cannot be less than -100%").max(1000, "Unrealistic return"),
  riskFreeRate: z.coerce.number().min(-10, "Rate too low").max(50, "Rate too high"),
  beta: z.coerce.number().min(-5, "Beta too low").max(10, "Beta too high"),
});

type FormValues = z.infer<typeof formSchema>;

export default function JensensAlphaCalculator() {
  const [result, setResult] = useState<{
    expectedReturn: number;
    alpha: number;
    performanceTier: string;
    riskAdjustedEfficiency: string;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: 12.0,
      marketReturn: 8.5,
      riskFreeRate: 3.5,
      beta: 1.15,
    },
  });

  const getPerformanceTier = (alpha: number) => {
    if (alpha >= 5) return 'Exceptional Alpha';
    if (alpha >= 2) return 'Strong Benchmark Beat';
    if (alpha > 0) return 'Positive Outperformance';
    if (alpha === 0) return 'CAPM Neutral';
    if (alpha > -2) return 'Market Underperformer';
    return 'Severe Lagging';
  };

  const onSubmit = (v: FormValues) => {
    const expectedReturn = v.riskFreeRate + v.beta * (v.marketReturn - v.riskFreeRate);
    const alpha = v.portfolioReturn - expectedReturn;

    const insights: string[] = [];
    const riskAssessments: string[] = [];

    // Logic-driven insights
    if (alpha > 0) {
      insights.push(`You generated ${alpha.toFixed(2)}% of 'Unexplained' returns above what CAPM predicted.`);
      insights.push("Strategic Advantage: This suggests specific asset selection or factor timing edge.");
    } else if (alpha < 0) {
      insights.push(`The portfolio failed to meet its risk-adjusted hurdle by ${Math.abs(alpha).toFixed(2)}%.`);
      insights.push("Efficiency Warning: You are taking risk for which you are not being compensated.");
    }

    if (v.beta > 1.5) {
      riskAssessments.push("High Beta Risk: Your results are highly sensitive to market swings. Ensure alpha isn't just a result of momentum.");
    }

    if (v.marketReturn < v.riskFreeRate) {
      insights.push("Down-Market Analysis: Alpha is particularly valuable during benchmark contraction.");
    }

    riskAssessments.push("Model Dependency: CAPM assumes linear returns. Non-linear risks (like options) can fake positive alpha.");
    riskAssessments.push("Cost Drag: Jensen's Alpha should be evaluated after all internal management and execution costs.");

    setResult({
      expectedReturn,
      alpha,
      performanceTier: getPerformanceTier(alpha),
      riskAdjustedEfficiency: alpha > 0 ? 'Surplus' : 'Deficit',
      insights,
      riskAssessments,
    });
  };

  return (
    <div className="space-y-10 pb-20">
      <Card className="border-t-4 border-t-primary shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
          <AlphaIcon className="h-40 w-40" />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            Jensen&apos;s Alpha Engine
          </CardTitle>
          <CardDescription className="text-lg font-medium italic">
            Quantify the &quot;Abnormal Return&quot; of a portfolio relative to the Security Market Line
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="portfolioReturn"
                  render={({ field }) => (
                    <FormItem className="p-4 bg-muted/40 rounded-2xl border border-primary/10">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Portfolio Return (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketReturn"
                  render={({ field }) => (
                    <FormItem className="p-4 bg-muted/40 rounded-2xl border border-primary/10">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Market Return (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem className="p-4 bg-muted/40 rounded-2xl border border-primary/10">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Risk-Free Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beta"
                  render={({ field }) => (
                    <FormItem className="p-4 bg-muted/40 rounded-2xl border border-primary/10">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary">Systematic Beta (β)</FormLabel>
                      <FormControl><Input type="number" step="0.01" className="bg-background font-bold h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-16 text-xl font-black shadow-2xl hover:scale-[1.01] transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
                <Calculator className="mr-3 h-6 w-6" />
                Deduce Differential Alpha
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
                  <div className="p-4 bg-primary rounded-[2rem] text-primary-foreground shadow-xl -rotate-3 group hover:rotate-0 transition-transform cursor-help">
                    <AlphaIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-4xl font-black tracking-tighter">Jensen&apos;s Alpha Result</CardTitle>
                    <CardDescription className="font-bold text-primary/70 italic uppercase tracking-widest text-[10px]">Active Risk Premium (α)</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant={result.alpha >= 0 ? "default" : "destructive"} className="px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-inner mb-2">
                    {result.performanceTier}
                  </Badge>
                  <p className="text-[10px] font-black uppercase opacity-40">Portfolio Quality Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-12 flex flex-col items-center justify-center bg-muted/20 border-r border-b lg:border-b-0 space-y-4">
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Jensen&apos;s Alpha (α)</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-7xl font-black tracking-tighter ${result.alpha >= 0 ? "text-primary" : "text-red-600"}`}>
                      {result.alpha > 0 ? "+" : ""}{result.alpha.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-muted-foreground italic">&quot;Skill Surplus per Annum&quot;</p>
                </div>
                <div className="lg:col-span-2 p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 shadow-sm relative overflow-hidden">
                      <Milestone className="absolute -right-2 -bottom-2 h-16 w-16 opacity-5 rotate-12" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Expected Return (CAPM)</p>
                      <p className="text-3xl font-black tracking-tight">{result.expectedReturn.toFixed(2)}%</p>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-3xl border shadow-sm relative overflow-hidden">
                      <Scale className="absolute -right-2 -bottom-2 h-16 w-16 opacity-5 -rotate-12" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Actual Return vs. Expected</p>
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-black tracking-tight">{form.getValues().portfolioReturn.toFixed(2)}%</p>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="outline" className="font-black border-primary text-primary">{result.riskAdjustedEfficiency}</Badge>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-primary/5 border-primary/20 rounded-2xl p-6">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <AlertDescription className="text-sm font-bold text-primary italic leading-relaxed">
                      Interpretation: {result.alpha > 0 ?
                        `Your portfolio produced ${result.alpha.toFixed(2)}% more return than expected given its systematic sensitivity (Beta).` :
                        `Your portfolio lagged the CAPM hurdle by ${Math.abs(result.alpha).toFixed(2)}%, indicating a risk-adjusted deficit.`}
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-xl border-l-4 border-l-primary group bg-card">
              <CardHeader className="bg-primary/5 pb-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Strategy Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-foreground/80 leading-relaxed italic">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-l-4 border-l-red-500 bg-red-50/5 dark:bg-red-900/5 group">
              <CardHeader className="bg-red-500/10 pb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 group-hover:shake transition-transform" />
                  <CardTitle className="text-xl font-black uppercase text-red-800 dark:text-red-400">Risk Assessment Audit</CardTitle>
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
        <CardHeader className="bg-muted px-8 py-6 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-3 italic">
            <FunctionSquare className="h-6 w-6 text-primary" />
            Mathematical Ground Truth
          </CardTitle>
          <Badge className="font-black uppercase tracking-tighter">Jensen&apos;s Measure</Badge>
        </CardHeader>
        <CardContent className="p-8">
          <div className="bg-card border-l-4 border-l-primary p-8 rounded-2xl shadow-inner space-y-6">
            <div className="flex flex-col items-center gap-6">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest text-center">The Alpha Equation</p>
              <div className="py-8 px-12 bg-muted rounded-[2rem] font-mono text-xl md:text-3xl text-primary font-black border-2 border-primary/20 shadow-lg relative">
                α<sub>p</sub> = R<sub>p</sub> - [R<sub>f</sub> + β<sub>p</sub>(R<sub>m</sub> - R<sub>f</sub>)]
              </div>
            </div>
            <p className="text-sm font-bold text-muted-foreground italic text-center max-w-2xl mx-auto leading-relaxed">
              Where **[R<sub>f</sub> + β<sub>p</sub>(R<sub>m</sub> - R<sub>f</sub>)]** represents the expected return dictated by the Capital Asset Pricing Model (CAPM).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* New Section: Understanding the Inputs */}
      <Card className="shadow-2xl border-none bg-gradient-to-br from-primary/5 via-muted to-muted/50 rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-3xl font-black flex items-center gap-4 tracking-tighter">
            <HelpCircle className="h-10 w-10 text-primary" />
            Parameter Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-4 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-background rounded-3xl border shadow-sm space-y-2 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <BarChart4 className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest opacity-70">Portfolio Beta (β)</h4>
              </div>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                The systematic risk coefficient. A Beta of 1.0 means the portfolio moves with the market. A Beta of 1.5 implies 50% more volatility than the benchmark in the same direction.
              </p>
            </div>
            <div className="p-6 bg-background rounded-3xl border shadow-sm space-y-2 group hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-black text-foreground uppercase tracking-widest opacity-70">Risk-Free Rate (R<sub>f</sub>)</h4>
              </div>
              <p className="text-xs font-bold text-muted-foreground leading-relaxed italic">
                Usually the yield on a 10-year Government Treasury bond. It represents the &quot;hurdle&quot; return expected with zero default risk.
              </p>
            </div>
          </div>
          <div className="bg-primary/5 p-10 rounded-[3rem] border-4 border-dashed border-primary/10 flex flex-col justify-center">
            <h4 className="text-xl font-black mb-4 uppercase tracking-tighter flex items-center gap-2">
              <AlphaIcon className="h-6 w-6 text-primary" /> Why Alpha Matters?
            </h4>
            <p className="text-sm text-muted-foreground font-bold leading-relaxed italic border-l-4 border-primary pl-6">
              Passive investing captures 100% of Beta. Active investing only justifies its existence (and higher fees) by producing persistent, positive **Jensen&apos;s Alpha**. Without positive alpha, you are simply paying active fees for passive results.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SEO Guide Section */}
      <section className="space-y-12 text-muted-foreground leading-relaxed bg-card p-8 md:p-16 lg:p-24 rounded-[3rem] border shadow-2xl relative overflow-hidden" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60 pointer-events-none" />

        <meta itemProp="name" content="The Ultimate Guide to Jensen's Alpha: Measuring Portfolio Skill" />
        <meta itemProp="description" content="Master the calculation of Jensen's Alpha. Learn how to use the CAPM model to isolate investment skill from market-driven returns." />
        <meta itemProp="keywords" content="Jensen's Alpha, CAPM Calculator, Risk Adjusted Return, Portfolio Performance, Abnormal Return, Alpha Formula" />

        <div className="max-w-4xl space-y-8 relative z-10">
          <Badge className="bg-primary/20 text-primary font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full mb-6">Quantitative Audit Series</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tightest leading-[0.8]">The Alpha<br /><span className="text-primary italic">Detective</span></h1>
          <p className="text-2xl text-muted-foreground font-medium max-w-3xl border-l-[12px] border-primary pl-10 py-4 italic shadow-sm bg-muted/20 rounded-r-3xl leading-snug">
            &quot;Market Beta is a gift from the economy; Jensen&apos;s Alpha is a prize for the skilled manager. This guide teaches you how to tell the difference.&quot;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 pt-20 border-t border-dashed mt-16">
          <div className="space-y-12">
            <h2 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase">
              <BookOpen className="h-10 w-10 text-primary" /> Study Roadmap
            </h2>
            <ul className="space-y-8">
              {[
                { id: "defining", label: "Defining Abnormal Return", desc: "The CAPM Benchmark" },
                { id: "sml", label: "The Security Market Line", desc: "Visualizing Skill vs Beta" },
                { id: "leverage", label: "The Leverage Illusion", desc: "Why Beta is not skill" },
                { id: "interpretation", label: "Tiered Performance", desc: "What counts as 'Good' Alpha?" },
                { id: "persistence", label: "Alpha Persistence", desc: "Luck vs Structural Edge" }
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
            <div className="absolute -top-4 -right-4 p-8 opacity-10 rotate-12"><Zap className="h-32 w-32" /></div>
            <h3 className="text-3xl font-black text-foreground mb-8 leading-[1.1]">&quot;Price is what you pay; value (and Alpha) is what you get.&quot;</h3>
            <p className="text-lg italic font-bold opacity-80 leading-relaxed border-l-4 border-primary pl-6">
              In finance, Jensen&apos;s Alpha is the forensic tool used to verify if a manager&apos;s high returns are a result of genuine value-added or simply aggressive risk-taking.
            </p>
          </div>
        </div>

        <div id="defining" className="space-y-8 pt-24 border-t border-dashed">
          <h2 className="text-5xl font-black text-foreground tracking-tighter">The CAPM Threshold</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <p className="text-xl font-medium leading-relaxed">
                Jensen&apos;s Alpha measures the difference between a portfolio&apos;s actual return and the return it **should have earned** according to the Capital Asset Pricing Model (CAPM).
              </p>
              <div className="p-10 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/20 shadow-inner">
                <p className="text-sm font-bold leading-relaxed italic opacity-80">
                  &quot;If you have a Beta of 2.0, you are taking twice the market risk. You don&apos;t have Alpha unless you return more than twice the risk premium.&quot;
                </p>
              </div>
            </div>
            <div className="space-y-8 p-8 bg-muted rounded-3xl border">
              <h4 className="text-lg font-black uppercase text-primary tracking-[0.2em] mb-4">The Logic Chain</h4>
              <ul className="space-y-4 text-sm font-bold opacity-80 italic">
                <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> Market Return - Risk Free = Risk Premium</li>
                <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> Risk Premium × Beta = Your Required Return</li>
                <li className="flex gap-3"><ArrowRight className="h-5 w-5 text-primary shrink-0" /> Actual Return - Required Return = Your Alpha</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="sml" className="space-y-8 pt-24">
          <h2 className="text-5xl font-black text-foreground tracking-tighter underline decoration-primary/30 underline-offset-8">The Security Market Line</h2>
          <p className="text-xl leading-relaxed font-medium italic">
            Visualizing Alpha means plotting a point relative to the Security Market Line (SML).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 bg-muted/40 rounded-3xl space-y-4">
              <h4 className="font-black text-xl uppercase italic tracking-tighter">Above the Line</h4>
              <p className="text-sm font-bold opacity-70 leading-relaxed italic">Positive Alpha. This is where stock pickers and elite hedge funds aim to live. Every point above the line represents return gained without adding systematic exposure.</p>
            </div>
            <div className="p-10 bg-red-500/5 rounded-3xl space-y-4 border border-red-500/10">
              <h4 className="font-black text-xl uppercase italic tracking-tighter text-red-600">Below the Line</h4>
              <p className="text-sm font-bold opacity-70 leading-relaxed italic">Negative Alpha. The portfolio is &apos;leakier&apos; than the index. You are paying for risk that is not showing up in the returns.</p>
            </div>
          </div>
        </div>

        <Alert className="bg-primary p-12 border-none shadow-glow rounded-[3.5rem] text-primary-foreground transform group hover:scale-[1.01] transition-transform">
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="p-6 bg-white/20 rounded-[2rem] backdrop-blur-md shadow-xl"><Zap className="h-10 w-10 text-white" /></div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tight italic">Forensic Strategy Audit</h3>
              <p className="text-xl font-bold opacity-90 leading-relaxed italic max-w-4xl">
                Always audit the **Beta window**. A manager might have a low beta during a bull market (producing fake alpha) but suddenly spike in correlation during a crash. Audit alpha over at least two different market cycles.
              </p>
            </div>
          </div>
        </Alert>
      </section>

      {/* FAQ Section */}
      <Card id="faq" className="shadow-2xl border-none p-4 md:p-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-4xl font-black flex items-center gap-4 uppercase tracking-tighter underline underline-offset-8 decoration-primary/20">
            <HelpCircle className="h-12 w-12 text-primary" />
            Alpha Audit Checklist
          </CardTitle>
          <CardDescription className="text-lg font-bold tracking-tight text-primary/70">Demystifying the returns of the 1%</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Is Jensen&apos;s Alpha better than &apos;Excess Return&apos;?", a: "Yes. Excess return ignores risk. If you outperformed by 5% but took 3x the risk, your Jensen&apos;s Alpha would actually be negative. It corrects for the level of danger taken to get those returns." },
              { q: "What is a &apos;Good&apos; Alpha score?", a: "For institutional managers, a persistent Alpha of 1% to 2% is considered excellent. Sustaining anything above 5% over multiple years is extremely rare and usually indicates a structural information advantage." },
              { q: "Can I use Jensen&apos;s Alpha for individual stocks?", a: "Yes. It can determine if a stock has outperformed its required return based on the CAPM model. However, it is most reliable when applied to diversified portfolios where &apos;Idiosyncratic&apos; risk is minimized." },
              { q: "What&apos;s the relationship between Alpha and Beta?", a: "Beta is &apos;Market exposure&apos; (Systematic Risk). Alpha is &apos;Active selection&apos; (Manager Skill). In the equation, we subtract the Beta-driven return to find the pure Alpha-driven return." },
              { q: "How does inflation impact Alpha?", a: "Alpha is a relative measure. If inflation rises, the Risk-Free rate (T-bills) usually rises too. This increases the hurdle for managers, making positive Alpha harder to achieve." },
              { q: "Does Alpha always persist?", a: "Sadly, no. Research shows &apos;Alpha migration&apos; where skills get arbitraged away. Investors should monitor if Alpha is coming from a repeatable process or a one-time thematic windfall." },
              { q: "Can a portfolio have a negative Beta and positive Alpha?", a: "Yes. An inverse-market hedge fund (Negative Beta) can have positive Alpha if it loses less money than CAPM predicts when the market is rising, or gains more than predicted when the market is falling." },
              { q: "Is Jensen&apos;s Alpha useful for private equity?", a: "It&apos;s difficult because PE doesn&apos;t have daily &apos;market&apos; pricing (Beta calculation is harder). However, the CONCEPT of high outperformance hurdles remains the core of PE fee structures." },
              { q: "What if my Alpha is zero?", a: "Zero Alpha means you are getting exactly what you paid for in terms of risk. You are essentially a &apos;passive&apos; investor who is tracking the Security Market Line perfectly." },
              { q: "How often should Alpha be re-calculated?", a: "At least annually. However, because Beta is dynamic, most professional analysts use &apos;Rolling Alpha&apos; over 36-month windows to ensure results are not just temporary luck." }
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
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Active Management Toolkit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Treynor Ratio", desc: "Performance per unit of Beta", href: "/treynor-ratio-calculator" },
              { title: "Sharpe Ratio", desc: "Total risk efficiency", href: "/sharpe-ratio-calculator" },
              { title: "Information Ratio", desc: "Quantifying tracking error alpha", href: "/information-ratio-calculator" },
              { title: "Beta Calculator", desc: "Market sensitivity audit", href: "/beta-asset-calculator" }
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
        <CardContent className="pt-8 pb-8 text-center">
          <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.3em] mb-4 opacity-50 italic">Quantitative Performance Summary</p>
          <p className="text-sm text-muted-foreground font-bold italic leading-relaxed max-w-4xl mx-auto shadow-sm p-4 bg-background/50 rounded-2xl">
            &quot;Jensen&apos;s Alpha provides the ultimate truth in performance reporting. By stripping away the contribution of the market, it reveals the true value-add (or drain) of a manager&apos;s decisions. In a world of market beta, Alpha is the only true prize.&quot;
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
