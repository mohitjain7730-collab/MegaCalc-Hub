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
  LineChart,
  Percent,
  Gauge,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  actualReturn: z.coerce.number({ invalid_type_error: "Return must be a number" }).min(-100).max(1000),
  marketReturn: z.coerce.number({ invalid_type_error: "Market return must be a number" }).min(-100).max(1000),
  riskFreeRate: z.coerce.number({ invalid_type_error: "Risk-free rate must be a number" }).min(-20).max(50),
  portfolioBeta: z.coerce.number({ invalid_type_error: "Beta must be a number" }).min(-5).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function BetaAdjustedPortfolioReturnCalculator() {
  const [result, setResult] = useState<{
    capmExpected: number;
    alpha: number;
    performanceStrength: string;
    riskProfile: string;
    marketCorrelation: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actualReturn: undefined as any,
      marketReturn: undefined as any,
      riskFreeRate: 3,
      portfolioBeta: 1,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { actualReturn, marketReturn, riskFreeRate, portfolioBeta } = values;

    // CAPM Formula: Re = Rf + Beta * (Rm - Rf)
    const capmExpected = riskFreeRate + portfolioBeta * (marketReturn - riskFreeRate);

    // Jensen's Alpha: Alpha = Rp - [Rf + Beta * (Rm - Rf)]
    const alpha = actualReturn - capmExpected;

    // Performance Strength
    let performanceStrength = "Neutral";
    if (alpha > 2) performanceStrength = "Exceptional";
    else if (alpha > 0.5) performanceStrength = "Strong";
    else if (alpha < -2) performanceStrength = "Critical Underperformance";
    else if (alpha < -0.5) performanceStrength = "Weak";

    // Risk Profile
    let riskProfile = "Market Parity";
    if (portfolioBeta > 1.5) riskProfile = "High Volatility";
    else if (portfolioBeta > 1.1) riskProfile = "Aggressive";
    else if (portfolioBeta < 0.5) riskProfile = "Conservative";
    else if (portfolioBeta < 0.9) riskProfile = "Defensive";

    // Market Correlation
    let marketCorrelation = "High";
    if (Math.abs(portfolioBeta) < 0.2) marketCorrelation = "Low / Uncorrelated";
    else if (portfolioBeta < 0) marketCorrelation = "Negative / Inverse";

    const interpretation = alpha > 0
      ? `The portfolio outperformed its risk-adjusted benchmark by ${alpha.toFixed(2)}%, generating positive value through active management or selection.`
      : `The portfolio lagged behind its expected return by ${Math.abs(alpha).toFixed(2)}% based on its systemic risk level.`;

    const recommendation = alpha > 0
      ? "Maintain current strategy but monitor if alpha is driven by luck or persistent edge. Rebalance if beta creeps beyond targets."
      : "Evaluate holdings for persistent laggards. High beta without alpha suggests unnecessary risk exposure without compensation.";

    const insights = [
      alpha > 0 ? "Positive selection effect observed" : "Negative selection effect detected",
      portfolioBeta > 1 ? "Leveraged market exposure" : "Buffer against market volatility",
      `Risk premium capture: ${(marketReturn - riskFreeRate).toFixed(2)}%`,
      portfolioBeta === 1 ? "Benchmark-tracking behavior" : "Active risk management strategy"
    ];

    const riskFactors = [
      portfolioBeta > 1.2 ? "High sensitivity to market crashes" : "Stable market sensitivity",
      alpha < -1 ? "Substantial risk-adjusted capital loss" : "Acceptable tracking variance",
      Math.abs(portfolioBeta) < 0.3 ? "Basis risk relative to index" : "High benchmark correlation",
      "Model assumes constant beta over time"
    ];

    setResult({
      capmExpected,
      alpha,
      performanceStrength,
      riskProfile,
      marketCorrelation,
      interpretation,
      recommendation,
      insights,
      riskFactors
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Portfolio Performance Parameters
          </CardTitle>
          <CardDescription>
            Analyze your risk-adjusted returns using the Capital Asset Pricing Model (CAPM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="actualReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Portfolio Actual Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 12.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketReturn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Market Benchmark Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 8.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 3.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="portfolioBeta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Portfolio Beta (β)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1.15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                <Calculator className="mr-2 h-5 w-5" />
                Analyze Risk-Adjusted Performance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary rounded-lg">
                    <LineChart className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Alpha Analysis</CardTitle>
                    <CardDescription>Jensen&apos;s Alpha &amp; Risk Adjustment</CardDescription>
                  </div>
                </div>
                <Badge variant={result.alpha >= 0 ? "default" : "destructive"} className="px-4 py-1 text-sm uppercase tracking-wider">
                  {result.alpha >= 0 ? "Positive Alpha" : "Negative Alpha"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-2xl border-2 border-dashed border-primary/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-tighter mb-1">Jensen&apos;s Alpha (α)</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black ${result.alpha >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {result.alpha > 0 ? "+" : ""}{result.alpha.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-center mt-3 text-muted-foreground max-w-[200px]">
                    Excess return above the CAPM prediction
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      Expected Return (CAPM)
                    </span>
                    <span className="font-bold">{result.capmExpected.toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Performance Strength
                    </span>
                    <Badge variant={result.alpha > 0.5 ? "secondary" : "outline"} className="font-bold">
                      {result.performanceStrength}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Risk Profile
                    </span>
                    <Badge variant="outline" className="font-bold border-orange-200 text-orange-700">
                      {result.riskProfile}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Risk-Adjusted Return</p>
                  <p className="text-xl font-bold text-primary">{(result.alpha + result.capmExpected).toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Market Sensitivity</p>
                  <p className="text-xl font-bold text-primary">{result.marketCorrelation}</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Benchmark Gap</p>
                  <p className="text-xl font-bold text-primary">{Math.abs(result.alpha).toFixed(2)}%</p>
                </div>
              </div>

              <Alert variant={result.alpha >= 0 ? "default" : "destructive"} className="bg-opacity-10">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium">
                  <strong>Strategic Note:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 text-primary">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Key performance drivers identified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10 transition-colors hover:bg-primary/10">
                    <ArrowUpRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span className="text-sm font-semibold text-foreground/80">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full shadow-sm hover:shadow-md transition-shadow border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader className="pb-3 text-red-600 dark:text-red-400">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical volatilty and correlation warnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.riskFactors.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                    <span className="text-sm font-semibold text-red-900/80 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Box */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5 text-primary" />
            Beta-Adjustment Formulas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted rounded-xl border-l-4 border-l-primary space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Expected Return (CAPM)</p>
              <p className="font-mono text-lg md:text-xl text-primary font-bold">
                E(R<sub>p</sub>) = R<sub>f</sub> + β<sub>p</sub>(R<sub>m</sub> - R<sub>f</sub>)
              </p>
            </div>
            <div className="h-px bg-border w-full" />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Jensen&apos;s Alpha</p>
              <p className="font-mono text-lg md:text-xl text-primary font-bold">
                α = R<sub>p</sub> - E(R<sub>p</sub>)
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
            <div className="p-2 border rounded"><strong>R<sub>p</sub>:</strong> Actual Return</div>
            <div className="p-2 border rounded"><strong>R<sub>f</sub>:</strong> Risk-Free Rate</div>
            <div className="p-2 border rounded"><strong>R<sub>m</sub>:</strong> Market Return</div>
            <div className="p-2 border rounded"><strong>β<sub>p</sub>:</strong> Portfolio Beta</div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-6 md:p-12 rounded-3xl border shadow-xl" itemScope itemType="https://schema.org/FinancialProduct">
        <meta itemProp="name" content="Beta Adjusted Portfolio Return & Jensen's Alpha Calculator" />
        <meta itemProp="description" content="Calculate risk-adjusted investment performance using CAPM and Jensen's Alpha. Compare your actual returns against benchmark expectations based on systemic risk (beta)." />

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">The Ultimate Guide to Beta-Adjusted Portfolio Returns</h1>
          <p className="text-xl text-muted-foreground">Master the art of separating investment luck from skill with risk-adjusted performance metrics.</p>
        </div>

        <div className="p-6 bg-muted/30 rounded-2xl border border-dashed">
          <h2 className="text-xl font-bold text-foreground mb-4">In this Guide:</h2>
          <nav className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <a href="#definition" className="text-primary hover:underline flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Understanding Risk-Adjusted Returns</a>
            <a href="#capm" className="text-primary hover:underline flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> The CAPM Model Explained</a>
            <a href="#alpha" className="text-primary hover:underline flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Alpha: The Holy Grail of Investing</a>
            <a href="#beta" className="text-primary hover:underline flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Beta: Quantifying Systemic Risk</a>
            <a href="#optimization" className="text-primary hover:underline flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Optimizing Portfolio Sensitivity</a>
          </nav>
        </div>

        <div id="definition" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">What are Beta-Adjusted Returns?</h2>
          <p>
            In the world of finance, raw returns are often misleading. A portfolio that returned 20% in a year might seem impressive, but if the market returned 25% and the portfolio took twice the market risk, that 20% is actually a underperformance. **Beta-adjusted returns** provide a fair benchmark by accounting for the specific level of risk (volatility) an investor took to achieve those gains.
          </p>
          <p>
            This methodology relies on the principle that investors should be compensated for taking **systemic risk**—the risk that cannot be diversified away. By "adjusting" for beta, we can see if a fund manager or individual investor actually added value (Alpha) or simply rode a wave of market volatility.
          </p>
        </div>

        <div id="capm" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">The Capital Asset Pricing Model (CAPM)</h2>
          <p>
            The Capital Asset Pricing Model remains the gold standard for estimating the required return on an asset. It suggests that the **Expected Return** is a function of the risk-free rate plus a premium for the asset's sensitivity to the broader market.
          </p>
          <div className="bg-primary/5 p-6 rounded-2xl border">
            <h3 className="text-xl font-bold mb-3">The Logic of the Equation</h3>
            <ul className="list-disc pl-6 space-y-3">
              <li><strong>Risk-Free Rate:</strong> The baseline return (usually 10-year Treasury yields) for taking zero risk.</li>
              <li><strong>Market Risk Premium:</strong> The difference between market returns and the risk-free rate.</li>
              <li><strong>Beta (β):</strong> A multiplier that determines how much of that premium you should earn or lose.</li>
            </ul>
          </div>
        </div>

        <div id="alpha" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Jensen's Alpha: The Measure of Skill</h2>
          <p>
            Named after Michael Jensen, **Jensen's Alpha (α)** is the mathematical difference between your actual return and the return predicted by CAPM.
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="p-4 border rounded-xl bg-green-50/50 dark:bg-green-900/10">
              <strong className="text-green-700 dark:text-green-400">Positive Alpha (α &gt; 0):</strong> Indicates the investor outperformed the risk-adjusted benchmark. This is often attributed to superior stock selection or timing.
            </li>
            <li className="p-4 border rounded-xl bg-red-50/50 dark:bg-red-900/10">
              <strong className="text-red-700 dark:text-red-400">Negative Alpha (α &lt; 0):</strong> Indicates underperformance despite the risk taken. Even if returns were positive, they weren&apos;t high enough to justify the volatility.
            </li>
          </ul>
        </div>

        <div id="beta" className="space-y-4">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Understanding Beta (β) Levels</h2>
          <p>
            Beta measures how much a portfolio moves compared to the market.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { val: "< 0", label: "Negative Beta", desc: "Moves opposite to the market (Inversive/Insurance)." },
              { val: "0 - 1", label: "Low Beta", desc: "Less volatile than the market (Defensive)." },
              { val: "1.0", label: "Market Beta", desc: "Moves in lockstep with the benchmark index." },
              { val: "> 1.0", label: "High Beta", desc: "Magnifies market movements (Aggressive)." },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl border bg-muted/20 text-center">
                <span className="text-2xl font-black text-primary">{item.val}</span>
                <p className="font-bold text-sm my-1">{item.label}</p>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-10" />

        <h2 className="text-2xl font-bold text-foreground">Strategic Implications for Investors</h2>
        <p>
          By using this calculator, you can transition from &quot;Raw Performance Tracking&quot; to &quot;Efficiency Tracking.&quot; If you have a High Beta portfolio and only moderate returns, you are essentially &quot;gambling without a payout.&quot; Conversely, if you can maintain a Beta close to 1.0 while generating persistent Alpha, you have found a sustainable competitive advantage in the markets.
        </p>

        <Alert className="bg-primary/5 border-primary/20">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Re-calculate your portfolio beta quarterly as correlations between assets change during different economic cycles (e.g., inflation vs. deflation).
          </AlertDescription>
        </Alert>
      </section>

      {/* FAQ Section */}
      <Card id="faq">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Expert answers to your most common questions about risk-adjusted returns</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left font-semibold">What is the difference between ROI and Beta-Adjusted Return?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                ROI (Return on Investment) is a raw measure of how much money you made or lost. Beta-Adjusted return is a &quot;fairness&quot; measure; it asks if the ROI you achieved was worth the volatility you endured. A 10% ROI might be great for a savings account but terrible for a crypto-heavy portfolio.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left font-semibold">Why is a Risk-Free Rate needed in the calculation?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The Risk-Free Rate (usually the yield on a government bond) represents the return you could get without taking any risk. We subtract this from the market and portfolio returns to isolate the &quot;Risk Premium&quot;&mdash;the extra return earned specifically for entering the risky stock market.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left font-semibold">Can Alpha be negative even if I made money?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. If your portfolio returned 10% but the CAPM model predicted it should have returned 12% (due to high market gains and your high beta), your Alpha would be -2%. This means you underperformed relative to the risk you took.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left font-semibold">What is a &quot;Good&quot; Jensen&apos;s Alpha?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Any Alpha above zero is theoretically &apos;good&apos; as it implies you beat a passively managed risk-equivalent. Professional fund managers often target an Alpha of 1-3% per year. Sustaining an Alpha above 5% is extremely rare and usually indicates a highly specialized strategy or insider edge.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left font-semibold">How do I find my portfolio&apos;s Beta?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can calculate it by doing a weighted average of the betas of all individual stocks in your portfolio. Most brokerage tools (like Fidelity, E*Trade, or Bloomberg) will also provide a real-time &apos;Portfolio Beta&apos; metric in their analysis tabs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-left font-semibold">Does Alpha account for taxes and fees?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The standard Jensen&apos;s Alpha formula does not automatically include fees or taxes. To get a true &quot;Net Alpha,&quot; you must use your Net Returns (after all expenses) as the Actual Return input in this calculator.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-left font-semibold">Is Beta a perfect measure of risk?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. Beta only measures **systemic risk** (market-wide issues). it does not measure **idiosyncratic risk** (like a specific CEO being fired). Investors should also look at metrics like Standard Deviation or Max Drawdown for a fuller risk picture.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-left font-semibold">Can Beta change over time?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely. Beta is historically sensitive. A stock might have a beta of 0.8 during a boom and 1.5 during a crash as correlations tend to converge (everything falls together) during market panics.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-left font-semibold">What happens if market returns are negative?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Alpha is even more critical in down markets. If the market is down -10% and you have a beta of 1.0, but you only lost -5%, you have generated a positive Alpha of +5%. You added value by protecting capital better than expected.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10">
              <AccordionTrigger className="text-left font-semibold">Is it better to have High Alpha or Low Beta?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Ideally, you want both. The &quot;Holy Grail&quot; is a low-beta portfolio (stable) that generates high alpha (extra return). This creates a high Sharpe Ratio, indicating excellent risk-adjusted efficiency.
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
            Related Portfolio Analysis Tools
          </CardTitle>
          <CardDescription>
            Deepen your investment analysis with these specialized financial calculators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Sharpe Ratio", desc: "Risk-adjusted return vs volatility", icon: <Zap className="h-5 w-5 text-yellow-600" />, href: "/sharpe-ratio-calculator" },
              { title: "Treynor Ratio", desc: "Return per unit of market risk", icon: <TrendingUp className="h-5 w-5 text-green-600" />, href: "/treynor-ratio-calculator" },
              { title: "Portfolio Variance", desc: "Measure total portfolio risk", icon: <BarChart3 className="h-5 w-5 text-blue-600" />, href: "/portfolio-variance-calculator" },
              { title: "WACC Calculator", desc: "Weighted Average Cost of Capital", icon: <Landmark className="h-5 w-5 text-purple-600" />, href: "/wacc-calculator" },
              { title: "Information Ratio", desc: "Active return over tracking error", icon: <Target className="h-5 w-5 text-orange-600" />, href: "/information-ratio-calculator" },
              { title: "Capm Calculator", desc: "Standard expected return model", icon: <FunctionSquare className="h-5 w-5 text-indigo-600" />, href: "/capm-calculator" },
            ].map((calc, i) => (
              <Link key={i} href={calc.href} className="block group">
                <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      {calc.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{calc.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{calc.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-2">
          <p>The Beta-Adjusted Portfolio Return Calculator is an essential tool for sophisticated investors who seek to understand the efficiency of their capital allocation.</p>
          <p>By determining your Jensen's Alpha, you can objectively assess whether your investment choices are adding value beyond what could be achieved by simply buying a broad market index.</p>
          <p>Regular use of this tool helps in maintaining a disciplined approach to risk-taking and performance evaluation across varying market cycles.</p>
        </CardContent>
      </Card>
    </div>
  );
}
