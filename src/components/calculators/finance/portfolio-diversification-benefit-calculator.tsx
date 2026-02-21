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
  Zap,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  Landmark,
  Calculator,
  BarChart3,
  Shield,
  TrendingDown,
  FunctionSquare,
  CheckCircle2,
  Layers,
  Activity,
  ShieldCheck,
  LayoutGrid,
  Scale,
  ArrowRightLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  weight1: z.coerce.number({ invalid_type_error: "Weight must be a number" }).min(0).max(100),
  weight2: z.coerce.number({ invalid_type_error: "Weight must be a number" }).min(0).max(100),
  volatility1: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  volatility2: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  correlation: z.coerce.number({ invalid_type_error: "Correlation must be a number" }).min(-1).max(1),
}).refine(data => Math.abs((data.weight1 + data.weight2) - 100) < 0.1, {
  message: "Weights must sum to 100%",
  path: ["weight2"],
});

type FormValues = z.infer<typeof formSchema>;

export default function PortfolioDiversificationBenefitCalculator() {
  const [result, setResult] = useState<{
    weightedAvgVol: number;
    portfolioVol: number;
    benefitAbs: number;
    benefitPct: number;
    diversificationStrength: string;
    riskEfficiency: string;
    concentrationStatus: string;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight1: 60,
      weight2: 40,
      volatility1: 18,
      volatility2: 10,
      correlation: 0.3,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { weight1, weight2, volatility1, volatility2, correlation } = values;

    // Normalize to decimals
    const w1 = weight1 / 100;
    const w2 = weight2 / 100;
    const s1 = volatility1 / 100;
    const s2 = volatility2 / 100;
    const rho = correlation;

    // Weighted Average Volatility (No diversification case)
    const weightedAvgVolDec = (w1 * s1 + w2 * s2);

    // Portfolio Volatility with Diversification
    // Formula: sqrt(w1^2*s1^2 + w2^2*s2^2 + 2*w1*w2*rho*s1*s2)
    const cov = rho * s1 * s2;
    const pVar = Math.pow(w1, 2) * Math.pow(s1, 2) + Math.pow(w2, 2) * Math.pow(s2, 2) + 2 * w1 * w2 * cov;
    const portfolioVolDec = Math.sqrt(pVar);

    // Results in %
    const weightedAvgVol = weightedAvgVolDec * 100;
    const portfolioVol = portfolioVolDec * 100;
    const benefitAbs = Math.max(0, weightedAvgVol - portfolioVol);
    const benefitPct = (benefitAbs / weightedAvgVol) * 100;

    // Logic-driven Categorization
    let diversificationStrength = "Neutral";
    if (rho < 0) diversificationStrength = "Exceptional (Hedging)";
    else if (rho < 0.2) diversificationStrength = "Strong";
    else if (rho < 0.5) diversificationStrength = "Moderate";
    else diversificationStrength = "Weak";

    let riskEfficiency = "Optimal";
    if (benefitPct < 5) riskEfficiency = "Sub-Optimal";
    else if (benefitPct > 15) riskEfficiency = "High Efficiency";

    let concentrationStatus = "Balanced";
    if (weight1 > 80 || weight2 > 80) concentrationStatus = "High Concentration";

    const insights = [
      `Diversification reduced your portfolio risk by ${benefitAbs.toFixed(2)} percentage points.`,
      `You are harvesting a ${benefitPct.toFixed(1)}% volatility reduction benefit compared to un-correlated holding.`,
      rho < 0 ? "Inverse correlation is actively protecting your downside during spikes." : "Positive correlation is limiting your diversification power.",
      "The portfolio risk is now lower than the weighted sum of its individual components."
    ];

    const riskAssessments = [
      rho > 0.8 ? "Correlation Alert: Your assets move too closely together to provide safety." : "Healthy asset separation detected.",
      weight1 > 75 || weight2 > 75 ? "Size Risk: One asset dominates the risk profile, masking diversification benefits." : "Asset weights are properly distributed.",
      "Model check: Assumes linear correlation which may break down during market liquidity events.",
      "Systemic risk (Beta) remains even if unsystematic risk is diversified away."
    ];

    setResult({
      weightedAvgVol,
      portfolioVol,
      benefitAbs,
      benefitPct,
      diversificationStrength,
      riskEfficiency,
      concentrationStatus,
      insights,
      riskAssessments
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Input Section */}
      <Card className="border-t-4 border-t-primary shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Shield className="h-24 w-24" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Portfolio Components & Interaction
          </CardTitle>
          <CardDescription>
            Input your asset weights and risk metrics to quantify the "Free Lunch" of diversification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-dashed hover:bg-muted/40 transition-colors">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Scale className="h-4 w-4" /> Primary Asset
                  </h3>
                  <FormField
                    control={form.control}
                    name="weight1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Portfolio Weight (%)</FormLabel>
                        <FormControl><Input type="number" step="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="volatility1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Volatility (Annual σ%)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 p-5 bg-muted/30 rounded-2xl border border-dashed hover:bg-muted/40 transition-colors">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Scale className="h-4 w-4" /> Secondary Asset
                  </h3>
                  <FormField
                    control={form.control}
                    name="weight2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Portfolio Weight (%)</FormLabel>
                        <FormControl><Input type="number" step="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="volatility2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Volatility (Annual σ%)</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 p-5 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col justify-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" /> Co-Movement Analysis
                  </h3>
                  <FormField
                    control={form.control}
                    name="correlation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold">Correlation Coefficient (ρ)</FormLabel>
                        <CardDescription className="text-[10px] mb-2 font-medium">-1.0 (Inverse) to +1.0 (Identical)</CardDescription>
                        <FormControl><Input type="number" step="0.01" min="-1" max="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-4 text-[10px] text-primary/60 font-black italic uppercase text-center border-t border-primary/10">
                    Weights must sum to exactly 100%
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black shadow-2xl hover:shadow-primary/30 transition-all border-b-4 border-primary-foreground/20">
                <Calculator className="mr-2 h-6 w-6" />
                Quantify Diversification Benefit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden ring-4 ring-primary/5">
            <CardHeader className="bg-primary/5 border-b pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl text-primary-foreground shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                    <Activity className="h-8 w-8" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Efficiency Scorecard</CardTitle>
                    <CardDescription className="font-bold text-primary/70">Volatility Reduction Metrics</CardDescription>
                  </div>
                </div>
                <Badge variant="default" className="h-10 px-6 text-sm font-black uppercase shadow-inner tracking-widest">
                  {result.diversificationStrength}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="p-6 bg-muted rounded-3xl border text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">Avg. Weighted Risk</p>
                  <p className="text-3xl font-black text-foreground">{result.weightedAvgVol.toFixed(2)}%</p>
                </div>
                <div className="p-6 bg-primary rounded-3xl text-primary-foreground shadow-2xl text-center flex flex-col justify-center scale-105 ring-4 ring-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Final Portfolio Risk</p>
                  <p className="text-4xl font-black">{result.portfolioVol.toFixed(2)}%</p>
                </div>
                <div className="p-6 bg-muted rounded-3xl border text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60">Benefit (Abs)</p>
                  <p className="text-3xl font-black text-green-600">-{result.benefitAbs.toFixed(2)}%</p>
                </div>
                <div className="p-6 bg-muted rounded-3xl border text-center flex flex-col justify-center text-primary">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 opacity-60 italic">Benefit Ratio</p>
                  <p className="text-3xl font-black">{result.benefitPct.toFixed(1)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pt-6 border-t border-dashed">
                <div className="flex items-center gap-4 p-5 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200">
                  <ShieldCheck className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-0.5">Risk Efficiency</p>
                    <p className="text-lg font-black text-green-900 dark:text-green-400">{result.riskEfficiency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-200">
                  <Zap className="h-10 w-10 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-0.5">Surplus Safety</p>
                    <p className="text-lg font-black text-blue-900 dark:text-blue-400">+{result.benefitPct.toFixed(1)}% Gain</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-200">
                  <Target className="h-10 w-10 text-purple-600" />
                  <div>
                    <p className="text-[10px] font-black text-purple-700 uppercase tracking-widest mb-0.5">Concentration</p>
                    <p className="text-lg font-black text-purple-900 dark:text-purple-400">{result.concentrationStatus}</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-primary/5 border-primary/20 p-6 rounded-2xl border-2">
                <Info className="h-5 w-5 text-primary" />
                <AlertDescription className="text-md font-bold text-primary/80 italic leading-relaxed">
                  <strong>The Diversification Mandate:</strong> Your current mix achieves a risk-reduction efficiency of {result.benefitPct.toFixed(1)}%. This mathematically validates the addition of Asset 2 as a defensive stabilizer for Asset 1.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="h-full border shadow-xl hover:shadow-primary/5 transition-all group">
              <CardHeader className="bg-primary/5 border-b py-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                  <CardTitle className="text-xl">Strategic Optimization</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                    <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm font-bold text-foreground/80 leading-relaxed">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/10 shadow-xl group">
              <CardHeader className="bg-red-50/20 dark:bg-red-900/10 border-b py-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 group-hover:shake transition-transform" />
                  <CardTitle className="text-xl text-red-600">Risk Audit Observations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {result.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-red-50/30 dark:bg-red-900/5 rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm">
                    <TrendingDown className="h-4 w-4 text-red-500 shrink-0 mt-1" />
                    <span className="text-sm font-semibold text-red-900/80 dark:text-red-300 leading-relaxed">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Manual Formula Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-black text-xl">
            <FunctionSquare className="h-6 w-6 text-primary" />
            The Mathematics of the "Free Lunch"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-8 bg-muted rounded-3xl border shadow-inner flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Portfolio Standard Deviation Formula</p>
              <div className="py-6 px-4 bg-background rounded-2xl border-2 border-primary/20 font-mono text-lg md:text-2xl text-primary font-black text-center shadow-lg">
                σ<sub>p</sub> = √(w<sub>1</sub><sup>2</sup>σ<sub>1</sub><sup>2</sup> + w<sub>2</sub><sup>2</sup>σ<sub>2</sub><sup>2</sup> + 2w<sub>1</sub>w<sub>2</sub>ρ<sub>12</sub>σ<sub>1</sub>σ<sub>2</sub>)
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-medium italic border-l-4 border-primary pl-4">
            Notice that if ρ (Correlation) is less than 1.0, the last term in the equation becomes smaller than it would be under perfect correlation, causing the total portfolio risk (σ<sub>p</sub>) to drop.
          </p>
        </CardContent>
      </Card>

      {/* High-Grade SEO Guide Section */}
      <section className="space-y-10 text-muted-foreground leading-relaxed bg-card p-6 md:p-12 lg:p-20 rounded-[3rem] border shadow-2xl relative" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 opacity-60" />

        <meta itemProp="name" content="The Professional Guide to Portfolio Diversification Benefit" />
        <meta itemProp="description" content="A comprehensive masterclass on how diversification reduces portfolio risk through correlation management. Learn the formulas, strategies, and psychological barriers to effective asset allocation." />
        <meta itemProp="keywords" content="Portfolio Diversification benefit, risk reduction formula, correlation coefficient finance, systematic vs unsystematic risk, asset allocation strategy, volatility drag" />

        <div className="max-w-4xl space-y-6 relative z-10">
          <Badge className="bg-primary/20 text-primary uppercase font-black tracking-widest px-6 py-2 mb-4">Investment Strategy Series</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9]">Diversification:<br />The Architecture of Safety</h1>
          <p className="text-2xl text-muted-foreground font-medium max-w-2xl border-l-8 border-primary pl-8 py-2">&quot;Understanding why a portfolio of two risky assets can be safer than holding either one individually&mdash;and how to engineer that safety.&quot;</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-12 border-t mt-12">
          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-foreground tracking-tight">Table of Contents</h2>
            <ul className="space-y-4 font-black text-primary text-lg">
              <li><a href="#definition" className="flex items-center gap-3 hover:translate-x-3 transition-transform"><ArrowRightLeft className="h-6 w-6" /> Defining the Benefit Ratio</a></li>
              <li><a href="#systematic" className="flex items-center gap-3 hover:translate-x-3 transition-transform"><ArrowRightLeft className="h-6 w-6" /> Systematic vs Idiosyncratic Risk</a></li>
              <li><a href="#correlation" className="flex items-center gap-3 hover:translate-x-3 transition-transform"><ArrowRightLeft className="h-6 w-6" /> The Correlation Multiplier Effect</a></li>
              <li><a href="#volatility-drag" className="flex items-center gap-3 hover:translate-x-3 transition-transform"><ArrowRightLeft className="h-6 w-6" /> Eliminating the Volatility Tax</a></li>
              <li><a href="#rebalancing" className="flex items-center gap-3 hover:translate-x-3 transition-transform"><ArrowRightLeft className="h-6 w-6" /> Strategic Rebalancing Protocols</a></li>
            </ul>
          </div>
          <div className="bg-muted p-10 rounded-[2rem] border-4 border-dashed border-primary/10 flex flex-col justify-center">
            <h3 className="text-2xl font-black text-foreground mb-4">&quot;Don&apos;t confuse activity with execution.&quot;</h3>
            <p className="text-lg italic opacity-80 leading-relaxed">
              Many investors &apos;di-worse-ify&apos; by adding more assets they don&apos;t understand. Real diversification is a surgical process of adding non-correlated risks to a core portfolio.
            </p>
          </div>
        </div>

        <div id="definition" className="space-y-6 pt-12">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight border-b-2 border-primary/20 pb-4">What is Diversification Benefit?</h2>
          <p className="text-lg">
            Mathematically, **Diversification Benefit** is the difference between the weighted average risk of individual assets and the actual risk of the combined portfolio. It is the quantifiable &quot;Free Lunch&quot; where you reduce total volatility without reducing the expected return of the assets involved.
          </p>
          <p className="text-lg font-medium bg-muted/30 p-8 rounded-3xl border border-primary/20 italic">
            &quot;If Stock A has a 20% risk and Stock B has a 20% risk, a 50/50 portfolio will ALWAYS have a risk of 20% or LESS. It can never be higher.&quot;
          </p>
        </div>

        <div id="systematic" className="space-y-6 pt-12">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight border-b-2 border-primary/20 pb-4">The Convergence of Risk: Systematic vs. Idiosyncratic</h2>
          <p className="text-lg">
            Diversification works because it erodes **Idiosyncratic (Unsystematic) Risk**. This is the risk specific to a single company—like a bad CEO or a product recall. By holding two or more assets, a disaster in one is offset by the stability or gain in another.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="p-8 rounded-3xl bg-red-50/50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20">
              <h4 className="font-black text-red-600 uppercase mb-4 tracking-widest text-sm">Systematic Risk (Market)</h4>
              <p className="text-sm font-bold opacity-80 leading-relaxed">External factors like inflation, wars, or interest rate hikes. This risk hits the entire market at once and cannot be diversified away. It is the &apos;floor&apos; of your risk profile.</p>
            </div>
            <div className="p-8 rounded-3xl bg-green-50/50 dark:bg-green-900/10 border-2 border-green-100 dark:border-green-900/20 shadow-lg">
              <h4 className="font-black text-green-600 uppercase mb-4 tracking-widest text-sm">Idiosyncratic Risk (Diversifiable)</h4>
              <p className="text-sm font-bold opacity-80 leading-relaxed">Company or sector specific risks. These are precisely what this calculator helps you eliminate by managing weight and correlation.</p>
            </div>
          </div>
        </div>

        <div id="correlation" className="space-y-6 pt-8">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight border-b-2 border-primary/20 pb-4">The Correlation Spectrum: From Hedge to Redundancy</h2>
          <p className="text-lg">
            The power of your diversification depends entirely on the **Correlation (ρ)**.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border text-center space-y-2">
              <span className="text-3xl font-black text-red-500">+1.0</span>
              <p className="font-bold text-xs uppercase tracking-widest">Identical</p>
              <p className="text-xs font-semibold opacity-60 italic">Zero benefit. Just more of the same risk.</p>
            </div>
            <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 text-center space-y-2">
              <span className="text-3xl font-black text-primary">0.0</span>
              <p className="font-bold text-xs uppercase tracking-widest text-primary">Orthogonal</p>
              <p className="text-xs font-semibold opacity-80">Strong mathematical reduction in volatility.</p>
            </div>
            <div className="p-6 rounded-2xl border text-center space-y-2">
              <span className="text-3xl font-black text-green-500">-1.0</span>
              <p className="font-bold text-xs uppercase tracking-widest">Inversed</p>
              <p className="text-xs font-semibold opacity-60 italic">The &apos;Holy Grail&apos;. Gains in one cancel losses in the other.</p>
            </div>
          </div>
        </div>

        <div id="volatility-drag" className="space-y-6 pt-12">
          <h2 className="text-4xl font-extrabold text-foreground tracking-tight border-b-2 border-primary/20 pb-4">Compound Interest &amp; The &quot;Volatility Tax&quot;</h2>
          <p className="text-lg">
            Low volatility is more than just peace of mind&mdash;it&apos;s mathematically more profitable. This is because of **Volatility Drag**. If you lose 20% one year, you need a 25% gain the next just to be even. By reducing volatility through diversification, you keep more of your capital compounding efficiently. This is why a &apos;smooth&apos; return of 8% often results in more wealth than a &apos;wild&apos; return averaging 8%.
          </p>
        </div>

        <Alert className="bg-primary p-8 border-none shadow-2xl rounded-[2rem] text-primary-foreground">
          <div className="flex items-center gap-6">
            <Zap className="h-12 w-12 text-yellow-400 shrink-0" />
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tighter">Pro Strategist Tip</h3>
              <p className="text-md font-bold opacity-90 leading-relaxed italic">&quot;Correlation is not static. During market panics, correlations tend to &apos;spike&apos; toward +1.0 as everyone rushes for the exit at once. Build your portfolio based on &apos;Crisis Correlation&apos; figures for true robustness.&quot;</p>
            </div>
          </div>
        </Alert>
      </section>

      {/* FAQ Section */}
      <Card id="faq">
        <CardHeader>
          <CardTitle className="text-3xl font-black flex items-center gap-3">
            <Info className="h-8 w-8 text-primary" />
            Mastering Diversification FAQ
          </CardTitle>
          <CardDescription className="text-md font-bold tracking-tight">Expert insights on risk management and portfolio architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "What exactly is &apos;Diversification Benefit&apos;?", a: "It is the quantifiable reduction in risk achieved by combining assets that are not perfectly correlated. It is calculated by subtracting the actual resulting portfolio volatility from the weighted average volatility of its individual parts." },
              { q: "Does adding more assets always increase the benefit?", a: "To a point. After about 30 non-correlated assets, the &apos;marginal benefit&apos; of adding more diminishes. At that point, you&apos;ve eliminated most diversifiable risk and are left only with systematic (market) risk." },
              { q: "Can diversification increase my returns?", a: "While it doesn&apos;t increase &apos;expected&apos; returns, it increases &apos;realized&apos; returns by reducing Volatility Drag. A smoother ride allows your money to compound more effectively over time." },
              { q: "What are the limitations of the correlation coefficient (ρ)?", a: "ρ assumes a linear relationship. In reality, assets might be uncorrelated during normal times but highly correlated during crashes. This &apos;non-linear&apos; risk is why models can sometimes underestimate crisis risk." },
              { q: "How do I find the correlation between my assets?", a: "Most brokerage tools and sites like Yahoo Finance or Portfolio Visualizer provide &apos;Correlation Matrices&apos;. You can also calculate it using historical price data over the last 1, 3, or 5 years." },
              { q: "What is &apos;Di-worse-ification&apos;?", a: "A term describing the mistake of adding assets with poor expected returns or high costs just for the sake of &apos;diversifying&apos;. Each added asset should have its own positive expected return and a distinct risk profile." },
              { q: "Is international diversification still useful?", a: "Yes, though global markets are more correlated than in the past. Emerging markets and regional specific sectors still provide different risk &apos;shocks&apos; than a purely US-based portfolio." },
              { q: "How does inflation affect diversification?", a: "Inflation often acts as a common risk factor that can cause both stocks and bonds to fall simultaneously (increasing correlation). Diversifying into &apos;real assets&apos; like commodities or property can help hedge this specific systemic risk." },
              { q: "What is the &apos;Volatility Tax&apos;?", a: "It&apos;s the mathematical penalty of variance. Because a 50% loss requires a 100% gain to recover, high volatility destroys compounding power. Diversification &apos;lowers the tax&apos; by smoothing those swings." },
              { q: "How often should I re-run this diversification audit?", a: "At least twice a year. Asset volatilities change and correlations are dynamic. Re-auditing ensures your &apos;safety buffer&apos; hasn&apos;t evaporated due to changing market conditions." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-black text-lg py-6 group hover:text-primary transition-colors underline-none">
                  <span className="flex items-center gap-6">
                    <span className="text-primary/30 text-2xl font-black italic">{(i + 1).toString().padStart(2, '0')}</span>
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-8 pl-16 text-md font-medium leading-relaxed border-l-2 ml-4">
                  {faq.a}
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
            Related Risk Management Toolkits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Portfolio Variance", desc: "Calculate total risk for N assets", href: "/finance/portfolio-variance-calculator" },
              { title: "WACC Calculator", desc: "Corporate cost of capital mix", href: "/finance/wacc-calculator" },
              { title: "Efficient Frontier", desc: "Visualize optimal allocation curve", href: "/finance/efficient-frontier-visualizer" },
              { title: "Sharpe Ratio", desc: "Assess risk-adjusted efficiency", href: "/finance/sharpe-ratio-calculator" },
              { title: "Correlation Matrix", desc: "Full asset interaction audit", href: "/finance/asset-correlation-matrix-calculator" },
              { title: "Beta Adjuster", desc: "Analyze systemic risk exposure", href: "/finance/beta-adjusted-portfolio-return-calculator" },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:bg-muted/30">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/20 transition-colors border">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-sm group-hover:text-primary transition-colors">{tool.title}</p>
                      <p className="text-[10px] text-muted-foreground font-bold">{tool.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card className="bg-primary/5 border-primary/20 border-dashed">
        <CardContent className="pt-6">
          <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.2em] mb-4 opacity-50">Scientific Asset Allocation Report</p>
          <p className="text-sm text-center text-muted-foreground font-bold italic leading-relaxed max-w-2xl mx-auto">
            "Diversification is a discipline, not a destination. Use this benefit calculator to continually verify that your portfolio architecture is providing the safety margin your capital requires."
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
