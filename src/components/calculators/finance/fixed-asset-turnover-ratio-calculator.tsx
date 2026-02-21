'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Factory,
  TrendingUp,
  AlertCircle,
  Target,
  Info,
  Calculator,
  DollarSign,
  BarChart3,
  Briefcase,
  Settings,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Landmark,
  Building2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  netSales: z.number().min(0, 'Net Sales must be positive'),
  startFixedAssets: z.number().min(0, 'Must be positive').optional(),
  endFixedAssets: z.number().min(0, 'Must be positive').optional(),
  avgFixedAssets: z.number().min(0, 'Must be positive').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FixedAssetTurnoverRatioCalculator() {
  const [result, setResult] = useState<{
    ratio: number;
    avgAssets: number;
    efficiencyLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netSales: undefined,
      startFixedAssets: undefined,
      endFixedAssets: undefined,
      avgFixedAssets: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const { netSales, startFixedAssets, endFixedAssets, avgFixedAssets } = v;

    let computedAvgAssets = 0;
    if (avgFixedAssets !== undefined && avgFixedAssets > 0) {
      computedAvgAssets = avgFixedAssets;
    } else if (startFixedAssets !== undefined && endFixedAssets !== undefined) {
      computedAvgAssets = (startFixedAssets + endFixedAssets) / 2;
    } else {
      return null;
    }

    if (computedAvgAssets === 0) return null;

    const ratio = netSales / computedAvgAssets;

    // Benchmarks (General Manufacturing/Industrial)
    // Low capital intensity (Software) -> High Ratio
    // High capital intensity (Utility/Railroad) -> Low Ratio
    // We will use a general "Asset Heavy" industry baseline for logic
    let efficiencyLevel = 'Standard';
    let recommendation = '';

    // Logic assuming a standard manufacturing/industrial context
    if (ratio > 5) efficiencyLevel = 'Very High';
    else if (ratio >= 3) efficiencyLevel = 'High';
    else if (ratio >= 1.5) efficiencyLevel = 'Moderate';
    else if (ratio >= 0.5) efficiencyLevel = 'Low';
    else efficiencyLevel = 'Very Low';

    if (ratio > 5) {
      recommendation = 'Extraordinarily high efficiency. Ensure you are not underinvesting in equipment, which could hurt long-term capacity.';
    } else if (ratio >= 3) {
      recommendation = 'Excellent utilization of plant and equipment. Your assets are generating substantial revenue.';
    } else if (ratio >= 1.5) {
      recommendation = 'Average efficiency. Identify bottlenecks in production that might be limiting sales volume.';
    } else {
      recommendation = 'Low asset turnover. You may have overinvested in capacity, or your equipment is sitting idle too often.';
    }

    const interpretation = `For every $1 invested in fixed assets (PP&E), your company generates $${ratio.toFixed(2)} in sales revenue.`;

    const insights = [
      `Revenue Generation: $${ratio.toFixed(2)} per $1 of assets`,
      `Asset Base: $${computedAvgAssets.toLocaleString()} in Net Fixed Assets`,
      `Capacity Usage: ${efficiencyLevel} utilization relative to revenue`
    ];

    const riskFactors = [];
    if (ratio < 1) riskFactors.push('Overcapacity: Equipment is underutilized or obsolete.');
    if (ratio < 1) riskFactors.push('Capital Allocation: Money trapped in non-performing assets.');
    if (ratio > 10) riskFactors.push('Aging Risk: High ratio may indicate old, fully depreciated equipment nearing failure.');
    if (ratio > 10) riskFactors.push('Capacity Constraint: You may be maxing out limits, leading to missed sales.');

    return {
      ratio,
      avgAssets: computedAvgAssets,
      efficiencyLevel,
      interpretation,
      recommendation,
      insights,
      riskFactors
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Asset Data Input
          </CardTitle>
          <CardDescription>
            Enter Net Sales and Fixed Asset values (Property, Plant, & Equipment)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="netSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Net Sales Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Annual Revenue"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="hidden md:block"></div> {/* Spacer */}

                <div className="col-span-1 md:col-span-2 border-t pt-4">
                  <h4 className="text-sm font-medium mb-4 text-muted-foreground">Net Fixed Assets (Net PP&E)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startFixedAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beginning Balance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Start of Year"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endFixedAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ending Balance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="End of Year"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="avgFixedAssets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OR Average Directly</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Manual Average"
                              {...field}
                              onChange={e => field.onChange(Number(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Efficiency
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Asset Efficiency Analysis</CardTitle>
                  <CardDescription>Return on Fixed Investment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Fixed Asset Turnover</p>
                  <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">{result.ratio.toFixed(2)}x</p>
                  <p className="text-xs text-muted-foreground mt-2">Revenue per Dollar of Asset</p>
                </div>
                <div className="text-center p-6 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Efficiency Rating</p>
                  <p className={`text-3xl font-bold ${['Very High', 'High'].includes(result.efficiencyLevel) ? 'text-green-600' : 'text-amber-600'}`}>
                    {result.efficiencyLevel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Relative to Industry Standards</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Context</p>
                  <Badge variant="outline">
                    Capital Intensity
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">{result.ratio < 2 ? 'High (Heavy)' : 'Low (Light)'}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Factory className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Avg Asset Base</p>
                  <p className="text-lg font-bold">${result.avgAssets.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Contribution</p>
                  <p className="text-sm font-medium text-muted-foreground">Assets drive sales</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-lg font-medium text-foreground">{result.interpretation}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Management Tip:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Key Insights
                </CardTitle>
                <CardDescription>Performance drivers</CardDescription>
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
                <CardDescription>Operational red flags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length > 0 ? (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-300">No immediate efficiency risks detected.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Components of the Fixed Asset Turnover Ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Net Sales
              </h4>
              <p className="text-sm text-muted-foreground">
                Total Gross Sales minus returns, allowances, and discounts. This represents the actual revenue generated by the company's core operations.
              </p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Factory className="h-4 w-4" />
                Net Fixed Assets (PP&E)
              </h4>
              <p className="text-sm text-muted-foreground">
                Property, Plant, and Equipment **after** accumulated depreciation.
                <br />
                <em>Formula: Gross PP&E - Accumulated Depreciation</em>. Do not use Gross assets, as that ignores the age and wear of the machinery.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Fixed Asset Turnover = Net Sales / Average Net Fixed Assets
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Average Net Fixed Assets = (Beginning Net Balance + Ending Net Balance) / 2
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This ratio measures operating leverage—how efficiently a company uses its heavy machinery, real estate, and technology to drive sales.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other efficiency and return ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/return-on-assets-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Return on Assets</p>
                      <p className="text-sm text-muted-foreground">Profitability vs Assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/inventory-turnover-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Inventory Turnover</p>
                      <p className="text-sm text-muted-foreground">Stock efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/receivables-turnover-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Receivables Turnover</p>
                      <p className="text-sm text-muted-foreground">Collection efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Profit efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/dscr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">DSCR</p>
                      <p className="text-sm text-muted-foreground">Debt capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Investment planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Fixed Asset Turnover Ratio: Complete Analysis Guide" />
        <meta itemProp="description" content="Learn how to calculate and interpret the Fixed Asset Turnover Ratio. Understand capital intensity, efficiency benchmarks, and how to optimize asset utilization." />
        <meta itemProp="author" content="Industrial Finance Association" />
        <meta itemProp="datePublished" content="2025-08-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Fixed Asset Turnover Ratio: A Guide to Asset Efficiency</h1>
        <p className="text-lg italic text-muted-foreground">Machines earn money. Empty factories cost money. The Fixed Asset Turnover Ratio tells you if your heavy investments are paying for themselves or acting as a drag on your balance sheet.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Fixed Asset Turnover (FAT)?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula & Calculation</a></li>
          <li><a href="#benchmarks" className="hover:underline">Capital Intensity vs. Light Asset Models</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting High vs. Low Ratios</a></li>
          <li><a href="#depreciation" className="hover:underline">The "Depreciation Distortion" Trap</a></li>
          <li><a href="#optimization" className="hover:underline">How to Optimize FAT</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Fixed Asset Turnover (FAT)?</h2>
        <p>The **Fixed Asset Turnover (FAT)** ratio measures how efficiently a company generates net sales from its fixed-asset investments. Fixed assets generally include Property, Plant, and Equipment (PP&E) like factory machinery, fleet vehicles, warehouses, and IT infrastructure.</p>
        <p>This metric is critical for industrial sectors (Manufacturing, Utility, Telecom) where entry costs are high. It answers the question: <em>"For every dollar I spent on this machine, how many dollars of sales did it produce?"</em></p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Formula & Calculation</h2>
        <p>The standard formula uses **Net** fixed assets, meaning historical cost minus accumulated depreciation.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            FAT = Net Sales / Average Net Fixed Assets
          </p>
        </div>
        <p><strong>Note on Averages:</strong> Since sales happen over a year but assets are measuring at a specific day, we average the opening and closing balance of assets to align the timeframes.</p>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Capital Intensity vs. Light Asset Models</h2>
        <p>You cannot compare an Airline to a Marketing Agency using this ratio. The structural differences are too vast.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-900/10">
            <h4 className="font-bold text-orange-800 dark:text-orange-300">Capital Intensive (Heavy)</h4>
            <p className="text-sm font-semibold mt-1">Expected FAT: 0.5x - 2.0x</p>
            <p className="text-sm mt-1 text-muted-foreground">Industries: Utilities, Oil Refineries, Railroads.</p>
            <p className="text-sm mt-2 text-muted-foreground">They require billions in infrastructure. A turnover of 1.0 is often acceptable because the assets last 30+ years.</p>
          </div>
          <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
            <h4 className="font-bold text-blue-800 dark:text-blue-300">Asset Light (Services)</h4>
            <p className="text-sm font-semibold mt-1">Expected FAT: 5.0x - 20.0x</p>
            <p className="text-sm mt-1 text-muted-foreground">Industries: Software, Consulting, Law Firms.</p>
            <p className="text-sm mt-2 text-muted-foreground">Their "machinery" is people (who don't go on the balance sheet as assets). Their fixed asset base is just laptops and office chairs.</p>
          </div>
        </div>

        <hr className="my-6" />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8">Interpreting High vs. Low Ratios</h2>

        <h3 className="text-xl font-semibold text-foreground mt-4">Low Ratio Warning Signs</h3>
        <p>A ratio significantly lower than peers typically indicates:</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Overinvestment:</strong> You bought a Ferrari to deliver pizza. The equipment is too powerful/expensive for the job.</li>
          <li><strong>Low Sales Volume:</strong> The factory is capable, but the sales team isn't bringing in orders (Low Capacity Utilization).</li>
          <li><strong>Obsolescence:</strong> The machinery is old and breaking down, halting production lines.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-4">High Ratio: Good or Bad?</h3>
        <p>A high ratio is usually good (high efficiency), but an <em>abnormally</em> high ratio can signal danger:</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>Underinvestment:</strong> You haven't upgraded technology in decades. You are squeezing success out of crumbling tools.</li>
          <li><strong>Leasing vs. Buying:</strong> If you lease everything, your asset base is $0, pushing the ratio towards infinity. This distorts comparison with competitors who buy their assets.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="depreciation" className="text-2xl font-bold text-foreground pt-8">The "Depreciation Distortion" Trap</h2>
        <p>This is the most common error in FAT analysis. As assets age, their <strong>Net Book Value</strong> drops due to depreciation.</p>
        <p><em>Example:</em> A company buys a machine for $1M. Sales are $500k. Ratio = 0.5. <br />
          Five years later, the machine's book value is $100k (depreciated), but it still produces $500k sales. Ratio = 5.0.</p>
        <p><strong>The Trap:</strong> It looks like efficiency improved 10x, but actually, the machine is just old. Analysts should check the "Gross Fixed Asset Turnover" to verify real efficiency gains.</p>

        <hr className="my-6" />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8">How to Optimize FAT</h2>
        <ol className="list-decimal ml-6 space-y-4 mt-4">
          <li><strong>Increase Capacity Utilization:</strong> Run 24/7 shifts instead of 9-to-5. Using the same machine more hours per day increases sales without increasing assets.</li>
          <li><strong>Outsource Production:</strong> Sell your factory and pay a contract manufacturer. Your assets drop, your ratio skyrockets. (Common strategy for Apple/Nike).</li>
          <li><strong>Dispose of Dead Assets:</strong> Sell off old machinery or unused land that sits on the balance sheet contributing zero revenue.</li>
        </ol>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about asset efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does this ratio apply to tech companies?</h4>
              <p className="text-muted-foreground">
                It's less relevant. Tech companies operate on intellectual property and human capital. Their fixed assets (servers, laptops) are minor compared to their value. For tech, look at "Revenue per Employee" instead.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why deduct Accumulated Depreciation?</h4>
              <p className="text-muted-foreground">
                We use Net Fixed Assets to reflect the current value of capital tied up. However, be aware of the "Depreciation Distortion" mentioned in the guide—old assets make the ratio look artificially better.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Should I include Intangible Assets?</h4>
              <p className="text-muted-foreground">
                No. Fixed Asset Turnover focuses on <em>tangible</em> PP&E. If you include intangibles (Patents, Goodwill), it becomes the "Total Asset Turnover" ratio, which is a broader measure.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if the ratio is declining year over year?</h4>
              <p className="text-muted-foreground">
                A declining trend usually means you are investing in new equipment faster than your sales are growing. This is common during expansion phases but dangerous if it persists for years without sales catching up.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does leasing affect this ratio?</h4>
              <p className="text-muted-foreground">
                Leasing (Operating Leases) traditionally kept assets off the balance sheet, inflating the ratio. However, new accounting rules (IFRS 16 / ASC 842) now require most leases to be capitalized as "Right-of-Use Assets," normalizing this discrepancy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a ratio of 1.0 bad?</h4>
              <p className="text-muted-foreground">
                Not for a heavy industry like Utility or Telecommunications. For a retailer, yes, 1.0 would be terrible. Always benchmark against direct competitors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I calculate this monthly?</h4>
              <p className="text-muted-foreground">
                You can, but annualizing the data is necessary. Sales fluctuate monthly, but fixed assets (factories) stay constant. A monthly ratio can be extremely volatile and misleading due to seasonality. Keep it annual or trailing-twelve-months (TTM).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who strictly needs this tool and when
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Operations Managers</strong>
                <span className="text-sm text-muted-foreground">To justify buying new equipment. If current FAT is low, you can't justify a new machine—you need to utilize the old one better.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Equity Analysts</strong>
                <span className="text-sm text-muted-foreground">To value manufacturing stocks. Companies with higher FAT typically have better Return on Equity (ROE).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Bankers / Lenders</strong>
                <span className="text-sm text-muted-foreground">Banks lend against assets. If FAT is low, the collateral (assets) is not generating cash to repay the loan risk.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs</strong>
                <span className="text-sm text-muted-foreground">To decide "Make vs Buy." If internal FAT is low, it's financially sharper to outsource production.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Inflation:</strong> Sales are in "today's dollars" (inflated). Assets are in "yesterday's dollars" (historical cost). In high inflation, the ratio rises artificially even if efficiency is flat.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Lumpy CapEx:</strong> Adding a new mega-factory drops the ratio instantly. It takes years for sales to ramp up. The calculator gives a snapshot, not the future curve.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Toyota (Lean Manufacturing)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Renowned for high turnover compared to US peers (historically). By minimizing waste and inventory (which clogs factory flow), they pump more cars out of the same size factory.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">WeWork (The Asset Illusion)</h5>
                <p className="text-sm text-red-700/80 dark:text-red-400">
                  Attempted to be a "tech company" (asset light) but was actually a "real estate company" (asset heavy). The mismatch between their low asset turnover and high tech-like valuation led to collapse.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Fixed Asset Turnover Calculator evaluates how effectively a company utilizes its heavy investments to generate revenue.</p>
          <p>It is a fundamental efficiency metric for manufacturing, transportation, and industrial sectors.</p>
          <p>Use it to balance capacity planning, prevent overinvestment, and track operational performance against competitors.</p>
        </CardContent>
      </Card>
    </div>
  );
}
