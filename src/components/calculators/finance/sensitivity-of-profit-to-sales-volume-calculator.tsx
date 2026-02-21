'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity, BarChart3, AlertCircle, Info, Target, Calculator, DollarSign, Shield, ArrowUpRight, CheckCircle2, Factory, Scale, Users, Briefcase, FileText, AlertTriangle, FunctionSquare, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentSales: z.number().min(0, "Sales must be positive"),
  currentProfit: z.number().min(-1000000000), // Profit can be negative
  fixedCosts: z.number().min(0, "Fixed costs must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SensitivityProfitSalesVolumeCalculator() {
  const [result, setResult] = useState<{
    margin: number;
    dol: number;
    breakeven: number;
    scenarios: { change: number; sales: number; profit: number; profitChangePercent: number }[];
    leverageStatus: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentSales: undefined,
      currentProfit: undefined,
      fixedCosts: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Contribution Margin
    // Profit = (Sales - Variable Costs) - Fixed Costs
    // Profit + Fixed Costs = Sales - Variable Costs = Contribution Margin
    const contributionMarginTotal = v.currentProfit + v.fixedCosts;
    const contributionMarginRatio = contributionMarginTotal / v.currentSales;

    // 2. Degree of Operating Leverage (DOL)
    // DOL = Contribution Margin / Operating Profit
    // If Profit is 0 or negative, DOL is undefined/infinite/negative (handle gracefully)
    let dol = 0;
    if (v.currentProfit > 0) {
      dol = contributionMarginTotal / v.currentProfit;
    } else {
      dol = 0; // or special flag for "Negative/Undefined"
    }

    // 3. Break-even Point
    // BEP (Sales) = Fixed Costs / CM Ratio
    const breakevenSales = v.fixedCosts / contributionMarginRatio;

    // 4. Scenarios (-20% to +20%)
    const scenarios = [-20, -10, 0, 10, 20].map(change => {
      const newSales = v.currentSales * (1 + change / 100);
      const newContribution = newSales * contributionMarginRatio;
      const newProfit = newContribution - v.fixedCosts;

      // Calculate profit change %
      // (New Profit - Old Profit) / |Old Profit| 
      // Using abs for denominator to handle sign changes correctly if profit was negative? 
      // Actually standard formula is (New - Old) / Old. 
      const profitChangePercent = ((newProfit - v.currentProfit) / Math.abs(v.currentProfit)) * 100;

      return {
        change, // Sales Change %
        sales: newSales,
        profit: newProfit,
        profitChangePercent
      };
    });

    return { contributionMarginTotal, contributionMarginRatio, dol, breakevenSales, scenarios };
  };

  const getLeverageStatus = (dol: number) => {
    if (dol > 5) return 'Very High Leverage';
    if (dol > 2.5) return 'High Leverage';
    if (dol > 1.5) return 'Moderate Leverage';
    if (dol > 1) return 'Low Leverage';
    return 'Negative/Distressed';
  };

  const getRecommendation = (dol: number, profit: number) => {
    if (profit <= 0) return 'Immediate Focus: Cost Cutting. You are operating below break-even. Operating leverage is working against you.';
    if (dol > 4) return 'Aggressive Growth Strategy. Your high fixed costs mean every new dollar of sales adds massive profit. Prioritize volume over price.';
    if (dol > 2) return 'Balanced Growth. You have healthy leverage. Increasing sales will nicely boost profits, but a downturn won\'t immediately bankrupt you.';
    return 'Margin Focus. You have low fixed costs but likely high variable costs. Focus on raising prices or reducing variable costs per unit rather than just chasing volume.';
  };

  const getInsights = (dol: number, cmRatio: number) => {
    const insights = [];
    if (dol > 1) {
      insights.push(`For every 1% change in sales, your profit swings by ${dol.toFixed(1)}%`);
    }
    if (cmRatio < 0.2) {
      insights.push('Low Contribution Margin: You barely cover variable costs. Volume solves little; you need better pricing.');
    } else if (cmRatio > 0.6) {
      insights.push('High Contribution Margin: excellent potential for scalability.');
    }
    return insights;
  };

  const getRisks = (dol: number) => {
    const risks = [];
    if (dol > 3) risks.push('Sensitivity Risk: A small dip in sales could wipe out your profits entirely.');
    risks.push('Forecast Assumption: Assumes variable costs relative to sales remain constant (no bulk discounts or supply shocks).');
    risks.push('Fixed Cost Creep: Ensure "Fixed Costs" don\'t actually rise with volume (step-costs).');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    if (values.currentSales <= 0) return; // Prevent div by zero

    const res = calculate(values);

    setResult({
      margin: res.contributionMarginRatio,
      dol: res.dol,
      breakeven: res.breakevenSales,
      scenarios: res.scenarios,
      leverageStatus: getLeverageStatus(res.dol),
      recommendation: getRecommendation(res.dol, values.currentProfit),
      insights: getInsights(res.dol, res.contributionMarginRatio),
      risks: getRisks(res.dol)
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Profit Drivers
          </CardTitle>
          <CardDescription>
            Enter your current financials to model profit elasticity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="currentSales"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> Current Sales ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1000000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Operating Profit ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 150000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                        <Factory className="h-4 w-4" /> Fixed Costs ($)
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 300000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Sensitivity
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
                <Scale className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Operating Leverage Analysis</CardTitle>
                  <CardDescription>How sensitive is your profit to volume changes?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DOL Card */}
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm font-medium text-muted-foreground">Degree of Operating Leverage</p>
                  <p className="text-3xl font-bold text-primary mt-2">{result.dol.toFixed(2)}x</p>
                  <Badge className="mt-2 text-xs" variant={result.dol > 2.5 ? 'destructive' : 'default'}>
                    {result.leverageStatus}
                  </Badge>
                </div>
                {/* Breakdown BEP */}
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm font-medium text-muted-foreground">Break-Even Sales</p>
                  <p className="text-3xl font-bold text-primary mt-2">${result.breakeven.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">Sales needed to cover costs</p>
                </div>
                {/* Multiplier Effect */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-center border border-blue-100 dark:border-blue-900/20">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">The "Multiplier Effect"</p>
                  <p className="text-lg font-semibold mt-2 text-blue-900 dark:text-blue-100">
                    10% more sales = <br />
                    <span className="text-2xl font-bold text-green-600">{(result.dol * 10).toFixed(1)}%</span> more profit
                  </p>
                </div>
              </div>

              {/* Sensitivity Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Scenario</th>
                      <th className="p-3 text-right">Sales Volume</th>
                      <th className="p-3 text-right">Proj. Profit</th>
                      <th className="p-3 text-right">Profit Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scenarios.map((row) => (
                      <tr key={row.change} className={row.change === 0 ? "bg-primary/5 font-medium" : ""}>
                        <td className="p-3 border-t">
                          {row.change > 0 ? `+${row.change}% Growth` : row.change < 0 ? `${row.change}% Decline` : 'Current State'}
                        </td>
                        <td className="p-3 border-t text-right">${row.sales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className={`p-3 border-t text-right ${row.profit < 0 ? 'text-red-600 font-bold' : ''}`}>${row.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="p-3 border-t text-right">
                          {row.profitChangePercent > 0 ? '+' : ''}{row.profitChangePercent.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Insight:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Key Takeaways
                </CardTitle>
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

            <Card className="h-full border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Cost Structure
          </CardTitle>
          <CardDescription>
            The relationship between fixed and variable costs drives leverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Factory className="h-4 w-4" /> Fixed Costs
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Costs that do NOT change with sales volume (Rent, Salaries, Software Licenses). High fixed costs = High Leverage.
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <TrendingUp className="h-4 w-4" /> Variable Contribution
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The money left over from each sale after paying variable costs (Materials, Commission). This "Contribution Margin" pays off fixed costs first, then becomes profit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto text-center">
            <p className="font-mono text-sm mb-2">
              <strong>Degree of Operating Leverage (DOL)</strong> = Contribution Margin / Operating Interest (EBIT)
            </p>
            <p className="font-mono text-sm">
              where Contribution Margin = Sales - Variable Costs
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-2">
              Alternative: (Fixed Costs + Profit) / Profit
            </p>
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
            Explore other profitability and efficiency tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Break-Even Analysis</p>
                      <p className="text-sm text-muted-foreground">Find the safety zone</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/gross-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Gross Margin Ratio</p>
                      <p className="text-sm text-muted-foreground">Product profitability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/operating-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Operating Margin</p>
                      <p className="text-sm text-muted-foreground">EBIT efficiency</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO Metadata */}
        <meta itemProp="headline" content="Sensitivity of Profit to Sales Volume: A Guide to Operating Leverage" />
        <meta itemProp="description" content="Understand how changes in sales volume impact your bottom line. Master the Degree of Operating Leverage (DOL) to predict profit swings." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Levering Up: How Volume Drives Profitability</h1>
        <p className="text-lg italic text-muted-foreground mb-6">
          Why does a 10% increase in sales lead to a 50% increase in profit for some companies, but only 11% for others? The answer lies in Operating Leverage.
        </p>

        <div className="bg-muted/30 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Content</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-primary">
            <li><a href="#operating-leverage" className="hover:underline flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> What is Operating Leverage?</a></li>
            <li><a href="#high-vs-low" className="hover:underline flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> High Cost vs Low Cost Structures</a></li>
            <li><a href="#dol-metric" className="hover:underline flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> The DOL Multiplier</a></li>
            <li><a href="#strategy" className="hover:underline flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Strategy: When to Automate?</a></li>
          </ul>
        </div>

        <h2 id="operating-leverage" className="text-2xl font-bold text-foreground">What is Operating Leverage?</h2>
        <p>
          Operating leverage measures the proportion of fixed costs in a company's cost structure. It acts as a <strong>multiplier</strong> for profit.
        </p>
        <p>
          When you have high fixed costs (like a software company that pays developers regardless of sales), every additional sale has almost zero extra cost. The profit flows straight to the bottom line. This is high leverage.
        </p>
        <p>
          When you have high variable costs (like a grocery store buying lemons to resell), every additional sale brings additional costs. The profit margin stays flat. This is low leverage.
        </p>

        <h2 id="high-vs-low" className="text-2xl font-bold text-foreground mt-8">High vs. Low Operating Leverage</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 border border-blue-200 rounded-lg">
            <strong className="text-lg text-blue-700 block mb-2">High Leverage (Software, Airlines, Hotels)</strong>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>High Break-even point (Risky).</li>
              <li>Massive profits once break-even is passed.</li>
              <li>Strategy: Maximize volume at all costs. Fill the plane, fill the hotel room. Discount if necessary.</li>
            </ul>
          </div>
          <div className="p-4 border border-amber-200 rounded-lg">
            <strong className="text-lg text-amber-700 block mb-2">Low Leverage (Consulting, Retail)</strong>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Low Break-even point (Safe).</li>
              <li>Profits grow linearly with sales.</li>
              <li>Strategy: Focus on pricing power and margin per unit. Volume helps, but it doesn't explode profits.</li>
            </ul>
          </div>
        </div>

        <h2 id="dol-metric" className="text-2xl font-bold text-foreground mt-8">The DOL Multiplier</h2>
        <p>
          The <strong>Degree of Operating Leverage (DOL)</strong> tells you the elasticity of your operating income.
        </p>
        <p className="mt-4">
          <em>Formula: % Change in EBIT / % Change in Sales</em>
        </p>
        <p>
          If your DOL is 3.0, a 10% dip in sales causes a 30% crash in profits. This explains why tech stocks (high DOL) are so volatile compared to utility stocks (low DOL).
        </p>

        <h2 id="strategy" className="text-2xl font-bold text-foreground mt-8">Strategy: When to Automate?</h2>
        <p>
          Automation usually means trading variable costs (human labor) for fixed costs (robots/software).
        </p>
        <p>
          This increases your Operating Leverage.
          <br />
          <strong>Pros:</strong> If you grow, you become wildly profitable.
          <br />
          <strong>Cons:</strong> If you shrink, you still have to pay for the robots. You cannot "fire" a machine as easily as cutting shifts.
          <br />
          Therefore, companies should only automate (increase leverage) when they are confident in stable, high-volume demand.
        </p>

      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Deep dive into sensitivity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">Why did my DOL change when profit changed?</h4>
              <p className="text-muted-foreground text-sm">
                DOL is not a static number. It changes based on where you are relative to your break-even point. When you are very close to break-even, DOL is massive (infinite sensitivity). As you get more profitable, DOL decreases because your fixed costs become a smaller percentage of the total pie.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Is high leverage always good?</h4>
              <p className="text-muted-foreground text-sm">
                No. It is a double-edged sword. In a recession, high-leverage firms die first because they cannot cut their fixed costs fast enough to match falling revenue. Low-leverage firms just buy less inventory and survive.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">How do I reduce Operating Leverage?</h4>
              <p className="text-muted-foreground text-sm">
                Convert fixed costs to variable costs. Example: Outsource shipping (pay per package) instead of owning trucks (fixed insurance/maintenance). Lease offices with short terms. Use freelancers instead of full-time staff.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Does this include Financial Leverage?</h4>
              <p className="text-muted-foreground text-sm">
                No. This calculator focuses on <em>Operating</em> Leverage (business risk). <em>Financial</em> Leverage refers to debt/interest. The combination of both is "Total Leverage," which makes a company extremely risky.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">How does inflation affect this?</h4>
              <p className="text-muted-foreground text-sm">
                Inflation hits variable costs (raw materials) first. If you cannot raise prices, your contribution margin shrinks. This actually <em>increases</em> your break-even point but might lower your DOL if fixed costs stay flat (like a long-term rent contract).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">What DOL is "Normal"?</h4>
              <p className="text-muted-foreground text-sm">
                It varies by industry. Retail DOL is often 1.2 to 1.5. Manufacturing might be 2.0 to 4.0. Software can be 10.0+. Benchmarking against peers is essential.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Can DOL be negative?</h4>
              <p className="text-muted-foreground text-sm">
                Yes, if the company is operating at a loss. A negative DOL indicates the company is below break-even. The number isn't useful as a multiplier in this state; the focus should simply be on survival.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Why is contribution margin important?</h4>
              <p className="text-muted-foreground text-sm">
                It is the fuel that pays for fixed costs. If contribution margin is low, you are running on a treadmill—selling more doesn't get you ahead fast enough.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who benefits most from this analysis?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Business Owners</strong>
                <span className="text-sm text-muted-foreground">To decided whether to sign a long-term lease (increasing fixed costs) or stay in a co-working space.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Stock Analysts</strong>
                <span className="text-sm text-muted-foreground">To predict earnings surprises. A high DOL company that beats sales estimates by 2% might beat earnings estimates by 10%.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">FP&A Managers</strong>
                <span className="text-sm text-muted-foreground">To stress-test budgets. "What happens to our bottom line if sales miss by 15%?"</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">SaaS vs. Agency</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  <strong>SaaS (Dropbox):</strong> High Fixed Cost (Servers/Devs), Low Variable Cost. <br />Result: Massive leverage. Once they cover costs, every user is pure profit.<br />
                  <strong>Agency (Marketing Firm):</strong> Low Fixed Cost, High Variable (Freelancers). <br />Result: Low leverage. Safe, but hard to scale profits non-linearly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Profit Sensitivity Calculator (Operating Leverage) is your crystal ball for future earnings.</p>
          <p>It reveals the hidden multipliers in your business model. Use it to balance the risk of high fixed costs against the reward of scalable profits.</p>
        </CardContent>
      </Card>
    </div>
  );
}
