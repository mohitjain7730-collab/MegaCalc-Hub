'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calculator, DollarSign, Info, AlertTriangle, TrendingUp, TrendingDown, RefreshCcw, Landmark, BarChart3, CheckCircle2, Factory, PieChart, Timer, AlertCircle, ArrowUpRight, Scale, Briefcase, Users, Target, Shield, FunctionSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  pricePerUnit: z.number().positive('Price must be positive'),
  variableCostPerUnit: z.number().min(0, 'Variable cost cannot be negative'),
  fixedCosts: z.number().min(0, 'Fixed costs cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

export default function EconomicBreakEvenQuantityCalculator() {
  const [result, setResult] = useState<{
    breakEvenQty: number | null;
    breakEvenRevenue: number | null;
    contributionMargin: number;
    contributionMarginRatio: number;
    operatingLeverage: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pricePerUnit: undefined,
      variableCostPerUnit: undefined,
      fixedCosts: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    const P = v.pricePerUnit;
    const VC = v.variableCostPerUnit;
    const FC = v.fixedCosts;

    const CM = P - VC;
    const CMRatio = P > 0 ? (CM / P) * 100 : 0;

    let BEQ: number | null = null;
    let BER: number | null = null;

    if (CM > 0) {
      BEQ = FC / CM;
      BER = BEQ * P;
    } else {
      BEQ = null; // Impossible to break even if P <= VC
    }

    // Insights and Recommendation
    const insights = [];
    const risks = [];
    let recommendation = '';

    if (CM <= 0) {
      insights.push('Your Variable Cost exceeds your Price. Every unit sold loses money.');
      recommendation = 'Critical: You must raise prices or drastically cut variable costs immediately. Fixed cost reduction won\'t solve this.';
      risks.push('Negative Contribution Margin ensures bankruptcy if specific action is not taken.');
    } else if (BEQ !== null) {
      if (CMRatio > 60) {
        insights.push('High Contribution Margin Ratio (>60%) indicates high scalability potential.');
      } else if (CMRatio < 20) {
        insights.push('Low Contribution Margin Ratio (<20%) means you need massive volume to cover fixed costs.');
      }

      if (FC === 0) {
        insights.push('With zero fixed costs, your break-even is 0 units.');
      } else {
        const timeToBE = BEQ > 1000 ? 'Ensure you have runway.' : 'Achievable quickly.';
        insights.push(`To cover $${FC.toLocaleString()} overhead, you need to sell ${Math.ceil(BEQ).toLocaleString()} units. ${timeToBE}`);
      }

      const leverageType = CMRatio > 50 ? 'High Operating Leverage' : 'Low Operating Leverage';

      if (CMRatio > 50) {
        insights.push('High Operating Leverage: Profits will grow continuously faster than sales once you pass break-even.');
      }

      if (BEQ > 100000 && P > 100) {
        recommendation = 'The break-even volume is very high for a high-priced item. Verify market demand exists.';
        risks.push('High volume requirement for high price point implies niche vs mass market conflict.');
      } else {
        recommendation = 'Focus on sales volume. Every unit above the break-even point is pure profit (minus taxes).';
      }

      if (FC > 100000 && CMRatio < 15) {
        risks.push('High Fixed Costs paired with Low Margins is the riskiest business model (e.g. Airlines).');
      }
    }

    setResult({
      breakEvenQty: BEQ,
      breakEvenRevenue: BER,
      contributionMargin: CM,
      contributionMarginRatio: CMRatio,
      operatingLeverage: CM > 0 ? (CMRatio > 40 ? 'High' : 'Low') : 'N/A',
      recommendation,
      insights,
      riskFactors: risks
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Cost & Price Inputs
          </CardTitle>
          <CardDescription>
            Enter your unit economics and fixed overheads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="pricePerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 150" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="variableCostPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Variable Cost per Unit ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 90" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fixedCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Total Fixed Costs ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g. 50000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <Activity className="mr-2 h-4 w-4" />
                Calculate Break-even Point
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
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Break-even Analysis</CardTitle>
                  <CardDescription>Units required to cover all costs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="p-6 bg-muted/40 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Scale className="h-24 w-24" />
                  </div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Break-even Quantity</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-4xl font-extrabold text-primary">
                      {result.breakEvenQty !== null ? Math.ceil(result.breakEvenQty).toLocaleString() : '∞'}
                    </p>
                    <span className="text-lg text-muted-foreground font-medium">units</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Sales volume needed to reach $0 profit</p>
                </div>

                <div className="p-6 bg-muted/40 rounded-xl border shadow-sm">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Break-even Revenue</p>
                  <p className="text-4xl font-extrabold text-foreground">
                    {result.breakEvenRevenue !== null ? `$${result.breakEvenRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Total sales revenue needed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Contribution Margin</p>
                  <p className={`text-xl font-bold mt-1 ${result.contributionMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${result.contributionMargin.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Per unit profit (before fixed costs)</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">CM Ratio</p>
                  <p className="text-xl font-bold mt-1 text-foreground">{result.contributionMarginRatio.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">% of sales available for fixed costs</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <RefreshCcw className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold">Leverage</p>
                  <Badge variant={result.operatingLeverage === 'High' ? 'default' : 'secondary'} className="mt-2">
                    {result.operatingLeverage}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Sensitivity to volume</p>
                </div>
              </div>

              <Alert variant="default" className={result.contributionMargin <= 0 ? "bg-red-50 border-red-200" : "bg-primary/5 border-primary/20"}>
                {result.contributionMargin <= 0 ? <AlertCircle className="h-4 w-4 text-red-600" /> : <Info className="h-4 w-4 text-primary" />}
                <AlertDescription className={result.contributionMargin <= 0 ? "text-red-800" : "text-primary/90"}>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Vulnerabilities in your model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.contributionMargin <= 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">Negative Contribution: You lose money on every single sale. Scaling up will only increase losses.</span>
                  </div>
                ) : (
                  <>
                    {result.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                      </div>
                    ))}
                    {result.riskFactors.length === 0 && (
                      <div className="flex items-center justify-center p-6 text-green-600">
                        <CheckCircle2 className="h-6 w-6 mr-2" />
                        <span>No critical risks detected.</span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Info className="h-6 w-6" />
                  Key Insights
                </CardTitle>
                <CardDescription>Strategic takeaways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.length > 0 ? (
                  result.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <ArrowUpRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm font-medium">{insight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Enter valid inputs to see strategic insights.</p>
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
            Core components of Unit Economics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                Price per Unit
              </h4>
              <p className="text-sm text-muted-foreground">
                The selling price of a single product or service. This is your topline revenue driver.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Variable Costs
              </h4>
              <p className="text-sm text-muted-foreground">
                Costs that change directly with volume (e.g., raw materials, direct labor, shipping, sales commissions).
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                Fixed Costs
              </h4>
              <p className="text-sm text-muted-foreground">
                Overhead expenses that remain constant regardless of sales volume (e.g., rent, salaries, insurance, software subscriptions).
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
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Break-Even Quantity = Total Fixed Costs / (Price - Variable Cost per Unit)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The denominator (Price - VC) is known as the <strong>Contribution Margin</strong>. It represents the portion of every sale that contributes to "paying down" the fixed costs. Once fixed costs are driven to zero, the Contribution Margin becomes pure profit.
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
            Profitability and margin tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/contribution-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Contribution Margin</p>
                      <p className="text-sm text-muted-foreground">Unit profitability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/profit-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Net margin analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/financial-break-even-npv-zero-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">NPV Break-even</p>
                      <p className="text-sm text-muted-foreground">Time-value adjusted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/cogs-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Factory className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">COGS Estimator</p>
                      <p className="text-sm text-muted-foreground">Cost of Goods Sold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <RefreshCcw className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">Operational efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/markup-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">Markup Calculator</p>
                      <p className="text-sm text-muted-foreground">Price setting tool</p>
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
        <meta itemProp="headline" content="Economic Break-even Quantity: The Strategic Manager's Guide" />
        <meta itemProp="description" content="Master the art of Break-even Analysis. Learn how to calculate the exact sales volume needed to cover costs and why Contribution Margin is the secret to scaling profitability." />
        <meta itemProp="author" content="Business Strategy Team" />
        <meta itemProp="datePublished" content="2025-10-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Economic Break-even Quantity: The Foundation of Profitability</h1>
        <p className="text-lg italic text-muted-foreground">"How many do we need to sell to keep the lights on?" It is the most fundamental question in business. The Economic Break-even Quantity isn't just a survival metric; it is the pivot point where your business transforms from a liability into an asset. This guide explores the mechanics of cost-volume-profit analysis in depth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">The Core Concept: Fixed vs. Variable Costs</a></li>
          <li><a href="#contribution-margin" className="hover:underline">The Magic of Contribution Margin</a></li>
          <li><a href="#formula" className="hover:underline">The Formula Explained</a></li>
          <li><a href="#strategy" className="hover:underline">Strategic Levers for Growth</a></li>
          <li><a href="#operating-leverage" className="hover:underline">Understanding Operating Leverage</a></li>
          <li><a href="#limitations" className="hover:underline">Risks and Limitations</a></li>
          <li><a href="#faq" className="hover:underline">Frequently Asked Questions</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8">The Core Concept: Fixed vs. Variable Costs</h2>
        <p>To calculate break-even, you must first categorize every dollar leaving your company into one of two buckets. Getting this wrong destroys the accuracy of your model.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 bg-muted rounded-lg">
            <strong className="block text-primary text-lg mb-2">Fixed Costs (Overhead)</strong>
            <p>These costs exist even if you sell ZERO units. They are time-dependent, not volume-dependent.</p>
            <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
              <li>Office Rent & Warehouse Leases</li>
              <li>Salaried Employees (Admin, Management)</li>
              <li>Insurance Premiums</li>
              <li>Software Subscriptions (SaaS)</li>
              <li>Depreciation of Machinery</li>
            </ul>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <strong className="block text-primary text-lg mb-2">Variable Costs (COGS)</strong>
            <p>These costs correlate perfectly with sales volume. If you sell zero units, these costs are zero.</p>
            <ul className="list-disc ml-6 mt-2 text-sm space-y-1">
              <li>Raw Materials & Ingredients</li>
              <li>Direct Labor (Hourly wage per unit)</li>
              <li>Shipping & Fulfillment fees</li>
              <li>Credit Card Processing Fees (e.g., 2.9%)</li>
              <li>Sales Commissions</li>
            </ul>
          </div>
        </div>

        <h2 id="contribution-margin" className="text-2xl font-bold text-foreground pt-8">The Magic of Contribution Margin</h2>
        <p>This is the most critical concept in unit economics. <strong>Contribution Margin (CM)</strong> is the amount of money remaining from a single sale after the variable costs are paid.</p>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
          <span className="text-xl font-bold text-primary">Contribution Margin = Price - Variable Cost</span>
        </div>
        <p className="mt-4">Think of it this way: The Contribution Margin is the soldier that goes to war against your Fixed Costs. If you sell a coffee for $5, and the beans/cup cost $2, your CM is $3. That $3 doesn't go to your pocket yet—it goes to pay the Barista and the Landlord. Only after the Landlord is fully paid does the $3 become profit.</p>
        <p className="mt-2"><strong>Rule of Thumb:</strong> If your Contribution Margin is negative, you can never make a profit, no matter how much you sell. You are digging a deeper hole with every sale.</p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Formula Explained</h2>
        <p>The math is simple algebra. We want to find the Quantity (Q) where Total Revenue equals Total Costs.</p>
        <p className="font-mono bg-muted p-2 mt-2 rounded inline-block">Revenue = Fixed Costs + (Variable Cost per Unit * Q)</p>
        <p className="mt-2 text-sm text-muted-foreground">Rearranging for Q:</p>
        <p className="font-mono bg-muted p-2 mt-2 rounded inline-block">Q = Fixed Costs / (Price - Variable Cost)</p>
        <p className="mt-4">This tells you exactly how many "Contributions" you need to pile up to equal the "Mountain" of Fixed Costs.</p>

        <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8">Strategic Levers for Growth</h2>
        <p>If your Break-even quantity is too high (unachievable), you have three levers to pull:</p>
        <ol className="list-decimal ml-6 mt-4 space-y-4">
          <li>
            <strong>Raise Prices:</strong> The most powerful lever. Increasing price flows 100% to Contribution Margin.
            <em className="block text-sm text-muted-foreground mt-1">Risk: Lower demand/conversion.</em>
          </li>
          <li>
            <strong>Slash Variable Costs:</strong> Negotiate better rates with suppliers, use cheaper materials, or optimize shipping.
            <em className="block text-sm text-muted-foreground mt-1">Risk: Lower product quality.</em>
          </li>
          <li>
            <strong>Cut Fixed Costs:</strong> Move to a smaller office, fire admin staff, or cancel software. This lowers the hurdle you have to jump.
            <em className="block text-sm text-muted-foreground mt-1">Risk: Reduced capacity or team morale.</em>
          </li>
        </ol>

        <h2 id="operating-leverage" className="text-2xl font-bold text-foreground pt-8">Understanding Operating Leverage</h2>
        <p>Operating Leverage describes the ratio of Fixed Costs to Variable Costs.</p>
        <ul className="list-disc ml-6 mt-4 space-y-2">
          <li><strong>High Leverage (Software Company):</strong> Huge fixed costs (developers), tiny variable costs (server usage). Once they break even, every new customer is almost 100% profit. This is why SaaS valuations are high.</li>
          <li><strong>Low Leverage (Retail Store):</strong> Low fixed costs, high variable costs (inventory). They break even quickly, but profit grows slowly because they have to buy more inventory for every sale.</li>
        </ul>

        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8">Risks and Limitations</h2>
        <div className="mt-4 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/20">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">The "Linearity" Trap</h3>
          <p className="text-amber-700 dark:text-amber-400 text-sm">
            This model assumes costs are linear. In reality, you have "Step Costs." Your warehouse fits 1,000 units. If you sell 1,001, you might need to rent a second warehouse, doubling your Fixed Costs instantly. Always watch for capacity cliffs.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Break-even Analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does this include Profit goals?</h4>
              <p className="text-muted-foreground">
                No, this calculates the point of $0 profit. To target a specific profit (e.g., $100k), add that target to your Fixed Costs numerator. Formula: <code>(Fixed Costs + Target Profit) / CM</code>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Is "Economic" Break-even different from "Accounting"?</h4>
              <p className="text-muted-foreground">
                Strictly speaking, yes. "Economic" break-even should include opportunity costs (the salary you could earn elsewhere, or interest on capital). This calculator uses the standard Accounting method, but you can simulate Economic Break-even by adding your "Opportunity Salary" to the Fixed Costs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if I have multiple products?</h4>
              <p className="text-muted-foreground">
                You must use a "Weighted Average Contribution Margin." If you sell 50% Product A ($10 CM) and 50% Product B ($20 CM), your weighted CM is $15. Use that in the formula.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my break-even quantity negative?</h4>
              <p className="text-muted-foreground">
                This happens when your Variable Cost is higher than your Price. You have a negative Contribution Margin. Mathematically, you can never break even; you lose more money with every sale.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I run this?</h4>
              <p className="text-muted-foreground">
                Re-calculate whenever your costs change (e.g., supplier price hike) or when you change your pricing strategy. It's also critical before launching any new product line.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does this account for taxes?</h4>
              <p className="text-muted-foreground">
                Break-even usually refers to "Operating Profit" (EBIT) of zero, so taxes are irrelevant at that exact point. However, if you are targeting a specific Net Income, you must adjust for taxes: <code>Target Pre-Tax Profit = Target Net Income / (1 - Tax Rate)</code>.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Margin of Safety"?</h4>
              <p className="text-muted-foreground">
                It is the difference between your actual sales and your break-even sales. If you sell 1,000 units and break-even is 800, your Margin of Safety is 200 units (or 20%). It tells you how much sales can drop before you lose money.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can Fixed Costs change?</h4>
              <p className="text-muted-foreground">
                Yes. "Fixed" just means they don't change with *volume* in the short term. They can change due to rent hikes, inflation, or strategic decisions. This is known as "Fixed Cost Creep."
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between Break-even Quantity and Revenue?</h4>
              <p className="text-muted-foreground">
                Quantity is the *number of units* you need to sell. Revenue is the *total dollar value* of those sales. Revenue = Quantity * Price.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Best use cases for this analysis tool
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
                <strong className="block text-primary mb-1">Startup Founders</strong>
                <span className="text-sm text-muted-foreground">To validate if their business idea is viable before launching. "Can I realistically sell 500 units a month?"</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Product Managers</strong>
                <span className="text-sm text-muted-foreground">To set pricing for new features or products. "If we price at $50, we need 1000 users; if at $100, we only need 500."</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Operations Managers</strong>
                <span className="text-sm text-muted-foreground">To decide on cost-cutting measures. "If we automate this process (increasing fixed costs but lowering variable), does our break-even improve?"</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To assess the risk of a business. A high break-even point is a red flag for early-stage companies.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Briefcase className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example 1: The Coffee Shop</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>Scenario:</strong> Rent is $5,000/mo (Fixed). Coffee sells for $4 (Price). Beans/Cup/Milk cost $1 (Variable). <br />
                  <strong>Result:</strong> CM is $3. Break-even = $5,000 / $3 = 1,667 cups per month. ~55 cups per day. <br />
                  <strong>Insight:</strong> If they only sell 40 cups a day, they are insolvent. They need to increase traffic or price.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example 2: The Software SaaS</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  <strong>Scenario:</strong> Engineers cost $50,000/mo (Fixed). Subscription is $50/mo (Price). Server cost is $1/mo (Variable). <br />
                  <strong>Result:</strong> CM is $49. Break-even = $50,000 / $49 = 1,021 users. <br />
                  <strong>Insight:</strong> Once they hit user 1,022, 98% of revenue is profit. Strategies should focus entirely on user acquisition (Marketing).
                </p>
              </div>
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
          <p>The Economic Break-even Quantity Calculator is the first line of defense against business failure.</p>
          <p>By clearly defining the line between loss and profit, it empowers you to make data-driven decisions about pricing, hiring, and expansion. Use it to ensure your business model is built on solid ground before you spend a single dollar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
