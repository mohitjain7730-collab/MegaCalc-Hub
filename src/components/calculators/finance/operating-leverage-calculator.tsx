'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calculator, Percent, BarChart3, CheckCircle2, Scale, ArrowRight, Zap, Target, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  salesRevenue: z.number().positive('Revenue must be positive'),
  variableCosts: z.number().min(0, 'Variable costs must be non-negative'),
  fixedCosts: z.number().min(0, 'Fixed costs must be non-negative'),
  projectedSalesChange: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OperatingLeverageCalculator() {
  const [result, setResult] = useState<{
    contributionMargin: number;
    operatingIncome: number;
    dol: number;
    projectedIncomeChange: number | null;
    leverageLevel: string;
    interpretation: string;
    recommendation: string;
    insights: string[];
    riskFactors: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesRevenue: undefined,
      variableCosts: undefined,
      fixedCosts: undefined,
      projectedSalesChange: 10, // Default to analyzing a 10% jump
    },
  });

  const calculate = (v: FormValues) => {
    const { salesRevenue, variableCosts, fixedCosts, projectedSalesChange } = v;

    const contributionMargin = salesRevenue - variableCosts;
    const operatingIncome = contributionMargin - fixedCosts;

    if (operatingIncome <= 0) {
      // DOL is undefined or negative/meaningless if operating at a loss for standard analysis context 
      // though mathematically calculable, it confuses non-experts. We will handle gracefully.
      return {
        contributionMargin,
        operatingIncome,
        dol: 0,
        projectedIncomeChange: null,
        leverageLevel: 'Not Applicable',
        interpretation: 'The business is currently operating at a loss.',
        recommendation: 'Focus on reaching the break-even point before analyzing leverage multipliers.',
        insights: [`You are losing $${Math.abs(operatingIncome).toFixed(2)} per period.`],
        riskFactors: ['Operating Loss: Leverage analysis applies effectively only when profitable.'],
      };
    }

    const dol = contributionMargin / operatingIncome;

    let leverageLevel = 'Moderate';
    if (dol > 5) leverageLevel = 'Very High';
    else if (dol > 3) leverageLevel = 'High';
    else if (dol < 1.5) leverageLevel = 'Low';

    const projectedIncomeChange = projectedSalesChange ? projectedSalesChange * dol : null;

    const interpretation = `Your Degree of Operating Leverage (DOL) is ${dol.toFixed(2)}x.`;

    let recommendation = '';
    if (leverageLevel === 'High' || leverageLevel === 'Very High') {
      recommendation = 'Your high leverage means massive profit potential during growth, but extreme risk during downturns. Maintain large cash reserves.';
    } else {
      recommendation = 'Your low leverage indicates stability. Profits wont skyrocket with sales, but you are safer during recessions.';
    }

    const insights = [
      `For every 1% change in sales volume, your Operating Income (EBIT) will change by ${dol.toFixed(2)}%.`,
      projectedSalesChange ? `A ${projectedSalesChange}% increase in sales would boost your operating profit by ${projectedIncomeChange?.toFixed(1)}%.` : 'Enter a projected sales change to see the impact.',
      `You have covered your fixed costs and are generating $${operatingIncome.toLocaleString()} in operating profit.`,
    ];

    const riskFactors = [
      dol > 4 ? 'High Volatility Risk: A small dip in sales could wipe out your profits completely.' : undefined,
      fixedCosts > variableCosts ? 'Fixed-Cost Heavy Structure: High break-even point reduces flexibility.' : undefined,
    ].filter(Boolean) as string[];

    if (riskFactors.length === 0) riskFactors.push('Balanced cost structure reduces volatility risk.');

    return {
      contributionMargin,
      operatingIncome,
      dol,
      projectedIncomeChange,
      leverageLevel,
      interpretation,
      recommendation,
      insights,
      riskFactors,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Financial Position
          </CardTitle>
          <CardDescription>
            Enter your income statement figures to calculate operating leverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="salesRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Sales Revenue ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500000"
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
                  name="variableCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        Total Variable Costs ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 200000"
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
                  name="fixedCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scale className="h-4 w-4" />
                        Total Fixed Costs ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 150000"
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
                  name="projectedSalesChange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Projected Sales Growth (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 10 (Optional simulation)"
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Operating Leverage
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
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Degree of Operating Leverage (DOL)</CardTitle>
                  <CardDescription>Sensitivity Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-primary">{result.dol.toFixed(2)}x</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Scale className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Leverage Profile</p>
                  <Badge variant={result.leverageLevel === 'Very High' || result.leverageLevel === 'High' ? 'destructive' : result.leverageLevel === 'Low' ? 'default' : 'secondary'}>
                    {result.leverageLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Operating Income</p>
                  <p className="text-lg font-bold text-green-600">${result.operatingIncome.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Profit Multiplier</p>
                  <p className="text-lg font-bold text-purple-600">
                    {result.projectedIncomeChange ? `+${result.projectedIncomeChange.toFixed(1)}%` : '-'}
                  </p>
                  <span className="text-xs text-muted-foreground">If sales rise {form.getValues('projectedSalesChange') || 10}%</span>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Strategic Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Key Takeaways
                </CardTitle>
                <CardDescription>Understanding your multiplier effect</CardDescription>
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
                  Volatility Risks
                </CardTitle>
                <CardDescription>Downside exposure to sales drops</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.riskFactors.map((factor, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{factor}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Components of Operating Leverage
          </CardTitle>
          <CardDescription>
            The ratio depends heavily on your cost structure mix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <TrendingUp className="h-4 w-4" />
                Contribution Margin
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Also known as "Gross Profit" in some contexts, this is Sales Revenue minus Variable Costs. It is the pool of money available to pay fixed rent and generate profit.
              </p>
              <p className="text-sm font-medium text-blue-600">Numerator in the DOL Formula.</p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Scale className="h-4 w-4" />
                Operating Income (EBIT)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Earnings Before Interest and Taxes. This is the final profit after Fixed Costs are paid.
              </p>
              <p className="text-sm font-medium text-amber-600">Denominator in the DOL Formula.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              DOL = Contribution Margin / Operating Income
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Where Contribution Margin = (Sales - Variable Costs) and Operating Income = (Contribution Margin - Fixed Costs).
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
            Explore other tools for financial structural analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/contribution-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Contribution Margin</p>
                      <p className="text-sm text-muted-foreground">Unit profit analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/break-even-analysis-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
            <Link href="/ebitda-ebit-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">EBITDA Calculator</p>
                      <p className="text-sm text-muted-foreground">Core earnings capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/financial-leverage-effect-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Financial Leverage</p>
                      <p className="text-sm text-muted-foreground">Debt impact analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-teal-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/net-profit-margin-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Net Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Bottom line analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="headline" content="Mastering Operating Leverage: The Profit Multiplier" />
        <meta itemProp="description" content="A detailed guide to the Degree of Operating Leverage (DOL). Understand how fixed and variable costs impact profit volatility and business risk." />
        <meta itemProp="author" content="Corporate Strategy Group" />
        <meta itemProp="datePublished" content="2025-05-30" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Operating Leverage: The Profit Multiplier</h1>
        <p className="text-lg italic text-muted-foreground">Why do some companies double their profits with only a small increase in sales? The answer lies in Operating Leverage. Learn to use this hidden lever to supercharge growth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Operating Leverage?</a></li>
          <li><a href="#calculation" className="hover:underline">Calculating the Degree of Operating Leverage (DOL)</a></li>
          <li><a href="#interpretation" className="hover:underline">High vs. Low Leverage</a></li>
          <li><a href="#risk" className="hover:underline">Risk Implications</a></li>
          <li><a href="#examples" className="hover:underline">Industry Examples</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Operating Leverage?</h2>
        <p>**Operating Leverage** measures how sensitive a company's Operating Income (EBIT) is to changes in Sales Volume. It essentially quantifies the ratio of Fixed Costs to Variable Costs in a business structure.</p>
        <p>A business with high operating leverage has high fixed costs (like a factory or software company) but low variable costs. This means once they break even, every additional sale is almost pure profit.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8">Calculating the Degree of Operating Leverage (DOL)</h2>
        <p>The DOL is a multiplier. If your DOL is 3.0, a 10% increase in sales will result in a 30% increase in Profit.</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">
            DOL = Contribution Margin / Operating Income
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Multiplier Effect</h3>
        <p>This explains why tech stocks often soar on small revenue beats: their high operating leverage amplifies that small revenue gain into a massive earnings surprise.</p>

        <hr className="my-6" />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8">High vs. Low Leverage</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">High Leverage (The Rocket Ship)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Structure:</strong> High Fixed Costs, Low Variable Costs.</li>
          <li><strong>Example:</strong> Software Company. Developing code costs millions (fixed), but selling a copy costs $0.</li>
          <li><strong>Behavior:</strong> Massive profits in good times; massive losses in bad times (because fixed costs must still be paid).</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Low Leverage (The Steady Boat)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Structure:</strong> Low Fixed Costs, High Variable Costs.</li>
          <li><strong>Example:</strong> Retail Store or Consulting Firm. If you sell less, your costs (COGS/Labor) also drop automatically.</li>
          <li><strong>Behavior:</strong> Steady, predictable profits. Low risk of bankruptcy, but harder to scale profits exponentially.</li>
        </ul>

        <hr className="my-6" />

        <h2 id="risk" className="text-2xl font-bold text-foreground pt-8">Risk Implications</h2>
        <p>Operating Leverage is a double-edged sword. While it serves as a profit accelerator during growth phases, it is a risk multiplier during recessions.</p>
        <p>Managers must balance the desire for high leverage (growth) with the need for stability (low leverage). Startups often seek high leverage models to satisfy venture capital growth targets.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common queries about leverage ratios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is high operating leverage good or bad?</h4>
              <p className="text-muted-foreground">
                It is neither inherently good nor bad—it's a risk profile. High leverage is excellent during economic booms because profits grow faster than sales. It is dangerous during recessions because losses mount quickly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does DOL differ from Financial Leverage?</h4>
              <p className="text-muted-foreground">
                Operating Leverage relates to **Fixed Operating Costs** (Rent, Salaries). Financial Leverage relates to **Fixed Financial Costs** (Interest Payments on Debt). Both types of leverage amplify returns to shareholders.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can DOL change over time?</h4>
              <p className="text-muted-foreground">
                Yes. DOL is highest closest to the Break-Even Point. As sales grow far beyond break-even, fixed costs become a smaller percentage of the total pie, and DOL actually decreases, meaning profits become more stable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if DOL is negative?</h4>
              <p className="text-muted-foreground">
                A negative DOL indicates the company is operating at a loss (below break-even). In this range, increasing sales actually reduces the magnitude of the loss, but the standard multiplier interpretation applies differently.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company change its DOL?</h4>
              <p className="text-muted-foreground">
                By outsourcing. If a company replaces a fixed-cost factory with a variable-cost supplier (outsourcing production), it lowers fixed costs and raises variable costs, thus lowering its operating leverage and risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do software companies have high DOL?</h4>
              <p className="text-muted-foreground">
                Because nearly all their costs are upfront R&D (Fixed). The variable cost of distributing a digital file is near zero. This gives them immense scaling power.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does price affecting DOL?</h4>
              <p className="text-muted-foreground">
                Yes. Raising prices (without losing volume) increases the Contribution Margin, which changes the ratio relative to fixed costs, altering the leverage profile.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is there a "Combined" leverage ratio?</h4>
              <p className="text-muted-foreground">
                Yes. **Degree of Total Leverage (DTL)** = DOL × DFL (Degree of Financial Leverage). It measures the total change in Net Income for a change in Sales.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "safest" DOL?</h4>
              <p className="text-muted-foreground">
                A DOL close to 1.0 implies that a 1% drop in sales only causes a 1% drop in profit. This is very safe but implies low scalability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Best practices for applying leverage analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Who Should Use This Tool?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CFOs & Controllers</strong>
                <span className="text-sm text-muted-foreground">To stress-test earnings forecasts against potential sales slumps.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Equity Analysts</strong>
                <span className="text-sm text-muted-foreground">To predict how quarterly revenue surprises will translate into EPS (Earnings Per Share) beats.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Entrepreneurs</strong>
                <span className="text-sm text-muted-foreground">Deciding between "hiring staff" (Fixed Cost) vs. "hiring contractors" (Variable Cost).</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Linear Assumption:</strong> DOL assumes costs are strictly fixed or variable. In reality, "stepped" fixed costs (like needing a new warehouse after X units) complicate the curve.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Point-in-Time:</strong> The DOL calculation is valid only for the specific sales level entered. If sales jump 50%, the DOL changes, so you cannot extrapolate linearly forever.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Zap className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Airline (High Leverage)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Airlines have massive fixed costs (planes, gates, union contracts). A 10% drop in passengers can wipe out 100% of profits, or turn a profit into a huge loss (High DOL). Conversely, if planes are full, every extra ticket is pure profit.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Scenario B: The Freelancer (Low Leverage)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A Web Designer works from home. Fixed costs are near zero (internet). If they lose a client, they just lose that revenue, but they don't have a factory to pay for. Their profit matches their sales almost 1:1 (DOL ≈ 1). Safe, but hard to scale.
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
          <p>The Operating Leverage Calculator helps you quantify the risk-reward ratio of your cost structure.</p>
          <p>By understanding your multiplier (DOL), you can better predict earnings volatility and make informed decisions about investing in fixed assets versus variable expenses.</p>
        </CardContent>
      </Card>
    </div>
  );
}
