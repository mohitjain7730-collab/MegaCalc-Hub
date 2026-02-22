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
  DollarSign,
  BarChart3,
  Shield,
  TrendingDown,
  FunctionSquare,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRightLeft,
  Activity,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  asset1Return: z.coerce.number({ invalid_type_error: "Return must be a number" }).min(-100).max(1000),
  asset2Return: z.coerce.number({ invalid_type_error: "Return must be a number" }).min(-100).max(1000),
  asset1Volatility: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  asset2Volatility: z.coerce.number({ invalid_type_error: "Volatility must be a number" }).min(0.01).max(500),
  correlation: z.coerce.number({ invalid_type_error: "Correlation must be a number" }).min(-1).max(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function OptimalPortfolioAllocationCalculator() {
  const [result, setResult] = useState<{
    w1: number;
    w2: number;
    portfolioReturn: number;
    portfolioVolatility: number;
    diversificationBenefit: number;
    allocationStrategy: string;
    riskEfficiency: string;
    diversificationLevel: string;
    insights: string[];
    riskAssessments: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset1Return: 10,
      asset2Return: 6,
      asset1Volatility: 15,
      asset2Volatility: 10,
      correlation: 0.2,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { asset1Return, asset2Return, asset1Volatility, asset2Volatility, correlation } = values;

    // Normalize to decimals for calculation
    const r1 = asset1Return / 100;
    const r2 = asset2Return / 100;
    const s1 = asset1Volatility / 100;
    const s2 = asset2Volatility / 100;
    const rho = correlation;

    // Minimum Variance Weight Formula: w1 = (s2^2 - rho*s1*s2) / (s1^2 + s2^2 - 2*rho*s1*s2)
    const cov = rho * s1 * s2;
    const numerator = Math.pow(s2, 2) - cov;
    const denominator = Math.pow(s1, 2) + Math.pow(s2, 2) - 2 * cov;

    let w1 = numerator / denominator;

    // Clamp weights between 0 and 1 (Long-only constraint)
    w1 = Math.max(0, Math.min(1, w1));
    const w2 = 1 - w1;

    // Portfolio Return
    const pReturn = (w1 * r1 + w2 * r2) * 100;

    // Portfolio Variance = w1^2*s1^2 + w2^2*s2^2 + 2*w1*w2*cov
    const pVar = Math.pow(w1, 2) * Math.pow(s1, 2) + Math.pow(w2, 2) * Math.pow(s2, 2) + 2 * w1 * w2 * cov;
    const pVolatility = Math.sqrt(pVar) * 100;

    // Diversification Benefit: Weighted Avg Vol - Portfolio Vol
    const weightedAvgVol = (w1 * s1 + w2 * s2) * 100;
    const divBenefit = weightedAvgVol - pVolatility;

    // Categorization
    let allocationStrategy = "Balanced High-Variance";
    if (w1 > 0.8) allocationStrategy = "Asset 1 Dominant";
    else if (w2 > 0.8) allocationStrategy = "Asset 2 Dominant";
    else if (Math.abs(w1 - 0.5) < 0.1) allocationStrategy = "Equal Weight Optimized";

    let riskEfficiency = "Moderate";
    const sharpeEstimate = pReturn / (pVolatility || 1);
    if (sharpeEstimate > 1.2) riskEfficiency = "High";
    else if (sharpeEstimate < 0.5) riskEfficiency = "Low";

    let diversificationLevel = "Moderate";
    if (rho < 0) diversificationLevel = "Exceptional (Inversed)";
    else if (rho < 0.3) diversificationLevel = "Strong";
    else if (rho > 0.8) diversificationLevel = "Weak";

    const insights = [
      `Optimal allocation suggests placing ${(w1 * 100).toFixed(1)}% in Asset 1.`,
      `You achieved a volatility reduction of ${divBenefit.toFixed(2)}% via diversification.`,
      rho < 0.2 ? "Low correlation significantly boosts risk-adjusted returns." : "High correlation limits the power of diversification.",
      "Rebalancing to these weights can capture the 'volatility harvesting' premium."
    ];

    const riskAssessments = [
      pVolatility > 20 ? "High absolute volatility: Expect significant drawdowns." : "Moderate volatility profile.",
      Math.abs(w1 - 1) < 0.01 || w1 < 0.01 ? "Corner solution: Portfolio is highly concentrated in one asset." : "Well-distributed allocation.",
      rho > 0.9 ? "Redundancy Alert: Assets are virtually identical; diversification is an illusion here." : "Assets provide distinct risk profiles.",
      "Input sensitivity: Small changes in volatility estimates could shift weights drastically."
    ];

    setResult({
      w1,
      w2,
      portfolioReturn: pReturn,
      portfolioVolatility: pVolatility,
      diversificationBenefit: divBenefit,
      allocationStrategy,
      riskEfficiency,
      diversificationLevel,
      insights,
      riskAssessments
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card className="border-t-4 border-t-primary shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Asset Attributes & Correlation
          </CardTitle>
          <CardDescription>
            Enter expected returns and volatility to find the mathematically optimal mix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Layers className="h-4 w-4" /> Asset 1 (High Growth)
                  </h3>
                  <FormField
                    control={form.control}
                    name="asset1Return"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Return (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="asset1Volatility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volatility (Std Dev %)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <Layers className="h-4 w-4" /> Asset 2 (Conservative)
                  </h3>
                  <FormField
                    control={form.control}
                    name="asset2Return"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Return (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="asset2Volatility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volatility (Std Dev %)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col justify-center">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-primary">
                    <ArrowRightLeft className="h-4 w-4" /> Market Synergy
                  </h3>
                  <FormField
                    control={form.control}
                    name="correlation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correlation (ρ)</FormLabel>
                        <CardDescription className="mb-2">-1.0 (Inverse) to +1.0 (Same)</CardDescription>
                        <FormControl>
                          <Input type="number" step="0.01" min="-1" max="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-2 text-[10px] text-muted-foreground italic">
                    Lower correlation drastically improves the &quot;Efficiency Ratio&quot;.
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg shadow-xl hover:shadow-primary/20 transition-all font-bold">
                <Calculator className="mr-2 h-5 w-5" />
                Solve Minimum Variance Allocation
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <Card className="overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl tracking-tighter">Optimal Allocation Solution</CardTitle>
                    <CardDescription>Mathematically derived minimum-risk weights</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="h-8 px-4 text-xs font-black uppercase">{result.allocationStrategy}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-6 bg-primary rounded-2xl text-primary-foreground shadow-inner flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Asset 1 Weight</p>
                  <p className="text-4xl font-black">{(result.w1 * 100).toFixed(1)}%</p>
                </div>
                <div className="p-6 bg-muted rounded-2xl flex flex-col items-center justify-center text-center border-2 border-dashed">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Asset 2 Weight</p>
                  <p className="text-4xl font-black">{(result.w2 * 100).toFixed(1)}%</p>
                </div>
                <div className="p-6 bg-muted rounded-2xl flex flex-col items-center justify-center text-center border">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Port. Return</p>
                  <p className="text-3xl font-black text-foreground">{result.portfolioReturn.toFixed(2)}%</p>
                </div>
                <div className="p-6 bg-muted rounded-2xl flex flex-col items-center justify-center text-center border">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Port. Volatility</p>
                  <p className="text-3xl font-black text-foreground">{result.portfolioVolatility.toFixed(2)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-[10px] font-bold text-green-700 uppercase">Risk Efficiency</p>
                    <p className="text-lg font-black text-green-900 dark:text-green-400">{result.riskEfficiency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-700 uppercase">Div. Bonus</p>
                    <p className="text-lg font-black text-blue-900 dark:text-blue-400">+{result.diversificationBenefit.toFixed(2)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-[10px] font-bold text-purple-700 uppercase">Targeting</p>
                    <p className="text-lg font-black text-purple-900 dark:text-purple-400">Low Variance</p>
                  </div>
                </div>
              </div>

              <Alert className="border-primary/20 bg-primary/5 shadow-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="font-semibold text-primary/80 italic">
                  Diversification is the only &apos;free lunch&apos; in finance. By combining these assets, you&apos;ve reduced your risk by {result.diversificationBenefit.toFixed(2)}% compared to a simple weighted average of their volatilities.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  Optimization Matrix
                </CardTitle>
                <CardDescription>Strategic findings for your portfolio</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {result.insights.map((msg, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-muted/20 rounded-lg border border-transparent hover:border-primary/20 transition-all group">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-sm font-medium leading-tight">{msg}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border shadow-sm border-orange-100 dark:border-orange-900/20">
              <CardHeader className="pb-3 border-b bg-orange-50/10">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                  <ZapOff className="h-5 w-5" />
                  Blind Spot Audit
                </CardTitle>
                <CardDescription>Critical risks and allocation warnings</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 font-medium">
                {result.riskAssessments.map((msg, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-orange-50/30 dark:bg-orange-900/5 rounded-lg border border-orange-100 dark:border-orange-900/20">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-1 shrink-0" />
                    <span className="text-sm text-orange-900/80 dark:text-orange-300 leading-tight">{msg}</span>
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
          <CardTitle className="flex items-center gap-2 text-lg">
            <FunctionSquare className="h-5 w-5 text-primary" />
            Modern Portfolio Theory Mathematics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted rounded-2xl border shadow-inner">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Global Minimum Variance Weight</p>
              <div className="py-4 px-2 bg-background rounded border font-mono text-sm md:text-base overflow-x-auto text-primary font-bold">
                w<sub>1</sub>* = (σ<sub>2</sub><sup>2</sup> - σ<sub>12</sub>) / (σ<sub>1</sub><sup>2</sup> + σ<sub>2</sub><sup>2</sup> - 2σ<sub>12</sub>)
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Portfolio Volatility (Total Risk)</p>
              <div className="py-4 px-2 bg-background rounded border font-mono text-sm md:text-base overflow-x-auto text-primary font-bold">
                σ<sub>p</sub> = √(w<sub>1</sub><sup>2</sup>σ<sub>1</sub><sup>2</sup> + w<sub>2</sub><sup>2</sup>σ<sub>2</sub><sup>2</sup> + 2w<sub>1</sub>w<sub>2</sub>σ<sub>12</sub>)
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 text-xs text-muted-foreground bg-muted/20 rounded-lg">
            <strong>Where:</strong> σ<sub>1</sub>, σ<sub>2</sub> are asset standard deviations; σ<sub>12</sub> is the covariance (ρ × σ<sub>1</sub> × σ<sub>2</sub>).
          </div>
        </CardContent>
      </Card>

      {/* Professional Guide Section */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-6 md:p-12 rounded-3xl border shadow-2xl overflow-hidden relative" itemScope itemType="https://schema.org/FinanceSummary">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

        <meta itemProp="name" content="The Definitive Guide to Two-Asset Portfolio Optimization & MPT" />
        <meta itemProp="description" content="Master the science of asset allocation with our guide on Modern Portfolio Theory, Minimum Variance Portfolios, and the mathematics of diversification." />
        <meta itemProp="keywords" content="Portfolio Allocation, Two Asset Optimization, Minimum Variance Portfolio, Diversification Benefit, Correlation Matrix, Modern Portfolio Theory, Risk Reduction" />

        <div className="space-y-4">
          <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors uppercase font-black tracking-widest px-4 py-1">Finance Expert Insight</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">The Science of Optimal Portfolio Allocation</h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl">How to mathematically eliminate uncompensated risk and build a higher-efficiency wealth engine.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Table of Contents</h2>
            <ul className="space-y-4 font-bold text-primary">
              <li><a href="#mpt" className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRightLeft className="h-4 w-4" /> The Markowitz Revolution (MPT)</a></li>
              <li><a href="#variance" className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRightLeft className="h-4 w-4" /> Solving for Minimum Variance</a></li>
              <li><a href="#correlation" className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRightLeft className="h-4 w-4" /> Correlation: The Secret Lever</a></li>
              <li><a href="#efficient-frontier" className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRightLeft className="h-4 w-4" /> Mapping the Efficient Frontier</a></li>
              <li><a href="#rebalancing" className="flex items-center gap-2 hover:translate-x-2 transition-transform"><ArrowRightLeft className="h-4 w-4" /> The Psychology of Rebalancing</a></li>
            </ul>
          </div>
          <div className="bg-muted/40 p-8 rounded-2xl border border-dashed flex flex-col justify-center">
            <h3 className="text-xl font-black text-foreground mb-4">&quot;Diversification is the only free lunch.&quot;</h3>
            <p className="text-sm italic">- Harry Markowitz, Nobel Laureate</p>
            <p className="text-xs mt-4 opacity-70 leading-relaxed text-muted-foreground">
              By combining assets that don&apos;t move in perfect sync, you can achieve a portfolio volatility that is LOWER than that of any individual asset you own. This calculator finds that perfect mathematical &apos;sweet spot&apos;.
            </p>
          </div>
        </div>

        <hr className="my-4 opactiy-20" />

        <div id="mpt" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Modern Portfolio Theory (MPT) Explained</h2>
          <p>
            Before the 1950s, investors judged stocks solo. If a stock was risky, they avoided it. **Harry Markowitz** changed everything by proving that what matters is how an asset contributes to the **Portfolio&apos;s total risk**.
          </p>
          <p>
            MPT demonstrates that by adding a high-risk asset to a low-risk portfolio, you can actually *lower* the total portfolio risk if those assets have low correlation. This counter-intuitive reality is the foundation of institutional wealth management.
          </p>
        </div>

        <div id="variance" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">The Quest for Minimum Variance</h2>
          <p>
            The **Minimum Variance Portfolio (MVP)** is the combination of assets that results in the lowest possible standard deviation of returns. For risk-averse investors, this is the Holy Grail.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-primary/5 rounded-2xl border-l-4 border-l-primary">
              <h4 className="font-black mb-2 uppercase text-xs tracking-widest text-primary">The Logic</h4>
              <p className="text-sm">We find the point where the risk of Asset 1 captures the hedging property of Asset 2, canceling out noise while retaining signal.</p>
            </div>
            <div className="p-6 bg-primary/5 rounded-2xl border-l-4 border-l-primary">
              <h4 className="font-black mb-2 uppercase text-xs tracking-widest text-primary">The Benefit</h4>
              <p className="text-sm">Avoiding "Volatility Drag". Smaller drawdowns allow for faster compounded recovery in bull markets.</p>
            </div>
          </div>
        </div>

        <div id="correlation" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Correlation: The Secret Multiplier</h2>
          <p>
            Correlation (represented as ρ) measures how two assets move relative to each other.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <li className="space-y-2">
              <div className="h-1 bg-red-500 w-full" />
              <strong className="text-foreground">+1.0 (Positive):</strong> Assets move together. No risk reduction; just a weighted average.
            </li>
            <li className="space-y-2">
              <div className="h-1 bg-blue-500 w-full" />
              <strong className="text-foreground">0.0 (Uncorrelated):</strong> Assets are independent. Significant risk reduction occurs here.
            </li>
            <li className="space-y-2">
              <div className="h-1 bg-green-500 w-full" />
              <strong className="text-foreground">-1.0 (Inverse):</strong> Assets move oppositely. The "Perfect Hedge" where risk can theoretically be zeroed.
            </li>
          </ul>
        </div>

        <Alert className="bg-primary/10 border-none shadow-xl">
          <Shield className="h-6 w-6 text-primary" />
          <AlertDescription className="text-lg font-bold text-primary">
            Critical Insight: In a market crisis, correlations tend to &apos;spike&apos; to 1.0. This means traditional diversification often fails exactly when you need it most. Always stress-test with higher correlation inputs.
          </AlertDescription>
        </Alert>

        <div id="efficient-frontier" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">The Efficient Frontier</h2>
          <p>
            For any two assets, there is a set of all possible risk-return combinations. The upper boundary of this set is the **Efficient Frontier**. Any portfolio built &apos;on&apos; this frontier is considered optimal because no other portfolio offers higher returns for that specific risk level.
          </p>
          <p>
            This calculator solves for the **very bottom tip** of that frontier—the Global Minimum Variance point.
          </p>
        </div>

        <div className="p-8 bg-muted rounded-2xl space-y-4 border">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Summary for the Prudent Investor
          </h3>
          <p className="text-sm text-muted-foreground">
            Optimal allocation is not about &quot;picking the winner.&quot; It is about constructing a robust machine that survives multiple market regimes. By using this tool, you move from speculative betting to institutional-grade engineering. Remember to re-calculate your weights at least twice a year as asset volatilities and correlations are dynamic, not static.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <Card id="faq">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Expert answers to the complexities of asset allocation math</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-bold py-6">What is &apos;Standard Deviation&apos; in this context?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Standard Deviation (Volatility) measures the range of expected outcomes. If an asset has a 10% return and a 15% standard deviation, it means that about 68% of the time, its return will fall between -5% (10-15) and +25% (10+15). High standard deviation implies high unpredictability.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-bold py-6">Why does the calculator suggest a &apos;Corner Solution&apos; (100% in one asset)?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                If Asset 1 is significantly less risky than Asset 2, and the correlation isn&apos;t low enough to provide a hedge, the math will purely favor the safer asset. To fix this, either use a lower correlation input or ensure the risk profiles of the two assets are more comparable.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-bold py-6">How do I determine the &apos;Expected Return&apos; for my assets?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Financial analysts typically use three methods: 1. Historical Averages (last 10-20 years), 2. Fundamental Estimates (Dividend Yield + Earnings Growth), 3. Institutional Capital Market Assumptions (CMA) from firms like BlackRock or JP Morgan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-bold py-6">What is the &quot;Minimum Variance Portfolio&quot;?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                The Minimum Variance Portfolio (MVP) is the specific mix of assets that results in the absolute lowest possible volatility for the entire portfolio. It is the &quot;Safest&quot; possible combination of those two risky assets.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-bold py-6">Does a lower correlation ALWAYS mean lower risk?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Yes, mathematically. Holding two assets with lower correlation creates a &quot;cancellation effect&quot; for volatility spikes. The closer the correlation is to -1.0, the more dramatic the risk reduction.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-bold py-6">Can I use this for more than two assets?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                This specific calculator uses the Two-Asset optimization formula. For 3+ assets, you need Matrix Algebra (Covariance Matrices). However, the principles remain identical: you seek the weights that minimize the total covariance of the set.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-bold py-6">What is a &apos;Sharpe Ratio&apos; and how does it relate here?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                While this calculator finds the *Minimum Risk* portfolio, the Sharpe Ratio helps find the *Most Efficient* portfolio. It&apos;s calculated as (Return - RiskFreeRate) / Volatility. This calculator helps you see if your allocation results in a high-efficiency (high Sharpe) outcome.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left font-bold py-6">How often should I re-calculate these weights?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Institutional rebalancing usually happens quarterly or semi-annually. Re-running the calculation is vital if there is a major shift in interest rates or market sentiment, as these change the volatility and correlation environment.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left font-bold py-6">Is this the same as &apos;Risk Parity&apos;?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                Not exactly. &apos;Risk Parity&apos; attempts to make each asset contribute an equal amount of Risk (volatility) to the portfolio. This calculator is &apos;Mean-Variance Optimization&apos;, which attempts to minimize *Total* Risk, regardless of which asset provides it.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left font-bold py-6">What are the flaws of this model?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                The primary flaw is its assumption that returns are &apos;Normally Distributed&apos; (the Bell Curve). In reality, markets have &apos;Fat Tails&apos; (crashes happen more than math predicts). It also assumes correlations are constant, when they often breakdown during panics.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Related Strategic Tools
          </CardTitle>
          <CardDescription>Expand your financial modeling with these specialized toolkits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Efficient Frontier", desc: "Visualize the optimal curve", icon: <TrendingUp className="h-5 w-5 text-green-600" />, href: "/efficient-frontier-visualizer" },
              { title: "Portfolio Variance", desc: "Calculate total risk across N assets", icon: <Layers className="h-5 w-5 text-blue-600" />, href: "/portfolio-variance-calculator" },
              { title: "Correllation Heatmap", desc: "Asset interaction analysis", icon: <Activity className="h-5 w-5 text-orange-600" />, href: "/asset-correlation-matrix-calculator" },
              { title: "Sharpe Ratio", desc: "Risk-adjusted performance audit", icon: <Zap className="h-5 w-5 text-yellow-600" />, href: "/sharpe-ratio-calculator" },
              { title: "Lump Sum vs SIP", desc: "Compare entry strategies", icon: <DollarSign className="h-5 w-5 text-purple-600" />, href: "/lump-sum-vs-sip-comparison-calculator" },
              { title: "WACC Optimizer", desc: "Capital structure analysis", icon: <Target className="h-5 w-5 text-indigo-600" />, href: "/wacc-calculator" },
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="group">
                <Card className="h-full hover:border-primary/50 transition-all hover:bg-muted/30">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">{calc.icon}</div>
                    <div>
                      <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{calc.title}</p>
                      <p className="text-[10px] text-muted-foreground">{calc.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Summary */}
      <Card className="bg-primary/5 border-primary/20 border-dashed">
        <CardContent className="pt-6 text-sm text-center text-muted-foreground italic font-medium">
          &quot;The most important work an investor does is determining the appropriate asset allocation&mdash;not the individual stock selection.&quot;
          Use this calculator as a fundamental compass for your long-term wealth journeys.
        </CardContent>
      </Card>
    </div>
  );
}
