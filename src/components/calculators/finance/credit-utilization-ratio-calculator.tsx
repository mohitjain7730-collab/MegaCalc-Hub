'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  CreditCard,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Shield,
  Calculator,
  ChevronRight,
  Gauge,
  Wallet
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

// --- Zod Schema ---
const formSchema = z.object({
  totalLimit: z.number().min(1, 'Total limit must be greater than 0'),
  totalBalance: z.number().min(0, 'Balance cannot be negative'),
  highestIndividualUtilization: z.number().min(0).max(100).optional().describe('Utilization % of worst card')
});

type FormValues = z.infer<typeof formSchema>;

// Colors for Gauge
const COLORS = ['#10b981', '#fbbf24', '#f87171']; // Green, Yellow, Red

export default function CreditUtilizationRatioCalculator() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalLimit: 10000,
      totalBalance: 2500,
      highestIndividualUtilization: 0
    },
    mode: 'onChange',
  });

  const values = useWatch({ control: form.control });

  const calculateResults = (vals: FormValues) => {
    const { totalLimit, totalBalance } = vals;

    // Safety check
    if (totalLimit <= 0) return;

    const ratio = (totalBalance / totalLimit) * 100;
    const cappedRatio = Math.min(ratio, 100);

    // Prepare chart data (Used vs Available)
    const data = [
      { name: 'Used Credit', value: totalBalance },
      { name: 'Available Credit', value: totalLimit - totalBalance }
    ];
    setUtilizationData(data);

    // Range Logic
    let status = 'Excellent';
    let color = 'text-green-600';
    let zoneColor = '#10b981';
    let scoreImpact = 'Positive Impact';

    if (ratio > 10 && ratio <= 30) {
      status = 'Good';
      color = 'text-emerald-500';
      zoneColor = '#34d399';
      scoreImpact = 'Neutral/Positive';
    } else if (ratio > 30 && ratio <= 50) {
      status = 'Warning';
      color = 'text-yellow-600';
      zoneColor = '#fbbf24';
      scoreImpact = 'Slight Negative';
    } else if (ratio > 50 && ratio <= 75) {
      status = 'High Risk';
      color = 'text-orange-600';
      zoneColor = '#fb923c';
      scoreImpact = 'Negative';
    } else if (ratio > 75) {
      status = 'Critical';
      color = 'text-red-600';
      zoneColor = '#f87171';
      scoreImpact = 'Severe Negative';
    }

    setAnalysis({
      ratio,
      status,
      color,
      zoneColor,
      available: totalLimit - totalBalance,
      scoreImpact
    });
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.totalLimit) calculateResults(value as FormValues);
    });
    calculateResults(form.getValues());
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 md:px-0 pb-12">

      {/* HEADER */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600 pb-2">
          Credit Utilization Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The 30% rule is just the beginning. Calculate your ratio and protect your credit score from accidental damage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-teal-600 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-teal-600" />
                Credit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="totalLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Credit Limit (All Cards)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                    <FormDescription>Sum of limits on all credit cards</FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Total Balance</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                    <FormDescription>Total amount owed right now</FormDescription>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-800 dark:text-blue-300">
            <Info className="h-4 w-4" />
            <AlertTitle>Did you know?</AlertTitle>
            <AlertDescription className="text-xs">
              Utilization has "no memory." If you had 90% utilization last month but pay it to 0% today, your score will rebound almost immediately next billing cycle.
            </AlertDescription>
          </Alert>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="flex flex-col justify-center items-center text-center py-6 border-none shadow-sm bg-slate-50 dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-5xl font-black ${analysis?.color}`}>
                  {(analysis?.ratio || 0).toFixed(1)}%
                </div>
                <Badge variant="outline" className={`mt-2 ${analysis?.color} border-current`}>
                  {analysis?.status}
                </Badge>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-center items-center text-center py-6 border-none shadow-sm bg-slate-50 dark:bg-slate-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Credit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-slate-700 dark:text-slate-200">
                  {fmt(analysis?.available || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Remaining Spending Power</p>
              </CardContent>
            </Card>
          </div>

          {/* CHART */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Usage Visualized</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-[250px] w-full max-w-[400px]">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell key="cell-used" fill={analysis?.zoneColor} />
                        <Cell key="cell-free" fill="#e2e8f0" />
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => fmt(val)} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Loading Chart...
                  </div>
                )}
              </div>

              <div className="w-full space-y-2 mt-4">
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0%</span>
                  <span>30% (Ideal)</span>
                  <span>100%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className="h-full absolute left-0 top-0 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(analysis?.ratio, 100)}%`,
                      backgroundColor: analysis?.zoneColor
                    }}
                  />
                  <div className="absolute top-0 bottom-0 w-0.5 bg-black/20" style={{ left: '30%' }} />
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg border border-border w-full">
                <h4 className="flex items-center gap-2 font-semibold text-lg mb-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Credit Score Impact: {analysis?.scoreImpact}
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {analysis?.ratio < 10 && "Excellent! keeping utilization under 10% gives the maximum possible boost to your score."}
                  {analysis?.ratio >= 10 && analysis?.ratio <= 30 && "Great. You are in the 'Safe Zone'. Lenders employ this range as a standard benchmark for responsibility."}
                  {analysis?.ratio > 30 && "You have crossed the recommended threshold. Pay down balances to see immediate score improvement."}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* USAGE SECTION */}
      <Card className="mb-8 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who needs this tool?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Credit Builders</strong>
              <span className="text-sm text-muted-foreground">Those actively trying to raise their FICO score should obsess over this number. It counts for 30% of your score.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Debt payoff planners</strong>
              <span className="text-sm text-muted-foreground">See how a lump sum payment (e.g., tax refund) will drastically drop your ratio and boost your score.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Credit Utilization Ratio Calculator is your dashboard for Credit Score Optimization.</p>
          <p>By showing you exactly where you stand against the critical 30% threshold, it empowers you to make strategic payments before your statement closes.</p>
        </CardContent>
      </Card>

      {/* COMPLETE GUIDE */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="name" content="Mastering Credit Utilization: The 30% Rule Explained" />
        <meta itemProp="description" content="Credit Utilization is 30% of your FICO score. Learn how to calculate it, the 'AZEO' method, and why paying before your statement date is a cheat code." />
        <meta itemProp="keywords" content="credit utilization calculator, credit score factors, 30 percent rule credit, improve credit score fast" />

        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Credit Mastery Series</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">The 30% Rule: Mastering Credit Utilization</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Payment history is King, but Utilization is Queen. It accounts for nearly one-third of your credit score, yet it is the easiest factor to manipulate in your favor quickly.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#what-is-it" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> What is Credit Utilization?</a></li>
            <li><a href="#zones" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The 3 Zones (Safe, Warning, Danger)</a></li>
            <li><a href="#hacking" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Hacking the Statement Date</a></li>
            <li><a href="#azeo" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The AZEO Method (Advanced)</a></li>
            <li><a href="#mistakes" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Myths & Mistakes</a></li>
          </ul>
        </nav>

        <article id="what-is-it" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">What is Credit Utilization?</h2>
          <p>
            Credit utilization is simply: <strong>Balance / Limit</strong>.
          </p>
          <p>
            If you have a credit card with a $10,000 limit and you have spent $3,000, your utilization is 30%.
          </p>
          <p>
            This metric signals to lenders how "desperate" you are for credit. Someone who maxes out their cards (100% utilization) looks like a high default risk compared to someone who barely touches their limit (5% utilization).
          </p>
        </article>

        <hr className="border-border" />

        <article id="zones" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The 3 Zones of Utilization</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 not-prose">
            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 text-center">
              <span className="text-4xl font-black text-emerald-600">0 - 10%</span>
              <h3 className="font-bold text-lg mt-2">The Elite Zone</h3>
              <p className="text-sm text-muted-foreground mt-2">People with 800+ credit scores typically live here.</p>
            </div>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 text-center">
              <span className="text-4xl font-black text-blue-600">10 - 30%</span>
              <h3 className="font-bold text-lg mt-2">The Safe Zone</h3>
              <p className="text-sm text-muted-foreground mt-2">No negative impact. You are using credit responsibly.</p>
            </div>
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 text-center">
              <span className="text-4xl font-black text-red-600">30%+</span>
              <h3 className="font-bold text-lg mt-2">The Danger Zone</h3>
              <p className="text-sm text-muted-foreground mt-2">Your score starts to drop rapidly with every percentage point higher.</p>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        <article id="hacking" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Hacking the Statement Date</h2>
          <p>
            This is the biggest secret in credit optimization.
          </p>
          <p>
            Credit card issuers verify your balance on your <strong>Statement Closing Date</strong>, NOT your Payment Due Date.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Scenario A:</strong> You spend $5,000 on a $10,000 card. The statement closes on the 1st. You pay it in full on the 15th (Due Date). <strong>Result:</strong> Bureau reports 50% utilization (BAD) because the balance was high when the snapshot was taken on the 1st.</li>
            <li><strong>Scenario B (The Hack):</strong> You spend $5,000. You pay it down to $0 on the 28th (3 days BEFORE statement closes). <strong>Result:</strong> Statement prints showing $0 balance. Utilization reported is 0%. Your score skyrockets.</li>
          </ul>
        </article>

        <hr className="border-border" />

        <article id="azeo" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The AZEO Method (Advanced)</h2>
          <p>
            <strong>All Zero Except One (AZEO)</strong>.
          </p>
          <p>
            FICO algorithms penalize you slightly for having "Too many accounts with balances," even if the balances are small. To get the absolute maximum score (e.g., when applying for a mortgage), pay ALL cards to $0 before their statement dates, except for ONE card, on which you leave a tiny balance (like $10).
          </p>
          <p>
            This proves you are using credit (not inactive) but effectively have zero risks.
          </p>
        </article>

      </section>

      {/* RELATED TOOLS */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            Calculators to help you manage debt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/credit-card-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt Payoff</p>
                      <p className="text-sm text-muted-foreground">Kill high interest debt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dscr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">DTI Ratio</p>
                      <p className="text-sm text-muted-foreground">Debt-to-Income check</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Credit Scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is 0% Utilization better than 1%?</AccordionTrigger>
              <AccordionContent>
                Actually, no. If ALL your cards report $0, it looks like you aren't using credit at all. FICO likes to see activity. Ideally, having 1% utilization is slightly better than 0%.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Does requesting a higher limit hurt my score?</AccordionTrigger>
              <AccordionContent>
                Sometimes. It might result in a "Hard Inquiry" (dropping score 3-5 points). But the higher limit lowers your utilization percent permanently, usually raising your score much more than the inquiry lowered it.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Does being an Authorized User help?</AccordionTrigger>
              <AccordionContent>
                Yes! If your parent adds you to their 20-year-old card with a $20k limit and $0 balance, that history and limit get added to YOUR report, instantly lowering your utilization and increasing your average age of accounts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Should I close old cards I don't use?</AccordionTrigger>
              <AccordionContent>
                <strong>NO.</strong> Closing a card removes its credit limit from your total, which spikes your utilization. It also shortens your credit history length. Keep them open and buy a pack of gum once a year to keep them active.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
