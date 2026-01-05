'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingUp, TrendingDown, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  segment1Name: z.string().min(1, 'Name is required'),
  segment1Investment: z.number().positive('Investment must be positive'),
  segment1Return: z.number().nonnegative('Return cannot be negative'),

  segment2Name: z.string().optional(),
  segment2Investment: z.number().optional(),
  segment2Return: z.number().optional(),

  segment3Name: z.string().optional(),
  segment3Investment: z.number().optional(),
  segment3Return: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ROIByBusinessSegmentCalculator() {
  const [result, setResult] = useState<{
    segments: { name: string; roi: number; profit: number; contribution: number; status: string }[];
    totalInvestment: number;
    totalProfit: number;
    overallROI: number;
    bestPerformer: string;
    worstPerformer: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      segment1Name: 'Core Business',
      segment1Investment: undefined,
      segment1Return: undefined,
      segment2Name: 'New Ventures',
      segment2Investment: undefined,
      segment2Return: undefined,
      segment3Name: 'Online Sales',
      segment3Investment: undefined,
      segment3Return: undefined,
    },
  });

  const getStatus = (roi: number) => {
    if (roi >= 50) return 'Star';
    if (roi >= 20) return 'Healthy';
    if (roi > 0) return 'Stable';
    return 'Underperforming';
  };

  const calculate = (v: FormValues) => {
    const segments = [];

    // Process Segment 1
    if (v.segment1Investment) {
      const invest = v.segment1Investment;
      const ret = v.segment1Return || 0;
      const profit = ret - invest;
      const roi = (profit / invest) * 100;
      segments.push({ name: v.segment1Name || "Segment 1", invest, ret, profit, roi });
    }

    // Process Segment 2
    if (v.segment2Investment) {
      const invest = v.segment2Investment;
      const ret = v.segment2Return || 0;
      const profit = ret - invest;
      const roi = (profit / invest) * 100;
      segments.push({ name: v.segment2Name || "Segment 2", invest, ret, profit, roi });
    }

    // Process Segment 3
    if (v.segment3Investment) {
      const invest = v.segment3Investment;
      const ret = v.segment3Return || 0;
      const profit = ret - invest;
      const roi = (profit / invest) * 100;
      segments.push({ name: v.segment3Name || "Segment 3", invest, ret, profit, roi });
    }

    if (segments.length === 0) return;

    const totalInvestment = segments.reduce((sum, s) => sum + s.invest, 0);
    const totalReturn = segments.reduce((sum, s) => sum + s.ret, 0);
    const totalProfit = totalReturn - totalInvestment;
    const overallROI = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    // Calculate contribution and finalize segment data
    const finalSegments = segments.map(s => ({
      name: s.name,
      roi: s.roi,
      profit: s.profit,
      contribution: totalProfit > 0 ? (s.profit / totalProfit) * 100 : 0,
      status: getStatus(s.roi)
    }));

    // Find best/worst
    const sortedByRoi = [...finalSegments].sort((a, b) => b.roi - a.roi);
    const bestPerformer = sortedByRoi[0];
    const worstPerformer = sortedByRoi[sortedByRoi.length - 1];

    // Generate Insights
    const insights = [];
    if (bestPerformer.roi > overallROI * 1.5) {
      insights.push(`${bestPerformer.name} is significantly outperforming the portfolio average. Consider reallocating capital here.`);
    }
    if (finalSegments.some(s => s.roi < 0)) {
      insights.push('One or more segments are destroying value (negative ROI).');
    }
    if (overallROI > 20) {
      insights.push('Overall portfolio health is strong with >20% aggregate ROI.');
    }

    // Generate Risks
    const riskFactors = [];
    const negativeSegments = finalSegments.filter(s => s.roi < 0);
    if (negativeSegments.length > 0) {
      riskFactors.push(`${negativeSegments.length} segment(s) are operating at a loss.`);
    }
    if (finalSegments.length > 1 && bestPerformer.contribution > 80) {
      riskFactors.push(`High dependency on ${bestPerformer.name}, which generates >80% of total profits.`);
    }

    let recommendation = "";
    if (overallROI < 0) recommendation = "Portfolio is losing money. Urgent restructuring of underperforming segments required.";
    else if (overallROI < 10) recommendation = "Modest returns. Analyze cost structures of lower-performing segments.";
    else recommendation = "Strong portfolio performance. Focus on scaling your high-ROI segments.";

    setResult({
      segments: finalSegments,
      totalInvestment,
      totalProfit,
      overallROI,
      bestPerformer: bestPerformer.name,
      worstPerformer: worstPerformer.name,
      recommendation,
      insights,
      riskFactors
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Segment Data
          </CardTitle>
          <CardDescription>
            Enter investment and return figures for up to 3 business units.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-8">

              {/* Segment 1 */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                  <Briefcase className="h-4 w-4" /> Segment 1 (Primary)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="segment1Name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Retail Store" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment1Investment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invested Capital ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="100000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment1Return" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Return/Revenue ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="150000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Segment 2 */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                  <Briefcase className="h-4 w-4" /> Segment 2 (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="segment2Name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Online Store" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment2Investment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invested Capital ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment2Return" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Return/Revenue ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Separator />

              {/* Segment 3 */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-sm uppercase text-muted-foreground tracking-wider">
                  <Briefcase className="h-4 w-4" /> Segment 3 (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="segment3Name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input placeholder="e.g. Consulting" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment3Investment" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invested Capital ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="segment3Return" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Return/Revenue ($)</FormLabel>
                      <FormControl><Input type="number" step="0.01" placeholder="Optional" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Compare Segments
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PieChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Portfolio Performance</CardTitle>
                  <CardDescription>Aggregate analysis of all business segments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Invested</p>
                  <p className="text-3xl font-bold text-foreground my-1">${result.totalInvestment.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Overall ROI</p>
                  <p className={`text-4xl font-bold my-1 ${result.overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.overallROI.toFixed(2)}%</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Profit</p>
                  <p className={`text-3xl font-bold my-1 ${result.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${result.totalProfit.toLocaleString()}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Segment Breakdown</h4>
                <div className="grid grid-cols-1 gap-4">
                  {result.segments.map((segment, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/20 border rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3 w-full md:w-1/3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${segment.roi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {segment.roi >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-bold">{segment.name}</p>
                          <Badge variant="outline" className="mt-1">{segment.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-2/3 mt-4 md:mt-0">
                        <div className="text-center md:text-left">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className={`font-bold ${segment.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{segment.roi.toFixed(1)}%</p>
                        </div>
                        <div className="text-center md:text-left">
                          <p className="text-xs text-muted-foreground">Profit</p>
                          <p className="font-medium">${segment.profit.toLocaleString()}</p>
                        </div>
                        <div className="text-center md:text-left hidden md:block">
                          <p className="text-xs text-muted-foreground">Contribution</p>
                          <p className="font-medium">{segment.contribution.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert variant={result.overallROI >= 0 ? "default" : "destructive"}>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Performance drivers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <ArrowUpRight className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-green-700">Best Performer: {result.bestPerformer}</span>
                    <p className="text-xs text-muted-foreground">Leading the portfolio in ROI efficiency.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <ArrowDownRight className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-red-700">Lowest Performer: {result.worstPerformer}</span>
                    <p className="text-xs text-muted-foreground">Dragging down the weighted average.</p>
                  </div>
                </div>
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
                <CardDescription>Portfolio vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-green-600">
                    <CheckCircle2 className="h-6 w-6 mr-2" />
                    <span>No major risks detected based on current data.</span>
                  </div>
                ) : (
                  result.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                    </div>
                  ))
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
            Key components for calculating Business Segment ROI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Segment Name
              </h4>
              <p className="text-sm text-muted-foreground">
                A label for a distinct part of your business (e.g., "North America Division", "Widget Product Line", "Consulting Services").
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Invested Capital
              </h4>
              <p className="text-sm text-muted-foreground">
                The total amount of money specifically allocated to that segment. Includes marketing budget, allocated overhead, inventory, and staff costs.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Return (Reason)
              </h4>
              <p className="text-sm text-muted-foreground">
                The total revenue or financial value generated by that segment. For a stricter ROI, use Net Profit instead of Revenue.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                Weighted ROI
              </h4>
              <p className="text-sm text-muted-foreground">
                The average ROI of the entire portfolio, weighted by the size of the investment in each segment. Larger investments impact this metric more.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">
              ROI (%) = ((Return - Investment) / Investment) × 100
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Weighted ROI = ((Total Return - Total Investment) / Total Investment) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            This calculation determines the percentage return on capital employed for each distinct business unit and the aggregate performance.
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
            Tools for investment and profitability analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Simple ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Basic investment return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/gross-profit-vs-net-profit-analyzer" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Gross vs Net Profit</p>
                      <p className="text-sm text-muted-foreground">Compare profit levels</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Operational efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/marketing-roi-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Marketing ROI</p>
                      <p className="text-sm text-muted-foreground">Campaign efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/break-even-point-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Break-Even Analysis</p>
                      <p className="text-sm text-muted-foreground">Profit threshold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/capital-expenditure-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">CapEx Calculator</p>
                      <p className="text-sm text-muted-foreground">Capital spending analysis</p>
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
        <meta itemProp="headline" content="ROI by Business Segment: Strategic Portfolio Analysis Guide" />
        <meta itemProp="description" content="Learn how to calculate and interpret ROI by business segment. Discover strategies to allocate capital efficiently and identify underperforming business units." />
        <meta itemProp="author" content="Financial Strategy Team" />
        <meta itemProp="datePublished" content="2025-08-20" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">ROI by Business Segment: Mastering Portfolio Allocation</h1>
        <p className="text-lg italic text-muted-foreground">In a multi-faceted business, not all revenue is created equal. Segment analysis reveals which parts of your company are driving growth and which are dragging it down.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-segment-roi" className="hover:underline">What is Segment ROI?</a></li>
          <li><a href="#why-it-matters" className="hover:underline">The "BCG Matrix" Concept</a></li>
          <li><a href="#calculation-steps" className="hover:underline">How to Calculate Accurately</a></li>
          <li><a href="#optimization-strategies" className="hover:underline">Capital Allocation Strategies</a></li>
          <li><a href="#challenges" className="hover:underline">Common Challenges in Segmentation</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="what-is-segment-roi" className="text-2xl font-bold text-foreground pt-8">What is Segment ROI?</h2>
        <p>Return on Investment (ROI) by Business Segment is a financial metric used to evaluate the efficiency of specific divisions, product lines, or geographic regions within a company. Instead of looking at the profitability of the company as a whole, it breaks it down into granular pieces.</p>

        <p className="mt-4">This allows executives and business owners to answer critical questions:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Is our new product line actually profitable, or just generating revenue?</li>
          <li>Should we shut down the East Coast branch?</li>
          <li>Where should we invest our next $100,000 for maximum return?</li>
        </ul>

        <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8">The "BCG Matrix" & Portfolio Management</h2>
        <p>This analysis is spiritually connected to the famous Boston Consulting Group (BCG) Matrix, which categorizes business units into four types:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-4 border rounded bg-card">
            <h4 className="font-bold text-green-600">Stars (High Growth, High Share)</h4>
            <p className="text-sm">High ROI segments that are growing fast. Strategy: <span className="font-semibold">Invest aggressively.</span></p>
          </div>
          <div className="p-4 border rounded bg-card">
            <h4 className="font-bold text-yellow-600">Cash Cows (Low Growth, High Share)</h4>
            <p className="text-sm">High profit segments in mature markets. Strategy: <span className="font-semibold">Maintain and milk for cash to fund Stars.</span></p>
          </div>
          <div className="p-4 border rounded bg-card">
            <h4 className="font-bold text-blue-600">Question Marks (High Growth, Low Share)</h4>
            <p className="text-sm">Uncertain segments consuming cash. Strategy: <span className="font-semibold">Analyze deeply to decide if they can become Stars.</span></p>
          </div>
          <div className="p-4 border rounded bg-card">
            <h4 className="font-bold text-red-600">Dogs (Low Growth, Low Share)</h4>
            <p className="text-sm">Low ROI segments with no future. Strategy: <span className="font-semibold">Divest or liquidate.</span></p>
          </div>
        </div>

        <h2 id="calculation-steps" className="text-2xl font-bold text-foreground pt-8">How to Calculate Accurately</h2>
        <p>The math is simple, but the data gathering is hard.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Determine the Investment Base</h3>
        <p>You must accurately allocate assets to the segment. This includes:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Direct Working Capital (Inventory, Cash tailored to that segment).</li>
          <li>Fixed Assets (Machinery used specifically for that product).</li>
          <li>Allocated Shared Costs (A portion of the HQ rent, valid only if necessary).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Determine the Return</h3>
        <p>Use <strong>Segment Operating Profit</strong> rather than just Revenue. Revenue is vanity; Profit is sanity. Ensure you deduct the direct costs (COGS) and direct operating expenses (marketing for that specific product) from the revenue.</p>

        <h2 id="optimization-strategies" className="text-2xl font-bold text-foreground pt-8">Capital Allocation Strategies</h2>
        <p>Once you have your data, follow these rules of thumb:</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">The 80/20 Rule Analysis</h3>
        <p>Often, 20% of your segments produce 80% of your profits. Identify these "Power Segments" and protect them at all costs. Ensure they are fully funded before giving a cent to underperforming segments.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">Fix or Kill</h3>
        <p>If a segment has a negative ROI:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Fix it:</strong> Can you raise prices? Can you cut costs? Set a 6-month deadline.</li>
          <li><strong>Kill it:</strong> If the timeline passes with no improvement, shut it down. Analyzing sunk costs is an emotional trap; ignore them.</li>
        </ul>

        <h2 id="challenges" className="text-2xl font-bold text-foreground pt-8">Common Challenges: The Allocation Problem</h2>
        <p>The hardest part of Segment ROI is <strong>Shared Costs</strong>. </p>
        <p className="mt-2">Example: A CEO manages three product lines. How much of her salary counts as an "investment" in Product A vs. Product B? </p>
        <p className="mt-2"><strong>Best Practice:</strong> Use Activity-Based Costing (ABC). Estimate the % of time or resources actually consumed by the segment. If the CEO spends 90% of her time on Product A, then 90% of her salary is a cost to Product A. Arbitrarily splitting costs 33%/33%/33% can distort ROI and lead to bad decisions.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about segment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I calculate Segment ROI?</h4>
              <p className="text-muted-foreground">
                Quarterly is the standard. Monthly can be too volatile due to timing of expenses, while annual is too slow to react to market changes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Should I include "Corporate Overhead" in segment investment?</h4>
              <p className="text-muted-foreground">
                Generally, no. Segment ROI should measure the performance of the segment itself, independent of corporate bloat. Including HQ costs might make a good segment look bad purely because HQ is expensive. Use "Contribution Margin" for a cleaner view.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "good" Segment ROI?</h4>
              <p className="text-muted-foreground">
                It must exceed your WACC (Weighted Average Cost of Capital). If your cost to borrow money is 5%, and a segment ROI is 4%, you are technically losing value by keeping that segment open, even if it "makes a profit."
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can I segment by customer type?</h4>
              <p className="text-muted-foreground">
                Absolutely. Segmenting by "Enterprise Clients" vs "SMBs" is a powerful way to see where your support team's time is best spent versus where the revenue comes from.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why does my total ROI differ from the average of segment ROIs?</h4>
              <p className="text-muted-foreground">
                This is a mathematical weighting issue. A small segment with 100% ROI doesn't lift the total much if a massive segment has 1% ROI. The "Weighted ROI" respects the size of the capital involved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do inter-segment transfers work?</h4>
              <p className="text-muted-foreground">
                If Segment A sells to Segment B (transfer pricing), you must set a fair market price for that transfer. Otherwise, you artificially inflate Segment A's profit while destroying Segment B's.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is ROI the only metric that matters?</h4>
              <p className="text-muted-foreground">
                No. You also need to look at strategic value. A "Loss Leader" segment might have negative ROI but drives traffic to your high-ROI segments (e.g., cheap printers selling expensive ink).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if I can't calculate exact investment per segment?</h4>
              <p className="text-muted-foreground">
                Start with direct costs you are certain of. For the rest, use reasonable estimates or look at "Return on Sales" (Net Margin) instead of ROI until your accounting data improves.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who strictly benefits from this analysis tool?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Target Audience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Portfolio Managers</strong>
                <span className="text-sm text-muted-foreground">To decide which assets to hold, sell, or double down on based on quantitative returns.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CEOs & Executives</strong>
                <span className="text-sm text-muted-foreground">To rationally allocate the annual budget toward high-performing divisions versus turning around failing ones.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Marketing Directors</strong>
                <span className="text-sm text-muted-foreground">To evaluate the ROI of different marketing channels (e.g., Facebook Ads vs SEO vs TV) as independent segments.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Franchise Owners</strong>
                <span className="text-sm text-muted-foreground">To compare the performance of different store locations against each other.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Considerations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Short-term Bias:</strong> ROI favors short-term profits. Investing in long-term R&D makes ROI look bad today but is essential for tomorrow.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Allocation Arbitrariness:</strong> If you arbitrarily allocate shared costs (like IT support) to a small segment, you can kill its ROI on paper unfairly.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ignoring Synergy:</strong> Killing a low-ROI segment might hurt a high-ROI segment if they share customers (the "halo effect").</span>
              </li>
            </ul>
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
          <p>The ROI by Business Segment Calculator is an essential tool for multi-unit analysis.</p>
          <p>It provides clarity on where true value is being created and where capital is being wasted.</p>
          <p>Use it to drive data-backed budgeting and strategic divestment decisions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
