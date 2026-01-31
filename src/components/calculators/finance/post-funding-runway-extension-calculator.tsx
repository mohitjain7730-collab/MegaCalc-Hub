'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Wallet, TrendingUp, Target, Calendar, Zap, Info, FunctionSquare, Calculator, DollarSign, CheckCircle2, AlertCircle, Users, Briefcase, AlertTriangle, Landmark, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentCash: z.number({ invalid_type_error: 'Enter current cash' }).min(0),
  monthlyBurnUntilClose: z.number({ invalid_type_error: 'Enter monthly burn' }).min(0),
  monthsUntilClose: z.number({ invalid_type_error: 'Enter months' }).min(0).max(60),
  newFundingAtClose: z.number({ invalid_type_error: 'Enter funding amount' }).min(0),
  monthlyBurnAfterClose: z.number({ invalid_type_error: 'Enter monthly burn' }).min(0).optional(),
}).refine(
  (data) => data.monthlyBurnUntilClose > 0,
  { message: 'Monthly burn until close must be greater than 0 for runway.', path: ['monthlyBurnUntilClose'] }
);

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  runwayTodayMonths: number;
  cashAtClose: number;
  runwayAfterFundingMonths: number;
  extensionMonths: number;
  zeroCashDateBefore: string;
  zeroCashDateAfter: string;
  burnAfterClose: number;
  status: 'critical' | 'tight' | 'healthy' | 'strong';
  interpretation: string;
  recommendation: string;
  recommendations: string[];
  insights: string[];
  considerations: string[];
};

const steps = [
  'Enter current cash balance (today).',
  'Enter monthly burn rate until funding closes.',
  'Enter months until you expect to close the round.',
  'Enter new funding amount at close.',
  'Optionally enter planned monthly burn after close (e.g. if you will hire).',
  'See runway today, cash at close, and extended runway after funding.',
];

const faqs = [
  {
    question: 'What is post-funding runway?',
    answer: 'Post-funding runway is how many months your startup can operate after the round closes, using cash at close plus the new capital, at your planned post-close burn rate.',
  },
  {
    question: 'Why model burn until close separately?',
    answer: 'Cash at close = current cash minus (monthly burn × months until close). If you burn more or close later, you have less cash when the new money lands; this calculator reflects that.',
  },
  {
    question: 'Should I increase burn after the round?',
    answer: 'Many startups increase burn post-raise (hiring, marketing). Enter a higher monthly burn after close to see realistic extended runway; otherwise we use the same burn as before close.',
  },
  {
    question: 'What is a good extended runway target?',
    answer: '18–24 months post-close is common so you have time to hit milestones before the next raise. Less than 12 months leaves little buffer for a slow fundraise.',
  },
  {
    question: 'How does this differ from the generic Runway Extension Calculator?',
    answer: 'This one is specific to a single funding event: it models cash at close (burn until close, timing), then adds new capital and optional post-raise burn to get post-funding runway and extension in months.',
  },
];

const relatedCalculators = [
  { name: 'Runway Extension Calculator', slug: 'runway-extension-calculator', description: 'Generic runway and savings impact.' },
  { name: 'Founder Dilution After Funding Calculator', slug: 'founder-dilution-after-funding-calculator', description: 'See dilution from the same round.' },
  { name: 'Startup Runway Calculator', slug: 'startup-runway-calculator', description: 'Runway from cash and burn only.' },
  { name: 'Pre-Revenue Startup Runway Calculator', slug: 'pre-revenue-startup-runway-calculator', description: 'Runway with detailed expense breakdown.' },
];

const baseUrl = 'https://mycalculating.com/category/finance/post-funding-runway-extension-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Post-Funding Runway Extension Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Post-Funding Runway Extension Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate runway after closing a round: cash at close, extended runway from new capital, and optional post-raise burn.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function formatZeroCashDate(monthsFromToday: number): string {
  if (!Number.isFinite(monthsFromToday) || monthsFromToday < 0) return 'N/A';
  const d = new Date();
  d.setMonth(d.getMonth() + Math.floor(monthsFromToday));
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const calculateResult = (values: FormValues): ResultPayload => {
  const cash = values.currentCash;
  const burnUntil = values.monthlyBurnUntilClose;
  const monthsToClose = values.monthsUntilClose;
  const newFunding = values.newFundingAtClose;
  const burnAfter = (values.monthlyBurnAfterClose !== undefined && values.monthlyBurnAfterClose > 0) ? values.monthlyBurnAfterClose : burnUntil;

  const cashAtClose = Math.max(0, cash - burnUntil * monthsToClose);
  const runwayTodayMonths = burnUntil > 0 ? cash / burnUntil : Infinity;
  const totalCashAfterClose = cashAtClose + newFunding;
  const runwayAfterFundingMonths = burnAfter > 0 ? totalCashAfterClose / burnAfter : Infinity;
  const runwayTodayCap = Number.isFinite(runwayTodayMonths) ? runwayTodayMonths : 999;
  const extensionMonths = Number.isFinite(runwayAfterFundingMonths)
    ? Math.max(0, runwayAfterFundingMonths - runwayTodayCap)
    : 0;

  const zeroCashDateBefore = formatZeroCashDate(runwayTodayMonths);
  const zeroCashDateAfter = formatZeroCashDate(monthsToClose + (Number.isFinite(runwayAfterFundingMonths) ? runwayAfterFundingMonths : 0));

  let status: ResultPayload['status'] = 'healthy';
  let interpretation = 'Post-funding runway is solid. Plan milestones and next raise timeline.';

  const monthsExtended = Number.isFinite(runwayAfterFundingMonths) ? runwayAfterFundingMonths : 0;
  if (monthsExtended < 9) {
    status = 'critical';
    interpretation = 'Post-funding runway is very short. Consider raising more, reducing post-close burn, or extending time to close.';
  } else if (monthsExtended < 14) {
    status = 'tight';
    interpretation = 'Post-funding runway is tight. Prioritize milestones and start next fundraise early.';
  } else if (monthsExtended >= 24) {
    status = 'strong';
    interpretation = 'Strong post-funding runway. Use it to hit milestones and raise from a position of strength.';
  }

  let recommendation = 'Track burn monthly and plan next raise before runway shortens.';
  if (status === 'critical') recommendation = 'Urgent: raise more, cut burn, or extend time to close.';
  else if (status === 'tight') recommendation = 'Prioritize milestones and start next fundraise early.';
  else if (status === 'strong') recommendation = 'Use runway to hit milestones and raise from strength.';

  const recommendations: string[] = [
    `Runway today: ${Number.isFinite(runwayTodayMonths) ? runwayTodayMonths.toFixed(1) : '∞'} months. Cash at close (before new $): $${cashAtClose.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
    `After $${newFunding.toLocaleString(undefined, { maximumFractionDigits: 0 })} at close, runway = ${Number.isFinite(runwayAfterFundingMonths) ? runwayAfterFundingMonths.toFixed(1) : '∞'} months at $${burnAfter.toLocaleString()}/mo burn. Extension: ${extensionMonths.toFixed(1)} months.`,
    burnAfter > burnUntil
      ? `Post-close burn ($${burnAfter.toLocaleString()}/mo) is higher than until-close ($${burnUntil.toLocaleString()}/mo); this shortens extended runway.`
      : 'Model a higher post-close burn if you plan to hire or spend more after the round.',
  ];

  const insights: string[] = [];
  if (status === 'strong') {
    insights.push('Strong post-funding runway gives time to hit milestones');
    insights.push('Lower risk of running out of cash before next raise');
    insights.push('Good position to negotiate from strength');
  } else if (status === 'healthy') {
    insights.push('Post-funding runway is adequate for planning');
    insights.push('Monitor burn and start next fundraise in time');
    insights.push('Consider cost discipline to extend runway');
  } else if (status === 'tight') {
    insights.push('Runway is tight; prioritize key milestones');
    insights.push('Start next fundraise early');
    insights.push('Model cost cuts to extend runway if needed');
  } else {
    insights.push('Runway is critical; immediate action needed');
    insights.push('Consider raising more or cutting burn');
    insights.push('Extending time to close reduces cash at close');
  }

  const considerations: string[] = [
    'Assumes constant burn; actual burn can vary month to month.',
    'Funding close timing is uncertain; model a range of months to close.',
    'Post-close burn often increases (hiring); enter it to see realistic runway.',
    'Compare extended runway to your milestone plan and next raise timeline.',
  ];

  return {
    runwayTodayMonths,
    cashAtClose,
    runwayAfterFundingMonths,
    extensionMonths,
    zeroCashDateBefore,
    zeroCashDateAfter,
    burnAfterClose: burnAfter,
    status,
    interpretation,
    recommendation,
    recommendations,
    insights,
    considerations,
  };
};

export default function PostFundingRunwayExtensionCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentCash: undefined,
      monthlyBurnUntilClose: undefined,
      monthsUntilClose: undefined,
      newFundingAtClose: undefined,
      monthlyBurnAfterClose: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="post-funding-runway-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Post-Funding Runway Extension Calculator
          </CardTitle>
          <CardDescription>
            After you close a round: see cash at close, extended runway from new capital, and optional post-raise burn. Startup-specific.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funding and burn assumptions</CardTitle>
          <CardDescription>Current cash, burn until close, timing, new capital, and optional post-close burn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current cash today ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyBurnUntilClose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly burn until close ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 80000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthsUntilClose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months until funding closes</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" min={0} placeholder="e.g. 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newFundingAtClose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New funding at close ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyBurnAfterClose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly burn after close ($) — optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="Same as above if blank" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Post-Funding Runway
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
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Post-Funding Runway</CardTitle>
                  <CardDescription>Runway today, cash at close, and extended runway after funding</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {Number.isFinite(result.runwayAfterFundingMonths) ? `${result.runwayAfterFundingMonths.toFixed(1)} mo` : '∞'}
                </p>
                <p className="text-lg text-muted-foreground mt-2">runway after funding</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Runway today</p>
                  <p className="text-xl font-bold text-primary">
                    {Number.isFinite(result.runwayTodayMonths) ? `${result.runwayTodayMonths.toFixed(1)} mo` : '∞'}
                  </p>
                  <p className="text-xs text-muted-foreground">Zero cash: {result.zeroCashDateBefore}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'strong' ? 'default' : result.status === 'healthy' ? 'secondary' : result.status === 'tight' ? 'outline' : 'destructive'}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Extension</p>
                  <p className="text-xl font-bold text-primary">+{result.extensionMonths.toFixed(1)} mo</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Runway and planning opportunities</CardDescription>
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
                  Risk & Considerations
                </CardTitle>
                <CardDescription>Factors to monitor</CardDescription>
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

      {/* Understanding the Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>Key components for post-funding runway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Cash & Burn
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Current cash (today) and monthly burn until close. Cash at close = current cash − (burn × months until close).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Current cash today ($)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Monthly burn until close ($)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Months until funding closes</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Wallet className="h-4 w-4" />
                Funding & Post-Close Burn
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                New funding at close and optional monthly burn after close (e.g. if you hire). If blank, post-close burn = until-close burn.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>New funding at close ($)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Monthly burn after close ($) — optional</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Cash at close = Current cash − (Monthly burn until close × Months until close)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Runway after funding = (Cash at close + New funding at close) ÷ Monthly burn after close
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Runway today = Current cash ÷ Monthly burn until close. Extension = Runway after funding − Runway today (conceptually; we report extension from new capital).
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
          <CardDescription>Explore other runway and startup finance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedCalculators.map((calc) => (
              <Link key={calc.slug} href={`/category/finance/${calc.slug}`} className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{calc.name}</p>
                        <p className="text-sm text-muted-foreground">{calc.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="Post-Funding Runway Extension: Cash at Close and Extended Runway" />
        <meta itemProp="description" content="Expert guide to post-funding runway: cash at close, extended runway from new capital, and optional post-raise burn for startups." />
        <meta itemProp="keywords" content="post-funding runway, cash at close, runway extension, startup runway, burn rate, funding round" />
        <meta itemProp="url" content="/category/finance/post-funding-runway-extension-calculator" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Post-Funding Runway Extension: Plan Runway After Your Round</h1>
        <p className="text-lg italic text-muted-foreground">After you close a round, see how much runway you get: cash at close (burn until close), new capital, and optional post-raise burn.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#pf-definition" className="hover:underline">What Is Post-Funding Runway?</a></li>
          <li><a href="#pf-formula" className="hover:underline">Formulas and Components</a></li>
          <li><a href="#pf-interpretation" className="hover:underline">Interpreting Results</a></li>
          <li><a href="#pf-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />
        <h2 id="pf-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Is Post-Funding Runway?</h2>
        <p>Post-funding runway is how many months your startup can operate after the round closes, using cash at close plus the new capital, at your planned post-close burn rate. This calculator models a single funding event: current cash, burn until close, timing to close, new capital, and optional higher burn after close.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why Cash at Close Matters</h3>
        <p>Cash at close = current cash − (monthly burn until close × months until close). If you burn more or close later, you have less cash when the new money lands; the calculator reflects that so you see realistic extended runway.</p>
        <hr />
        <h2 id="pf-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Formulas and Components</h2>
        <p>Runway today = Current cash ÷ Monthly burn until close. Runway after funding = (Cash at close + New funding at close) ÷ Monthly burn after close. Extension is the additional months from the new capital (and optional change in burn).</p>
        <hr />
        <h2 id="pf-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
        <p>Target 18–24 months post-close so you have time to hit milestones before the next raise. Less than 12 months leaves little buffer. If post-close burn is higher (e.g. hiring), enter it to see realistic runway.</p>
        <hr />
        <h2 id="pf-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Use this calculator to plan runway after a single funding event: cash at close, extended runway from new capital, and optional post-raise burn. Pair with a founder dilution calculator to see both runway and ownership impact of the round.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Common questions about post-funding runway</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h4 className="font-semibold text-lg mb-3">{faq.question}</h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>Practical applications and context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Founders & CFOs</strong>
                <span className="text-sm text-muted-foreground">To plan runway after a round: cash at close and extended runway with optional post-raise burn.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors</strong>
                <span className="text-sm text-muted-foreground">To stress-test runway and burn assumptions before or after a term sheet.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Constant burn:</strong> Assumes flat burn until close and (optionally) after close; actual burn can vary.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Close timing:</strong> Months until close is uncertain; model a range to see sensitivity.</span>
              </li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Example
            </h4>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
              <p className="text-sm text-muted-foreground">
                $500K cash, $80K/mo burn, close in 3 months, $2M new funding, same burn after close. Cash at close = $260K. Runway after funding = ($260K + $2M) / $80K ≈ 28 months. Extension from new capital is substantial; if post-close burn rises to $120K/mo, runway drops to about 19 months.
              </p>
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
          <p>The Post-Funding Runway Extension Calculator shows runway today, cash at close (before new money), and extended runway after a single funding event.</p>
          <p>Enter current cash, burn until close, months to close, new funding at close, and optional post-close burn to see realistic post-funding runway and extension.</p>
        </CardContent>
      </Card>
    </div>
  );
}
