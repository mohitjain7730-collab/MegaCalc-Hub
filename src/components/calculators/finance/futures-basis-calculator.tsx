'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Zap, TrendingUp, AlertCircle, Target, Info, Calculator, DollarSign, Shield, TrendingDown, FunctionSquare, CheckCircle2, ArrowRightLeft, Activity, Landmark, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  spotPrice: z.number().positive('Spot price must be positive'),
  futuresPrice: z.number().positive('Futures price must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesBasisCalculator() {
  const [result, setResult] = useState<{
    basis: number;
    basisPercentage: number;
    marketStructure: string; // Contango or Backwardation
    signalStrength: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spotPrice: undefined,
      futuresPrice: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.spotPrice == null || v.futuresPrice == null) return null;

    // Basis = Spot Price - Futures Price
    const basis = v.spotPrice - v.futuresPrice;
    const basisPercentage = (basis / v.spotPrice) * 100;

    return { basis, basisPercentage };
  };

  const determineMarketStructure = (basis: number) => {
    if (basis > 0) return 'Backwardation';
    if (basis < 0) return 'Contango';
    return 'Convergence (Parity)';
  };

  const getSignalStrength = (basisPct: number) => {
    const absPct = Math.abs(basisPct);
    if (absPct > 5) return 'Very Strong';
    if (absPct > 2) return 'Strong';
    if (absPct > 0.5) return 'Moderate';
    return 'Weak';
  };

  const getInterpretation = (structure: string, basis: number) => {
    if (structure === 'Backwardation') {
      return 'Spot price is higher than futures price. This typically indicates a supply shortage or high immediate demand (convenience yield) for the underlying asset.';
    }
    if (structure === 'Contango') {
      return 'Futures price is higher than spot price. This is the "normal" market condition for storable commodities, reflecting the cost of carry (storage, insurance, financing).';
    }
    return 'Spot and futures prices are equal. This usually happens at contract expiration (convergence).';
  };

  const getRecommendation = (structure: string) => {
    if (structure === 'Backwardation') {
      return 'Consider long spot positions or short futures strategies. This structure may favor "roll yield" for long-only commodity indices.';
    }
    return 'Standard carry trade environment. Short hedgers may pay a premium to roll positions. Monitor storage costs and interest rates.';
  };

  const getInsights = (structure: string, basisPct: number) => {
    const insights = [];
    if (structure === 'Backwardation') {
      insights.push('Positive "Roll Yield" potential for long futures positions');
      insights.push('Indicates immediate physical scarcity');
      insights.push('Short hedgers earn the basis as it converges');
    } else {
      insights.push('Cost of carry is dominating price structure');
      insights.push('Negative "Roll Yield" for long passive holders');
      insights.push('Potential arbitrage if basis exceeds theoretical carry cost');
    }

    if (Math.abs(basisPct) > 3) {
      insights.push('Significant dislocation presenting arbitrage opportunities');
    } else {
      insights.push('Market pricing suggests normal supply/demand balance');
    }
    return insights;
  };

  const getRisks = (structure: string) => {
    const risks = [];
    risks.push('Basis risk: The spread may widen before convergence');
    if (structure === 'Backwardation') {
      risks.push('Supply normalization could cause sharp spot price drops');
    } else {
      risks.push('Storage costs may increase, widening the contango');
    }
    risks.push('Unexpected interest rate changes affecting fair value');
    risks.push('Seasonality impacts on physical delivery markets');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    if (calc) {
      const structure = determineMarketStructure(calc.basis);
      setResult({
        basis: calc.basis,
        basisPercentage: calc.basisPercentage,
        marketStructure: structure,
        signalStrength: getSignalStrength(calc.basisPercentage),
        interpretation: getInterpretation(structure, calc.basis),
        recommendation: getRecommendation(structure),
        insights: getInsights(structure, calc.basisPercentage),
        risks: getRisks(structure)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Market Data Inputs
          </CardTitle>
          <CardDescription>
            Enter current market prices to analyze the basis structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="spotPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Spot Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 400.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="futuresPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Futures Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 405.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Basis
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Futures Basis Analysis</CardTitle>
                  <CardDescription>Spread and Market Structure Assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.basis > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                  {result.basis.toFixed(2)}
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold">Market Structure</p>
                  <Badge variant={result.marketStructure === 'Backwardation' ? 'default' : 'secondary'}>
                    {result.marketStructure}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Basis Percentage</p>
                  <p className="text-lg font-bold">
                    {result.basisPercentage.toFixed(2)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <p className="font-semibold">Signal Strength</p>
                  <Badge variant={result.signalStrength === 'Very Strong' ? 'destructive' : result.signalStrength === 'Strong' ? 'default' : 'outline'}>
                    {result.signalStrength}
                  </Badge>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Note:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Basis Insights
                </CardTitle>
                <CardDescription>Trading and hedging implications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Critical monitoring points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Basis = Spot Price - Futures Price
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The basis represents the difference between the cash price of a commodity or financial instrument and its related futures contract price. It is the primary measure of the relationship between the two markets.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other derivatives and pricing tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/futures-margin-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Margin Requirement</p>
                      <p className="text-sm text-muted-foreground">Calculate initial margin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/implied-volatility-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Implied Volatility</p>
                      <p className="text-sm text-muted-foreground">Option pricing inputs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/convexity-adjustment-bond-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Convexity Adjustment</p>
                      <p className="text-sm text-muted-foreground">Bond futures analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other derivatives and pricing tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/futures-margin-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Margin Requirement</p>
                      <p className="text-sm text-muted-foreground">Calculate initial margin</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/implied-volatility-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Implied Volatility</p>
                      <p className="text-sm text-muted-foreground">Option pricing inputs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/convexity-adjustment-bond-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Convexity Adjustment</p>
                      <p className="text-sm text-muted-foreground">Bond futures analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card >

      {/* Complete Guide Section */}
      < section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article" >
        {/* SEO & SCHEMA METADATA */}
        < meta itemProp="headline" content="The Definitive Guide to Futures Basis: Contango, Backwardation, and Hedging" />
        <meta itemProp="description" content="A comprehensive guide to understanding Futures Basis, the critical relationship between spot and futures prices. Learn about Contango vs. Backwardation, convergence, and how to use basis for hedging and arbitrage." />
        <meta itemProp="keywords" content="futures basis, contango vs backwardation, spot vs futures, basis risk, arbitrage, hedging with futures, cost of carry model" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-06-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Definitive Guide to Futures Basis</h1>
        <p className="text-lg italic text-muted-foreground">Mastering the spread between spot and futures prices is essential for effective hedging, arbitrage, and market analysis.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Futures Basis?</a></li>
          <li><a href="#structures" className="hover:underline">Market Structures: Contango vs. Backwardation</a></li>
          <li><a href="#drivers" className="hover:underline">Key Drivers of Basis</a></li>
          <li><a href="#convergence" className="hover:underline">The Principle of Convergence</a></li>
          <li><a href="#hedging" className="hover:underline">Hedging and Basis Risk</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Futures Basis?</h2>
        <p>
          <strong>Futures Basis</strong> (or simply "the basis") is the numerical difference between the current spot price of a specific asset and the price of a futures contract for that same asset. It serves as a barometer for the relationship between the physical market (immediate delivery) and the derivatives market (future delivery).
        </p>
        <p className="mt-4">
          The standard formula used in most commodity markets is:
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">Basis = Spot Price - Futures Price</p>
        </div>
        <p>
          However, in some financial markets (like stock index futures), the convention is sometimes reversed (Futures - Spot). This guide follows the standard commodity definition (Spot - Futures), where a positive basis implies the spot price is higher than the futures price.
        </p>

        <h2 id="structures" className="text-2xl font-bold text-foreground pt-8">Market Structures: Contango vs. Backwardation</h2>
        <p>
          The polarity of the basis defines the market structure, which tells traders a great deal about supply, demand, and storage costs.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Contango (Negative Basis)</h3>
        <p>
          A market is in <strong>Contango</strong> when the Futures Price is higher than the Spot Price (Basis &lt; 0). This is considered the "normal" state for storable non-perishable commodities (like gold, oil, or corn) because of the <strong>Cost of Carry</strong>.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Why it happens:</strong> Sellers demand a higher price in the future to compensate for storage costs, insurance, and the interest on tied-up capital.</li>
          <li><strong>Implication:</strong> There is no immediate shortage of the commodity. Market participants are willing to pay more for delivery later.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Backwardation (Positive Basis)</h3>
        <p>
          A market is in <strong>Backwardation</strong> when the Spot Price is higher than the Futures Price (Basis &gt; 0).
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Why it happens:</strong> Buyers are desperate for immediate delivery and are willing to pay a premium (spot) over the future price. This premium is often called the "convenience yield."</li>
          <li><strong>Implication:</strong> Signals a supply shortage or bottleneck. It incentivizes holders of physical inventory to sell now rather than store it.</li>
        </ul>

        <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8">Key Drivers of Basis</h2>
        <p>The basis is not static; it fluctuates constantly due to several factors:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Cost of Carry</h4>
            <p className="text-sm">Storage, interest rates, and insurance costs push futures prices up relative to spot (strengthening contango).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Convenience Yield</h4>
            <p className="text-sm">The benefit of physically holding the asset to keep production running. High convenience yield pushes spot prices up (strengthening backwardation).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Supply & Demand Shocks</h4>
            <p className="text-sm">Local supply disruptions (e.g., a pipeline break) can spike local spot prices without affecting global futures prices as much.</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Time to Expiry</h4>
            <p className="text-sm">As the contract nears expiration, the uncertainty and carrying costs diminish, forcing the basis to zero.</p>
          </div>
        </div>

        <h2 id="convergence" className="text-2xl font-bold text-foreground pt-8">The Principle of Convergence</h2>
        <p>
          One of the few certainties in futures trading is <strong>Convergence</strong>. As a futures contract approaches its delivery date, the futures price and the spot price must converge.
        </p>
        <p className="mt-2">
          Why? Arbitrage. If the futures price were significantly higher than the spot price on delivery day, a trader could buy the spot asset, sell the futures contract, and immediately deliver the asset for a risk-free profit. This arbitrage pressure forces the prices together.
        </p>

        <h2 id="hedging" className="text-2xl font-bold text-foreground pt-8">Hedging and Basis Risk</h2>
        <p>
          For hedgers (farmers, miners, airlines), <strong>Basis Risk</strong> is the risk that the basis will change unpredictably between the time a hedge is placed and when it is lifted.
        </p>
        <p className="mt-2">
          A perfect hedge assumes the basis remains constant or converges predictably. However, if the basis moves against the hedger ("Widening" or "Narrowing" unexpectedly), the hedge may not fully offset the price risk.
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Short Hedger (Seller):</strong> Benefits if the basis strengthens (Spot rises relative to Futures).</li>
          <li><strong>Long Hedger (Buyer):</strong> Benefits if the basis weakens (Spot falls relative to Futures).</li>
        </ul>
      </section >

      {/* FAQ Section */}
      < Card >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Basis, Contango, and Backwardation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "Strong Basis" vs. "Weak Basis"?</h4>
              <p className="text-muted-foreground">
                A "Strong Basis" means the spot price is high relative to the futures price (more positive or less negative). A "Weak Basis" means the spot price is low relative to the futures price. Producers (sellers) typically prefer a strong basis, while consumers (buyers) prefer a weak basis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can the basis be zero?</h4>
              <p className="text-muted-foreground">
                Yes. The basis typically typically approaches zero as the futures contract reaches its expiration date. This phenomenon is known as convergence. At delivery, the futures instrument effectively becomes the spot instrument.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does interest rate affect basis?</h4>
              <p className="text-muted-foreground">
                For financial futures (like S&P 500 futures), interest rates are the primary component of the "Cost of Carry." Higher interest rates increase the theoretical futures price relative to spot, leading to a more negative basis (Contango) defined as Spot - Futures.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is Contango bullish or bearish?</h4>
              <p className="text-muted-foreground">
                Contango (Futures &gt; Spot) is often a bearish signal for the spot price, as it suggests there is ample supply available now. However, it can also simply reflect high storage costs. For long-term investors using futures (like ETFs), Contango is detrimental because of the negative "roll yield."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is Backwardation bullish or bearish?</h4>
              <p className="text-muted-foreground">
                Backwardation (Spot &gt; Futures) is typically a bullish signal for the physical commodity. It implies a supply deficit or strong immediate demand. Investors rolling long futures positions in a backwardated market earn a positive "roll yield."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Basis Risk"?</h4>
              <p className="text-muted-foreground">
                Basis risk is the danger that the futures price and spot price will not move in perfect correlation. For a hedger, this means their gains on the futures contract might not perfectly offset their losses in the cash market, or vice versa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Basis for Grain?</h4>
              <p className="text-muted-foreground">
                In grain markets (Corn, Soybeans, Wheat), Basis is universally calculated as Local Cash Price minus the Futures Price of the nearby contract. If Local Cash Corn is $4.50 and Futures is $4.80, the Basis is "-30 cents" or "30 under."
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is Arbitrage in relation to Basis?</h4>
              <p className="text-muted-foreground">
                Cash-and-carry arbitrage exploits a basis that is "too negative" (futures overpriced relative to spot + carry costs). A trader buys spot, sells futures, stores the asset, and delivers it at expiry for a risk-free profit.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is the basis different for different locations?</h4>
              <p className="text-muted-foreground">
                This is called "Locational Basis." Transportation costs create price differences between regional spot markets. A glut of oil in Cushing, OK might depress spot prices there (weak basis) while spot prices in Houston remain high (strong basis).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does negative basis always mean Contango?</h4>
              <p className="text-muted-foreground">
                Using the standard formula (Spot - Futures), yes, a negative result means Futures &gt; Spot, which is Contango. If you use the reverse formula (Futures - Spot), a positive result is Contango. Always check the sign convention being used in your specific market.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Applications in trading and hedging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Producers (Short Hedgers)
              </h4>
              <p className="text-sm text-muted-foreground">
                Farmers or Miners use this to decide when to lock in prices. A "Strong" basis is a signal to sell the cash commodity now rather than store it.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Consumers (Long Hedgers)
              </h4>
              <p className="text-sm text-muted-foreground">
                Airlines or Manufacturers look for a "Weak" basis to buy physical inventory cheap relative to futures.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Arbitrageurs
              </h4>
              <p className="text-sm text-muted-foreground">
                Exploit "Cash-and-Carry" opportunities when the basis is sufficiently negative (Contango) to cover storage and interest costs.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Market Analysts
              </h4>
              <p className="text-sm text-muted-foreground">
                Monitor market structure (Contango/Backwardation) to gauge immediate supply tightness vs. long-term expectations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The <strong>Futures Basis Calculator</strong> is a diagnostic tool for the health of a commodity or financial market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col gap-1 p-3 bg-card border rounded-md">
              <span className="font-bold text-foreground">Basis &gt; 0 (Positive)</span>
              <span>Backwardation. Spot is expensive. Supply shortage.</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-card border rounded-md">
              <span className="font-bold text-foreground">Basis &lt; 0 (Negative)</span>
              <span>Contango. Futures are expensive. Cost of carry dominates.</span>
            </div>
            <div className="flex flex-col gap-1 p-3 bg-card border rounded-md">
              <span className="font-bold text-foreground">Convergence</span>
              <span>Basis must equal 0 at expiration.</span>
            </div>
          </div>
        </CardContent>
      </Card>


    </div >
  );
}
