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
  Legend
} from 'recharts';
import {
  Heart,
  DollarSign,
  Users,
  Camera,
  Music,
  Car,
  Gift,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  Shield,
  Calculator
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
  totalBudget: z.number().min(1000, 'Budget must be at least 1,000'),
  guestCount: z.number().min(1, 'At least 1 guest required'),
  // Expenses
  venue: z.number().min(0),
  catering: z.number().min(0),
  attire: z.number().min(0),
  photography: z.number().min(0),
  music: z.number().min(0),
  flowers: z.number().min(0),
  decor: z.number().min(0),
  transportation: z.number().min(0),
  stationary: z.number().min(0),
  gifts: z.number().min(0),
  misc: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

// --- Constants & Colors ---
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#ffc0cb'
];

export default function WeddingBudgetCalculator() {
  const [breakdownData, setBreakdownData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalBudget: 30000,
      guestCount: 100,
      venue: 6000,
      catering: 9000,
      attire: 2500,
      photography: 3500,
      music: 1500,
      flowers: 2000,
      decor: 1500,
      transportation: 800,
      stationary: 600,
      gifts: 500,
      misc: 1000,
    },
    mode: 'onChange',
  });

  // Watch values for real-time calculation
  const values = useWatch({ control: form.control });

  // Calculation Logic
  const calculateResults = (vals: FormValues) => {
    const totalExpenses =
      (vals.venue || 0) +
      (vals.catering || 0) +
      (vals.attire || 0) +
      (vals.photography || 0) +
      (vals.music || 0) +
      (vals.flowers || 0) +
      (vals.decor || 0) +
      (vals.transportation || 0) +
      (vals.stationary || 0) +
      (vals.gifts || 0) +
      (vals.misc || 0);

    const remaining = vals.totalBudget - totalExpenses;
    const costPerGuest = vals.guestCount > 0 ? totalExpenses / vals.guestCount : 0;

    // Percentages
    const data = [
      { name: 'Venue', value: vals.venue || 0 },
      { name: 'Catering', value: vals.catering || 0 },
      { name: 'Attire', value: vals.attire || 0 },
      { name: 'Photo/Video', value: vals.photography || 0 },
      { name: 'Music', value: vals.music || 0 },
      { name: 'Flowers', value: vals.flowers || 0 },
      { name: 'Decor', value: vals.decor || 0 },
      { name: 'Transport', value: vals.transportation || 0 },
      { name: 'Stationary', value: vals.stationary || 0 },
      { name: 'Gifts', value: vals.gifts || 0 },
      { name: 'Misc', value: vals.misc || 0 },
    ].filter(item => item.value > 0);

    setBreakdownData(data);

    // Analysis
    const venuePercent = ((vals.venue + vals.catering) / totalExpenses) * 100;
    let mainInsight = "Your budget is balanced.";
    let insightColor = "text-green-600";

    if (remaining < 0) {
      mainInsight = `You are over budget by $${Math.abs(remaining).toFixed(0)}.`;
      insightColor = "text-red-600";
    } else if (venuePercent > 60) {
      mainInsight = "Venue & Catering are consuming a very high portion (>60%) of your budget.";
      insightColor = "text-amber-600";
    }

    setAnalysis({
      totalExpenses,
      remaining,
      costPerGuest,
      mainInsight,
      insightColor,
      venuePercent
    });
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.totalBudget) { // Ensure we have basic data
        // @ts-ignore - types are slightly loose with partial form updates
        calculateResults(value as FormValues);
      }
    });
    // Initial calculate
    calculateResults(form.getValues());

    return () => subscription.unsubscribe();
  }, [form.watch]);


  const CategoryInput = ({ name, label, icon: Icon }: { name: keyof FormValues, label: string, icon: any }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" /> {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              <Input
                type="number"
                className="pl-7"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 md:px-0 pb-12">

      {/* HEADER SECTION */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-600 pb-2">
          Wedding Budget Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Plan every dollar of your dream day. Track expenses, analyze categories, and ensure you start your marriage financially secure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-pink-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Core Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget Goal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                        <Input type="number" className="pl-7 font-bold text-lg" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guestCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Count</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expense Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <CategoryInput name="venue" label="Venue & Rentals" icon={DollarSign} />
              <CategoryInput name="catering" label="Food & Drink" icon={Users} />
              <CategoryInput name="photography" label="Photo & Video" icon={Camera} />
              <CategoryInput name="attire" label="Attire & Beauty" icon={Heart} />
              <CategoryInput name="music" label="Music & Entertainment" icon={Music} />
              <CategoryInput name="flowers" label="Flowers" icon={Heart} />
              <CategoryInput name="decor" label="Decor & Lighting" icon={Heart} />
              <CategoryInput name="transportation" label="Transportation" icon={Car} />
              <CategoryInput name="stationary" label="Stationary" icon={Briefcase} />
              <CategoryInput name="gifts" label="Gifts & Favors" icon={Gift} />
              <CategoryInput name="misc" label="Miscellaneous" icon={AlertTriangle} />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-50 dark:bg-slate-900 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                  ${(analysis?.totalExpenses || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className={`border-none shadow-sm ${analysis?.remaining >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${analysis?.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analysis?.remaining >= 0 ? 'Remaining Budget' : 'Over Budget By'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${analysis?.remaining >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  ${Math.abs(analysis?.remaining || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Cost Per Guest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  ${(analysis?.costPerGuest || 0).toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart & Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Breakdown</CardTitle>
              <CardDescription>Where your money is going</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Loading Chart...
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-lg mb-2">
                  <Info className="h-5 w-5 text-primary" />
                  Budget Analysis
                </h4>
                <p className={`font-medium ${analysis?.insightColor} mb-2`}>
                  {analysis?.mainInsight}
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {analysis?.remaining < 0 && <li>Consider reducing your guest list or finding a cheaper venue to get back on track.</li>}
                  {analysis?.venuePercent > 50 && <li>Typically, reception costs (Venue + Food) should be around 50% of your total budget. You are currently at {analysis?.venuePercent.toFixed(1)}%.</li>}
                  {analysis?.costPerGuest > 500 && <li>Your cost per guest is quite high ($ {analysis?.costPerGuest.toFixed(0)}). This indicates a luxury wedding. Ensure your liquidity matches your aspirations.</li>}
                  <li>Don't forget to budget for service charges and tips (often 20% on top of catering bills).</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- CONTENT SECTIONS --- */}

      {/* Usage Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Who is this tool for?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Newly Engaged Couples</strong>
              <span className="text-sm text-muted-foreground">To set realistic expectations early in the planning process before booking vendors.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Wedding Planners</strong>
              <span className="text-sm text-muted-foreground">To present quick budget scenarios to clients during initial consultations.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Parents Contributing</strong>
              <span className="text-sm text-muted-foreground">To understand the modern costs of weddings and determine how much support to offer.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Venue Coordinators</strong>
              <span className="text-sm text-muted-foreground">To help prospective couples see if they can afford the full package including your venue.</span>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Regional Variance:</strong> A wedding in downtown Manhattan costs 3x more than the same wedding in rural Ohio. This calculator uses numbers, not location data.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Hidden Costs:</strong> Taxes, service charges (often +25%), and gratuities are real budget killers often forgotten in initial estimates.</span>
              </li>
            </ul>
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
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Wedding Budget Calculator helps you gain control over one of the most expensive events of your life.</p>
          <p>By breaking down costs into granular categories and visualizing the data, it exposes potential overspending risks early.</p>
          <p>Use it iteratively—start with estimations, then update it with real vendor quotes to keep your financial health on track as the big day approaches.</p>
        </CardContent>
      </Card>

      {/* COMPLETE GUIDE */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="name" content="The Ultimate Guide to Wedding Budgeting: Plan Without Debt" />
        <meta itemProp="description" content="A comprehensive guide to planning your wedding finances. Breakdowns of venue costs, hidden fees, and strategies to have your dream wedding without the nightmare debt." />
        <meta itemProp="keywords" content="wedding budget calculator, wedding cost breakdown, save money on wedding, average wedding cost 2025, wedding planning guide" />
        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Event Finance Series</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">The Ultimate Guide to Wedding Budgeting: Plan Without Debt</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            They say love is priceless, but the party to celebrate it definitely has a price tag. Here is your master blueprint to navigating the complex, expensive, and emotional world of wedding finance.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#reality" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Reality of Modern Wedding Costs</a></li>
            <li><a href="#breakdown" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The 50/40/10 Allocation Rule</a></li>
            <li><a href="#hidden" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Hidden Costs (The "Plus Plus")</a></li>
            <li><a href="#saving" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> 10 Ways to Slash Your Budget</a></li>
            <li><a href="#funding" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Who Pays for What?</a></li>
          </ul>
        </nav>

        <article id="reality" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Reality of Modern Wedding Costs</h2>
          <p>
            According to recent data from The Knot and other industry leaders, the average cost of a wedding in the United States hovers around <strong>$30,000 to $35,000</strong>. However, this average is heavily skewed by location. A Manhattan wedding averages $80,000+, while a rural backyard wedding might cost $15,000.
          </p>
          <p>
            What shocks most couples is not the big numbers, but the accumulation of small ones. A $10,000 venue sounds high but manageable. But then comes the $5,000 photographer, $4,000 dress, $2,000 flowers, $1,500 DJ... and suddenly you are staring at a bill equal to a luxury car.
          </p>
        </article>

        <hr className="border-border" />

        <article id="breakdown" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The 50/40/10 Allocation Rule</h2>
          <p>
            If you have no idea where to start, use the Golden Ratio of wedding planning:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 not-prose">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200">
              <span className="text-4xl font-black text-blue-600">50%</span>
              <h3 className="font-bold text-lg mt-2">The "Reception"</h3>
              <p className="text-sm text-muted-foreground mt-2">Venue, Food, Alcohol, Rentals, Cake. If you feed them well, they forgive everything else.</p>
            </div>
            <div className="p-6 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200">
              <span className="text-4xl font-black text-pink-600">40%</span>
              <h3 className="font-bold text-lg mt-2">The "Details"</h3>
              <p className="text-sm text-muted-foreground mt-2">Photo/Video (10-12%), Attire (8%), Flowers/Decor (10%), Entertainment (10%).</p>
            </div>
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200">
              <span className="text-4xl font-black text-amber-600">10%</span>
              <h3 className="font-bold text-lg mt-2">The "Oh Sh*t" Fund</h3>
              <p className="text-sm text-muted-foreground mt-2">Buffer for overages, last minute guests, rain tents, and tips.</p>
            </div>
          </div>
        </article>

        <hr className="border-border" />

        <article id="hidden" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Hidden Costs: The "Plus Plus"</h2>
          <p>
            In the wedding industry, you will often hear prices quoted as "$150 per person inclusive." Be careful. More often, you see "++" (Plus Plus).
          </p>
          <p>
            <strong>Example:</strong> A venue quotes $100 per person.
            <br />
            + Service Charge (usually 22% - this is NOT a tip, it's an admin fee).
            <br />
            + Sales Tax (e.g., 8% on the total).
            <br />
            <strong>Real Cost:</strong> $100 + $22 + $9.76 = <strong>$131.76 per person</strong>.
          </p>
          <p>
            That is a 31% increase you didn't plan for. Always ask for the "Out the Door" price.
          </p>
        </article>

        <hr className="border-border" />

        <article id="saving" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">10 Ways to Slash Your Budget</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Trim the Guest List:</strong> The single most effective way to save. 10 fewer guests = 10 fewer meals, 10 fewer chair rentals, 1 less table centerpiece. It saves exponentially.</li>
            <li><strong>Off-Peak Days:</strong> A Saturday night in June is premium pricing. A Friday in November or a Sunday brunch in March can be 30-40% cheaper.</li>
            <li><strong>Digital RSVPs:</strong> Save hundreds on postage and fancy paper by doing digital invites (which are also easier to track).</li>
            <li><strong>BYO Alcohol:</strong> Find a venue that allows you to buy your own booze from Costco or Total Wine. You just pay a bartender to serve it. This is usually 50% cheaper than a venue's "Open Bar Package."</li>
            <li><strong>Repurpose Flowers:</strong> Use the bridesmaid bouquets as centerpieces for the head table. Move the ceremony arch to the reception photo booth area.</li>
          </ul>
        </article>

      </section>

      {/* RELATED CALCULATORS */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            Other calculators to help you plan your life milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Monthly Budget</p>
                      <p className="text-sm text-muted-foreground">Track daily spending</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Safety net planning</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/house-down-payment-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">House Savings</p>
                      <p className="text-sm text-muted-foreground">Next big goal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/credit-card-payoff-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt Payoff</p>
                      <p className="text-sm text-muted-foreground">Clear post-wedding debt</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/savings-goal-timeline-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Goal Timeline</p>
                      <p className="text-sm text-muted-foreground">When can we marry?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/loan-emi-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Personal Loan</p>
                      <p className="text-sm text-muted-foreground">Wedding loan costs</p>
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
            Q&A on Wedding Finance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is the average cost of a wedding?</AccordionTrigger>
              <AccordionContent>
                The national average in the US is around $30,000, but it varies wildly. In major cities like NYC or SF, it is closer to $60,000 - $80,000. In rural areas, it can be $15,000.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Who typically pays for what?</AccordionTrigger>
              <AccordionContent>
                Traditionally, the bride's family paid for the reception and the groom's family paid for the rehearsal dinner. Modern weddings are often split 3 ways: 1/3 couple, 1/3 bride's parents, 1/3 groom's parents. Or, increasingly, the couple pays 100% themselves.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it a good idea to take a wedding loan?</AccordionTrigger>
              <AccordionContent>
                Generally, no. Starting a marriage with consumer debt causes financial stress. It is better to have a smaller, more affordable wedding than a lavish one you pay off for 5 years.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How much should I tip vendors?</AccordionTrigger>
              <AccordionContent>
                Catering staff often get 18-22% (check if included in contract). Photographers/DJs/Planners usually get $50-$200 or 10-15%, especially if they own their own business.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Does the guest count really impact the budget that much?</AccordionTrigger>
              <AccordionContent>
                Yes. It is the #1 cost driver. Each guest adds cost for: Invite, Meal, Drinks, Cake, Chair Rental, Table Centerpiece share, and Favors. Assume each guest costs you $150-$250 minimum.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>What is wedding insurance?</AccordionTrigger>
              <AccordionContent>
                It covers liability (someone trips and sues) and cancellation (vendor bankruptcy or extreme weather). It costs ~$150-$500 and is highly recommended.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>When should I start saving?</AccordionTrigger>
              <AccordionContent>
                As soon as possible. Ideally, you want the cash in the bank before you sign contracts. Most vendors require a 50% deposit upon booking (12 months out) and the rest 30 days before the event.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger>Are DIY weddings actually cheaper?</AccordionTrigger>
              <AccordionContent>
                Usually, yes, but they cost "time." Also, buying craft supplies can add up differently. Sometimes renting decor is cheaper than buying/making it yourself if you count your labor.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-9">
              <AccordionTrigger>What is a "cash bar" vs "open bar"?</AccordionTrigger>
              <AccordionContent>
                Open Bar: Host pays (expensive). Cash Bar: Guests pay (cheap for host, but often considered tacky). A middle ground is "Consumption Bar" (pay for what is opened) or "Beer/Wine Only" (no hard liquor).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-10">
              <AccordionTrigger>Should I feed my vendors?</AccordionTrigger>
              <AccordionContent>
                Yes! It is usually in your contract. Feed your photographer, DJ, and planner. They work 8-12 hours straight. Ask your caterer for "Vendor Meals" (usually cheaper than guest meals).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
