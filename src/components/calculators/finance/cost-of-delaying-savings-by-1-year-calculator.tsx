'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info, Calculator, DollarSign, BarChart3, Target, CheckCircle2, Users, Briefcase, AlertTriangle, FunctionSquare, Landmark, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  monthlySavings: z.number().min(1, 'Enter monthly savings amount'),
  annualReturnPct: z.number().min(0).max(100, 'Enter 0–100'),
  yearsUntilTarget: z.number().min(2, 'At least 2 years (delay = 1 year)'),
});

type FormValues = z.infer<typeof formSchema>;

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Cost of Delaying Savings by 1 Year Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      description: 'See how much less you end up with if you delay starting to save by one year. Compares future value starting now vs starting in 1 year.',
      url: 'https://mycalculating.com/category/finance/cost-of-delaying-savings-by-1-year-calculator',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function CostOfDelayingSavingsBy1YearCalculator() {
  const [result, setResult] = useState<{
    fvStartNow: number;
    fvStartIn1Year: number;
    costOfDelay: number;
    percentLess: number;
    recommendation: string;
    insights: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlySavings: undefined,
      annualReturnPct: 7,
      yearsUntilTarget: undefined,
    },
  });

  const fvAnnuity = (pmt: number, annualRatePct: number, years: number) => {
    const r = annualRatePct / 100 / 12;
    const n = years * 12;
    if (Math.abs(r) < 1e-9) return pmt * n;
    return pmt * ((Math.pow(1 + r, n) - 1) / r);
  };

  const calculate = (v: FormValues) => {
    const pmt = v.monthlySavings ?? 0;
    const rate = v.annualReturnPct ?? 0;
    const years = Math.max(2, Math.floor(v.yearsUntilTarget ?? 2));
    if (pmt <= 0 || years < 2) return null;

    const fvStartNow = fvAnnuity(pmt, rate, years);
    const fvStartIn1Year = fvAnnuity(pmt, rate, years - 1);
    const costOfDelay = fvStartNow - fvStartIn1Year;
    const percentLess = fvStartNow > 0 ? (costOfDelay / fvStartNow) * 100 : 0;

    let recommendation = '';
    if (costOfDelay > 0) {
      recommendation = `Delaying by 1 year costs you $${costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} at your target date (${percentLess.toFixed(1)}% less). Start saving now, even a small amount.`;
    } else {
      recommendation = 'Starting now vs in 1 year shows little difference at this horizon; still, starting now builds the habit and locks in one extra year of growth.';
    }

    const insights: string[] = [];
    insights.push(`If you start now: ~$${fvStartNow.toLocaleString(undefined, { maximumFractionDigits: 0 })} at the end of ${years} years.`);
    insights.push(`If you start in 1 year: ~$${fvStartIn1Year.toLocaleString(undefined, { maximumFractionDigits: 0 })} at the same target date (${years - 1} years of contributions).`);
    insights.push(`Cost of delaying 1 year: $${costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${percentLess.toFixed(1)}% less).`);
    if (rate > 0) {
      insights.push('Higher return rates make the cost of delay larger because you lose more compound growth on the first year\'s contributions.');
    }

    return {
      fvStartNow,
      fvStartIn1Year,
      costOfDelay,
      percentLess,
      recommendation,
      insights,
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      <Script id="cost-of-delaying-savings-1yr-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cost of Delaying Savings by 1 Year
          </CardTitle>
          <CardDescription>
            Enter your planned monthly savings, expected annual return, and years until your target date. The calculator shows how much less you end up with if you delay starting by exactly one year.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="monthlySavings" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Savings ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="annualReturnPct" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Annual Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={100} step={0.5} placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) ?? 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsUntilTarget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Until Target Date</FormLabel>
                    <FormControl>
                      <Input type="number" min={2} placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Cost of 1-Year Delay
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Result</CardTitle>
                  <CardDescription>Start now vs start in 1 year</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  Cost of 1-year delay: ${result.costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({result.percentLess.toFixed(1)}% less)
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">{result.recommendation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">If You Start Now</p>
                  <p className="text-lg font-bold">${result.fvStartNow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">If You Start in 1 Year</p>
                  <p className="text-lg font-bold">${result.fvStartIn1Year.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Cost of Delay</p>
                  <p className="text-lg font-bold">${result.costOfDelay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
              {result.insights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">Insights</h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Cost of a 1-Year Delay
          </CardTitle>
          <CardDescription>Why starting one year later reduces your future balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">Start now</h4>
              <p className="text-sm text-muted-foreground mb-3">You make 12 more monthly contributions and each of those (and all later ones) compounds for one extra year. The difference is the &quot;cost of delay.&quot;</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">Start in 1 year</h4>
              <p className="text-sm text-muted-foreground mb-3">You contribute for one fewer year to the same target date. You lose both the contributions from year one and all the growth they would have earned.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
            <p className="font-mono text-sm text-center">Future Value (annuity) = PMT × [((1 + r)^n − 1) / r]</p>
            <p className="font-mono text-sm text-center">r = annual return / 12, n = number of months</p>
            <p className="font-mono text-sm text-center">Cost of 1-year delay = FV(start now) − FV(start in 1 year)</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Savings and time-value tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/cost-of-delay-investing-late-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Cost of Delay (Investing Late)</p>
                      <p className="text-sm text-muted-foreground">Variable delay in years</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/side-income-impact-on-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Side Income Impact on Savings</p>
                      <p className="text-sm text-muted-foreground">How side income boosts savings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/compound-interest-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Compound Interest</p>
                      <p className="text-sm text-muted-foreground">Growth over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="Cost of Delaying Savings by 1 Year: How Much You Lose" />
        <meta itemProp="description" content="See how much less you end up with if you delay starting to save by one year. Compares future value starting now vs starting in 1 year." />
        <meta itemProp="keywords" content="cost of delaying savings, 1 year delay, start saving now, compound interest, future value" />
        <meta itemProp="author" content="MegaCalc Financial Team" />
        <meta itemProp="datePublished" content="2025-10-25" />
        <meta itemProp="url" content="/finance/cost-of-delaying-savings-by-1-year-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Cost of Delaying Savings by 1 Year: How Much You Lose</h1>
        <p className="text-lg italic text-muted-foreground">Delaying the start of savings by just one year reduces your future balance because you make fewer contributions and lose a year of compound growth. This calculator shows the dollar and percentage cost of a 1-year delay.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-delay-cost" className="hover:underline">What Is the Cost of a 1-Year Delay?</a></li>
          <li><a href="#how-calculated-delay" className="hover:underline">How It Is Calculated</a></li>
          <li><a href="#why-it-matters-delay" className="hover:underline">Why It Matters</a></li>
          <li><a href="#applications-delay" className="hover:underline">Using This Calculator</a></li>
          <li><a href="#conclusion-delay" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />

        <h2 id="what-is-delay-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is the Cost of a 1-Year Delay?</h2>
        <p>The cost of delaying savings by 1 year is the difference between the future value of your savings if you start today and the future value if you start one year from today, assuming the same monthly amount and target date.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Start Now vs Start in 1 Year</h3>
        <p>If you start now, you make 12 more monthly contributions and each contribution has one more year to compound. If you start in 1 year, you contribute for one fewer year toward the same target date, so your ending balance is lower.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why One Year Matters</h3>
        <p>Even one year of delay means losing 12 contributions plus all the growth those contributions would have earned over the remaining years. At higher return rates, the cost of delay is larger.</p>
        <hr />

        <h2 id="how-calculated-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How It Is Calculated</h2>
        <p>We use the future value of an ordinary annuity: FV = PMT × [((1 + r)^n − 1) / r], where PMT is monthly savings, r is the monthly interest rate (annual rate / 12), and n is the number of months. &quot;Start now&quot; uses n = years × 12; &quot;start in 1 year&quot; uses n = (years − 1) × 12 for the same target date.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Cost of 1-year delay = FV(start now) − FV(start in 1 year)</p>
        </div>
        <hr />

        <h2 id="why-it-matters-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why It Matters</h2>
        <p>Seeing the dollar cost of a 1-year delay can motivate you to start saving today, even with a small amount. The habit and the extra year of growth compound over decades.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Behavioral Nudge</h3>
        <p>Many people postpone saving until &quot;the right time.&quot; This calculator shows that the right time is now; delaying by even one year has a measurable, often large, cost.</p>
        <hr />

        <h2 id="applications-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using This Calculator</h2>
        <p>Enter your planned monthly savings, expected annual return (e.g. 7%), and years until your target date (e.g. retirement). The calculator shows future value if you start now, future value if you start in 1 year, and the cost of that 1-year delay in dollars and percent.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">What to Enter</h3>
        <p>Use a realistic long-term return (e.g. 6–8% for a diversified portfolio). Years until target should be at least 2 so that &quot;start in 1 year&quot; still has at least one year of contributions.</p>
        <hr />

        <h2 id="conclusion-delay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Delaying savings by one year reduces your future balance by a meaningful amount. Use this calculator to see the cost, then start saving now—even a small monthly amount—to capture that extra year of contributions and growth.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about the cost of delaying savings by 1 year</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is the cost of delaying savings by 1 year?</h4>
            <p className="text-muted-foreground">It is the difference between how much you would have at your target date if you start saving today versus if you start one year from today. You lose 12 months of contributions plus all the compound growth those contributions would have earned.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why does a 1-year delay matter so much?</h4>
            <p className="text-muted-foreground">Because of compound growth. The money you invest in year one grows for the full period; money you invest in year two grows for one fewer year. Over long horizons (e.g. 30 years), that first year&apos;s contributions and their growth represent a large share of the total.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How is the future value calculated?</h4>
            <p className="text-muted-foreground">We use the future value of an ordinary annuity: FV = PMT × [((1 + r)^n − 1) / r], where PMT is monthly savings, r is the monthly interest rate (annual return / 12), and n is the number of months. &quot;Start now&quot; uses the full number of months; &quot;start in 1 year&quot; uses 12 fewer months.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What return rate should I use?</h4>
            <p className="text-muted-foreground">Use a long-term expected return for your asset mix (e.g. 6–8% for a diversified stock portfolio, before inflation). Higher assumed returns make the cost of delay larger because you lose more growth.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this account for inflation?</h4>
            <p className="text-muted-foreground">The calculator uses nominal (before-inflation) returns. If you use a real (inflation-adjusted) return, the future values are in today&apos;s dollars. Either way, the percentage cost of a 1-year delay is similar.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if I can only save a small amount now?</h4>
            <p className="text-muted-foreground">Start anyway. A small amount now beats zero for a year. You can increase contributions later; the key is to lock in the first year of growth and build the habit.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How does this differ from the general &quot;cost of delay&quot; calculator?</h4>
            <p className="text-muted-foreground">This calculator fixes the delay at exactly 1 year so you can see the impact of &quot;waiting one more year&quot; in a simple, memorable way. The other calculator lets you enter any delay in years (e.g. 5 or 10) and shows catch-up costs.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if my target is less than 2 years away?</h4>
            <p className="text-muted-foreground">The calculator requires at least 2 years until target so that &quot;start in 1 year&quot; still has at least one full year of contributions. For very short horizons, the cost of a 1-year delay is a large share of the total; start now.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Why is the cost of delay larger at higher returns?</h4>
            <p className="text-muted-foreground">Because the money you don&apos;t invest in year one would have grown at that rate for the entire period. The higher the return, the more valuable that first year&apos;s contributions and the bigger the gap between &quot;start now&quot; and &quot;start in 1 year.&quot;</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Should I use this for retirement only?</h4>
            <p className="text-muted-foreground">No. Use it for any savings goal with a target date (retirement, down payment, college, etc.). The same math applies: delaying by 1 year means fewer contributions and less compound growth by the target date.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">People Who Haven&apos;t Started Saving</strong>
                <span className="text-sm text-muted-foreground">To see the cost of waiting one more year and to motivate starting today, even with a small amount.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Retirement Savers</strong>
                <span className="text-sm text-muted-foreground">To quantify how much a 1-year delay in starting (or increasing) retirement contributions costs at your target date.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Financial Educators & Advisors</strong>
                <span className="text-sm text-muted-foreground">To show clients the impact of procrastination in a simple, memorable way (fixed 1-year delay).</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Young Adults & New Earners</strong>
                <span className="text-sm text-muted-foreground">To understand why starting early matters and how much the &quot;I&apos;ll start next year&quot; mindset costs.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant contributions:</strong> Assumes the same monthly amount for the full period. In reality, many people increase contributions over time.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant return:</strong> Uses a single annual return. Real returns vary year to year; the cost of delay in dollar terms will vary with actual performance.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Fixed 1-year delay:</strong> This tool only shows the cost of delaying by exactly 1 year. For other delay lengths, use the Cost of Delay (Investing Late) calculator.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example: $500/month, 7% return, 30 years</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">Start now: ~$566,000. Start in 1 year: ~$527,000. Cost of 1-year delay: ~$39,000 (about 7% less). That’s much more than the $6,000 you &quot;saved&quot; by not contributing in year one.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example: $200/month, 6% return, 20 years</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">Start now: ~$92,000. Start in 1 year: ~$86,000. Cost of 1-year delay: ~$6,000 (about 6.5% less). Even modest savings show a meaningful cost to delaying.</p>
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
          <CardDescription>Quick recap</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This calculator shows how much less you end up with at a target date if you delay starting to save by exactly one year. You enter monthly savings, expected annual return, and years until target. It compares future value &quot;start now&quot; vs &quot;start in 1 year&quot; and reports the cost of delay in dollars and percent. Use it to motivate starting (or increasing) savings today.</p>
        </CardContent>
      </Card>
    </div>
  );
}
