
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, FunctionSquare, CheckCircle2, Activity, Percent, Layers, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  contractSize: z.number().positive(),
  futuresPrice: z.number().positive(),
  initialMarginPct: z.number().min(1).max(100),
  maintenanceMarginPct: z.number().min(1).max(100),
  contracts: z.number().positive().int(),
  accountEquity: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FuturesMarginRequirementCalculator() {
  const [result, setResult] = useState<{
    notionalValue: number;
    initialMargin: number;
    maintenanceMargin: number;
    marginBuffer: number;
    leverageRatio: number;
    marginCallLevel: number;
    priceDropToMaintenanceCall: number;
    marginLevel: string;
    leverageAssessment: string;
    recommendation: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractSize: undefined,
      futuresPrice: undefined,
      initialMarginPct: undefined,
      maintenanceMarginPct: undefined,
      contracts: 1,
      accountEquity: undefined,
    },
  });

  const getMarginLevel = (marginBuffer: number, initialMargin: number) => {
    const bufferPct = (marginBuffer / initialMargin) * 100;
    if (bufferPct >= 100) return 'Very Safe';
    if (bufferPct >= 50) return 'Safe';
    if (bufferPct >= 25) return 'Adequate';
    if (bufferPct >= 10) return 'Thin';
    return 'Critical';
  };

  const getLeverageAssessment = (leverage: number) => {
    if (leverage >= 20) return 'Extremely High Leverage';
    if (leverage >= 15) return 'Very High Leverage';
    if (leverage >= 10) return 'High Leverage';
    if (leverage >= 5) return 'Moderate Leverage';
    return 'Low Leverage';
  };

  const getRecommendation = (marginLevel: string, leverage: number, bufferPct: number) => {
    if (marginLevel === 'Critical') {
      return 'Margin level critical—risk of immediate margin call. Reduce position size or add capital immediately.';
    }
    if (marginLevel === 'Thin') {
      return 'Thin margin buffer provides limited cushion. Consider reducing exposure or adding capital buffer.';
    }
    if (leverage >= 20) {
      return 'Extremely high leverage amplifies both gains and losses. Small adverse moves can trigger margin calls. Trade cautiously.';
    }
    if (leverage >= 10) {
      return 'High leverage position. Maintain stop losses and monitor positions closely during volatile periods.';
    }
    if (marginLevel === 'Very Safe') {
      return 'Strong margin position. You have significant buffer to withstand adverse price movements without margin calls.';
    }
    return 'Adequate margin level. Monitor positions during high volatility periods and maintain awareness of margin requirements.';
  };

  const getInsights = (notional: number, initialMargin: number, leverage: number, contracts: number, priceDropToCall: number, maintenanceMargin: number) => {
    const insights = [];

    insights.push(`Controlling $${notional.toLocaleString()} notional value with only $${initialMargin.toLocaleString()} initial margin (${leverage.toFixed(1)}x leverage)`);
    insights.push(`A ${priceDropToCall.toFixed(2)}% adverse price move would trigger a margin call requiring additional capital`);
    insights.push(`Each contract requires $${(initialMargin / contracts).toFixed(2)} initial margin and $${(maintenanceMargin / contracts).toFixed(2)} maintenance`);

    return insights;
  };

  const getConsiderations = (leverage: number) => {
    const considerations = [];

    considerations.push('Margin requirements can change without notice—exchanges increase margins during volatile periods');
    considerations.push('Leverage cuts both ways: amplifies gains AND losses proportionally');
    considerations.push('Margin calls require immediate action; failure to meet calls results in forced liquidation');
    considerations.push('Daily mark-to-market means losses must be funded each day (variation margin)');
    considerations.push('SPAN margining may reduce requirements for hedged or spread positions');

    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const contractSize = values.contractSize!;
    const futuresPrice = values.futuresPrice!;
    const initialMarginPct = values.initialMarginPct!;
    const maintenanceMarginPct = values.maintenanceMarginPct!;
    const contracts = values.contracts!;
    const accountEquity = values.accountEquity || 0;

    // Calculate notional value
    const notionalValue = contractSize * futuresPrice * contracts;

    // Calculate margin requirements
    const initialMargin = notionalValue * (initialMarginPct / 100);
    const maintenanceMargin = notionalValue * (maintenanceMarginPct / 100);

    // Calculate margin buffer (how much above maintenance)
    const marginBuffer = accountEquity > 0 ? accountEquity - maintenanceMargin : initialMargin - maintenanceMargin;

    // Calculate leverage ratio
    const leverageRatio = notionalValue / initialMargin;

    // Price drop to trigger margin call
    // Equity below maintenance = margin call
    // If account equity is provided, calculate from there
    const effectiveEquity = accountEquity > 0 ? accountEquity : initialMargin;
    const bufferAboveMaintenance = effectiveEquity - maintenanceMargin;
    const priceDropToMaintenanceCall = (bufferAboveMaintenance / notionalValue) * 100;

    const marginLevel = getMarginLevel(marginBuffer, initialMargin);
    const bufferPct = (marginBuffer / initialMargin) * 100;

    setResult({
      notionalValue,
      initialMargin,
      maintenanceMargin,
      marginBuffer,
      leverageRatio,
      marginCallLevel: maintenanceMargin,
      priceDropToMaintenanceCall,
      marginLevel,
      leverageAssessment: getLeverageAssessment(leverageRatio),
      recommendation: getRecommendation(marginLevel, leverageRatio, bufferPct),
      insights: getInsights(notionalValue, initialMargin, leverageRatio, contracts, priceDropToMaintenanceCall, maintenanceMargin),
      considerations: getConsiderations(leverageRatio)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Futures Position Parameters
          </CardTitle>
          <CardDescription>
            Calculate initial and maintenance margin requirements for futures positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="contractSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Contract Size (multiplier)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 50 (ES futures)"
                          {...field}
                          value={field.value ?? ''}
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
                        <DollarSign className="h-4 w-4" />
                        Futures Price ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 5000"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contracts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Number of Contracts
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 2"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initialMarginPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Initial Margin (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 5"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maintenanceMarginPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Maintenance Margin (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 4"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Account Equity (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          placeholder="e.g., 50000"
                          {...field}
                          value={field.value ?? ''}
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
                Calculate Margin Requirements
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
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Futures Margin Analysis</CardTitle>
                  <CardDescription>Position Margin Requirements and Leverage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground font-medium">Notional Value</p>
                  <p className="text-xl font-bold text-primary">${result.notionalValue.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Initial Margin</p>
                  <p className="text-xl font-bold text-blue-600">${result.initialMargin.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Maintenance Margin</p>
                  <p className="text-xl font-bold text-orange-600">${result.maintenanceMargin.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg">
                  <p className="text-sm text-muted-foreground font-medium">Leverage</p>
                  <p className="text-xl font-bold text-purple-600">{result.leverageRatio.toFixed(1)}x</p>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Margin Level</p>
                  <Badge variant={result.marginLevel === 'Very Safe' || result.marginLevel === 'Safe' ? 'default' : result.marginLevel === 'Adequate' ? 'outline' : 'destructive'}>
                    {result.marginLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Leverage Assessment</p>
                  <Badge variant={result.leverageAssessment.includes('Extremely') || result.leverageAssessment.includes('Very High') ? 'destructive' : result.leverageAssessment.includes('High') ? 'outline' : 'secondary'}>
                    {result.leverageAssessment}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Drop to Margin Call</p>
                  <p className="text-lg font-bold">{result.priceDropToMaintenanceCall.toFixed(2)}%</p>
                </div>
              </div>

              {/* Margin Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Margin Buffer</p>
                  <p className="text-2xl font-bold text-green-600">${result.marginBuffer.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Above maintenance requirement</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="font-semibold mb-2">Margin Call Level</p>
                  <p className="text-2xl font-bold text-red-600">${result.marginCallLevel.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Account equity triggering call</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
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
                  Strategic Insights
                </CardTitle>
                <CardDescription>Position analysis and leverage impact</CardDescription>
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
                  Risk Assessment
                </CardTitle>
                <CardDescription>Margin and leverage risks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
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
            Formulas Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Notional Value = Contract Size × Futures Price × # Contracts
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Initial Margin = Notional Value × Initial Margin %
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Leverage = Notional Value / Initial Margin
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Futures margin enables leverage by requiring only a percentage of notional value. Maintenance margin is the minimum equity to avoid margin calls.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Futures & Derivatives Calculators
          </CardTitle>
          <CardDescription>
            Explore other futures and risk management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/futures-basis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Futures Basis</p>
                      <p className="text-sm text-muted-foreground">Spot vs futures pricing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/convexity-adjustment-bond-futures-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Convexity Adjustment</p>
                      <p className="text-sm text-muted-foreground">Futures vs forwards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/value-at-risk-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Value at Risk (VaR)</p>
                      <p className="text-sm text-muted-foreground">Position risk measurement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/dollar-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Dollar Duration</p>
                      <p className="text-sm text-muted-foreground">Interest rate sensitivity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/pvbp-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">PVBP (DV01)</p>
                      <p className="text-sm text-muted-foreground">Basis point sensitivity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/position-sizing-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Position Sizing</p>
                      <p className="text-sm text-muted-foreground">Risk-based sizing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="name" content="The Definitive Guide to Futures Margin Requirements: Initial, Maintenance, and SPAN Explained" />
        <meta itemProp="description" content="An expert guide explaining futures margin requirements, including initial and maintenance margin, leverage calculations, margin calls, SPAN margining, and risk management best practices." />
        <meta itemProp="keywords" content="futures margin, initial margin requirement, maintenance margin, margin call, futures leverage, SPAN margin, variation margin, commodity margin" />
        <meta itemProp="author" content="MegaCalc Financial Analysis Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/definitive-futures-margin-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Futures Margin Requirements: Understanding Leverage and Risk</h1>
        <p className="text-lg italic text-muted-foreground">Master the mechanics of futures margin—the collateral system that enables leveraged trading in futures markets.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#margin-basics" className="hover:underline">Futures Margin Basics</a></li>
          <li><a href="#initial-vs-maintenance" className="hover:underline">Initial vs Maintenance Margin</a></li>
          <li><a href="#margin-calls" className="hover:underline">Margin Calls and Variation Margin</a></li>
          <li><a href="#span-margin" className="hover:underline">SPAN Margining for Portfolios</a></li>
          <li><a href="#leverage-risk" className="hover:underline">Leverage and Risk Management</a></li>
        </ul>
        <hr />

        {/* FUTURES MARGIN BASICS */}
        <h2 id="margin-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Futures Margin Basics</h2>
        <p>**Futures margin** is not a loan or down payment—it's a **performance bond** (also called good faith deposit) that ensures both parties can fulfill their contract obligations. Unlike stock margin, you're not borrowing money to buy the underlying asset.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Margin Works</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Exchange-Set Minimums**: Exchanges (CME, ICE) set minimum margin requirements based on contract volatility.</li>
          <li>**Broker Additions**: Brokers often require higher margins than exchange minimums for retail traders.</li>
          <li>**Segregated Accounts**: Customer margin is held separately from broker funds for protection.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understand Leverage</h3>
        <p>Futures margin enables significant leverage. With 5% margin, you control a position worth 20 times your capital. This amplifies both profits AND losses proportionally.</p>

        <hr />

        {/* INITIAL VS MAINTENANCE MARGIN */}
        <h2 id="initial-vs-maintenance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Initial vs Maintenance Margin</h2>
        <p>There are two critical margin levels every futures trader must understand.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Initial Margin</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Definition**: The amount required to **open** a new futures position.</li>
          <li>**Typical Range**: 3-15% of notional value depending on contract volatility.</li>
          <li>**Purpose**: Ensures sufficient capital to cover expected price moves during the settlement period.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Maintenance Margin</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Definition**: The minimum equity required to **maintain** an open position.</li>
          <li>**Typical Range**: Usually 75-90% of initial margin.</li>
          <li>**Margin Call Trigger**: If account equity falls below maintenance margin, you receive a margin call.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example</h3>
        <p>If initial margin is $12,500 and maintenance is $10,000: you can open a position with $12,500, but if your account drops below $10,000, you must add funds or face liquidation.</p>

        <hr />

        {/* MARGIN CALLS AND VARIATION MARGIN */}
        <h2 id="margin-calls" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Margin Calls and Variation Margin</h2>
        <p>Futures accounts are **marked-to-market daily**, meaning gains and losses are settled each day.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Daily Settlement</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Variation Margin**: Daily transfer of funds between counterparties based on price changes.</li>
          <li>**Credit on Gains**: If the market moves in your favor, funds are credited to your account.</li>
          <li>**Debit on Losses**: If the market moves against you, funds are debited from your account.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Margin Call Process</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Trigger**: Account equity falls below maintenance margin.</li>
          <li>**Action Required**: Deposit additional funds to bring equity back to initial margin level.</li>
          <li>**Time Limit**: Usually same day or next morning—brokers may liquidate without waiting.</li>
          <li>**Forced Liquidation**: If you don't meet the margin call, positions are closed at market price.</li>
        </ul>

        <hr />

        {/* SPAN MARGINING */}
        <h2 id="span-margin" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SPAN Margining for Portfolios</h2>
        <p>**SPAN (Standard Portfolio Analysis of Risk)** is a sophisticated margining methodology used by major exchanges.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How SPAN Works</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Scenario Analysis**: SPAN analyzes 16 different "what-if" scenarios of price and volatility changes.</li>
          <li>**Portfolio-Based**: Recognizes that offsetting positions reduce overall risk.</li>
          <li>**Spread Credits**: Hedged positions (calendar spreads, intercommodity spreads) receive reduced margins.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of SPAN Margining</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Lower Margins**: Hedged portfolios require less capital than summing individual contract margins.</li>
          <li>**More Efficient Capital**: Professional traders can deploy capital more efficiently.</li>
          <li>**Risk-Based**: Better reflects actual portfolio risk rather than arbitrary percentages.</li>
        </ul>

        <hr />

        {/* LEVERAGE AND RISK MANAGEMENT */}
        <h2 id="leverage-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Leverage and Risk Management</h2>
        <p>Leverage is futures trading's greatest opportunity AND greatest risk.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding Leverage</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**10x Leverage**: With 10% margin, you control $100,000 notional with $10,000. A 1% price move = 10% P&L.</li>
          <li>**20x Leverage**: With 5% margin, a 1% price move = 20% P&L.</li>
          <li>**Amplified Losses**: Same leverage that creates 50% gains creates 50% losses—potentially exceeding your deposit.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management Best Practices</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li>**Don't Use Maximum Leverage**: Just because you CAN trade 20 contracts doesn't mean you SHOULD.</li>
          <li>**Maintain Buffer**: Keep account equity well above maintenance margin (50%+ buffer recommended).</li>
          <li>**Use Stop Losses**: Pre-defined exit points prevent catastrophic losses.</li>
          <li>**Size by Risk**: Position size based on max acceptable loss, not available margin.</li>
          <li>**Monitor Margin Changes**: Exchanges increase margins during volatility—plan for this.</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>**Futures margin** is the performance bond system that enables leveraged trading while ensuring market integrity. Understanding the difference between initial and maintenance margin, the mechanics of margin calls, and the impact of leverage is essential for futures traders.</p>
        <p>Proper risk management—maintaining adequate margin buffers, using appropriate position sizes, and employing stop losses—separates successful futures traders from those who blow up their accounts. Respect the leverage that margin provides.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about futures margin requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is futures margin?</h4>
              <p className="text-muted-foreground">
                Futures margin is a performance bond or good faith deposit required to open and maintain futures positions. Unlike stock margin (which is a loan), futures margin is collateral that ensures you can fulfill contract obligations. It's typically 5-15% of the contract's notional value.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between initial and maintenance margin?</h4>
              <p className="text-muted-foreground">
                Initial margin is required to open a new position. Maintenance margin is the minimum equity to keep the position open. If account equity falls below maintenance margin, you receive a margin call requiring you to deposit funds back to the initial margin level.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does a margin call work?</h4>
              <p className="text-muted-foreground">
                When account equity falls below maintenance margin, the broker issues a margin call. You must deposit additional funds (usually to bring equity back to initial margin) typically by the next trading day. If you don't meet the call, the broker will liquidate your positions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is variation margin?</h4>
              <p className="text-muted-foreground">
                Variation margin is the daily mark-to-market settlement in futures. Each day, gains or losses are credited/debited to your account based on price changes. This ensures losses are funded daily rather than accumulating until contract expiration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do margin requirements change?</h4>
              <p className="text-muted-foreground">
                Yes, exchanges routinely adjust margins based on market volatility. During volatile periods, margins may increase significantly—sometimes overnight. Traders must be prepared for margin increases and maintain buffer capital.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is SPAN margin?</h4>
              <p className="text-muted-foreground">
                SPAN (Standard Portfolio Analysis of Risk) is a portfolio-based margining system that analyzes multiple price/volatility scenarios. It recognizes risk offsets between positions, often resulting in lower margin requirements for hedged portfolios compared to summing individual margins.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How much leverage is typical in futures?</h4>
              <p className="text-muted-foreground">
                Futures leverage varies by contract but commonly ranges from 10x to 20x. ES futures (S&P 500 e-mini) might require ~$15,000 margin to control ~$250,000 notional (~17x leverage). Commodity futures often have even higher leverage potential.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I use securities as margin collateral?</h4>
              <p className="text-muted-foreground">
                Many brokers accept Treasury securities as margin collateral, often with a small haircut (e.g., 95% of value counts as margin). Some accept stocks with larger haircuts. This allows earning interest on collateral while maintaining margin requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How should I size futures positions?</h4>
              <p className="text-muted-foreground">
                Size based on risk, not available margin. Calculate the dollar move that would trigger your stop loss and size so that loss is acceptable (e.g., 1-2% of account). Never trade maximum contracts just because margin allows—leverage cuts both ways.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if I can't meet a margin call?</h4>
              <p className="text-muted-foreground">
                If you don't meet a margin call, the broker will liquidate your positions at prevailing market prices. This may result in losses exceeding your account balance in extreme cases, leaving you owing money to the broker. Never ignore margin calls.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Futures Margin Calculator computes initial and maintenance margin requirements, leverage ratios, and margin call thresholds.</p>
          <p>Proper margin management is essential—maintain buffers above maintenance to avoid forced liquidations during volatile periods.</p>
          <p>Always size positions based on risk tolerance, not maximum margin availability.</p>
        </CardContent>
      </Card>
    </div>
  );
}
