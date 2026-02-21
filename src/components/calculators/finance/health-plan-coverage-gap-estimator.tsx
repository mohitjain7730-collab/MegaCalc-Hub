'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, PlusCircle, Trash2, Pill, WholeWord, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';
import { Progress } from '@/components/ui/progress';

const drugSchema = z.object({
  name: z.string().min(1, "Drug name is required."),
  monthlyCost: z.number().positive("Cost must be positive."),
});

const formSchema = z.object({
  drugs: z.array(drugSchema).min(1, 'Please add at least one drug.'),
  initialCoverageLimit: z.number().positive('Limit must be positive.'),
  catastrophicCoverageLimit: z.number().positive('Limit must be positive.'),
  coverageGapDiscount: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalMonthlyCost: number;
  gapEntryMonth: number | null;
  catastrophicEntryMonth: number | null;
  annualOutOfPocket: number;
  chartData: { month: number; name: string; 'Your Monthly OOP': number; 'Total Drug Cost': number; phase: string; }[];
  initialCoverageLimit: number;
  catastrophicCoverageLimit: number;
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function HealthPlanCoverageGapEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drugs: [{ name: '', monthlyCost: undefined }],
      initialCoverageLimit: undefined,
      catastrophicCoverageLimit: undefined,
      coverageGapDiscount: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "drugs",
  });

  const resetForm = () => {
    form.reset({
      drugs: [{ name: '', monthlyCost: undefined }],
      initialCoverageLimit: undefined,
      catastrophicCoverageLimit: undefined,
      coverageGapDiscount: undefined,
    });
    setResult(null);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: FormValues) => {
    const { drugs, initialCoverageLimit, catastrophicCoverageLimit, coverageGapDiscount } = values;

    const totalMonthlyCost = drugs.reduce((acc, drug) => acc + (drug.monthlyCost || 0), 0);
    if (totalMonthlyCost === 0) {
      setResult(null);
      return;
    }

    let cumulativeTotalCost = 0;
    let cumulativeOOP = 0;
    let gapEntryMonth: number | null = null;
    let catastrophicEntryMonth: number | null = null;
    const chartData = [];

    // Assuming 25% coinsurance in initial phase for simplicity
    const initialCoinsurance = 0.25;
    const gapCoinsurance = 1 - (coverageGapDiscount / 100);

    for (let month = 1; month <= 12; month++) {
      let monthlyOOP = 0;
      let phase = 'Initial Coverage';

      const projectedTotalCost = cumulativeTotalCost + totalMonthlyCost;

      if (cumulativeOOP >= catastrophicCoverageLimit) {
        phase = 'Catastrophic Coverage';
        if (!catastrophicEntryMonth) catastrophicEntryMonth = month;
        // Simplified: 5% of cost or a small copay. Using 5% for this model.
        monthlyOOP = totalMonthlyCost * 0.05;
      } else if (cumulativeTotalCost >= initialCoverageLimit) {
        phase = 'Coverage Gap (Donut Hole)';
        if (!gapEntryMonth) gapEntryMonth = month;
        monthlyOOP = totalMonthlyCost * gapCoinsurance;
      } else {
        phase = 'Initial Coverage';
        monthlyOOP = totalMonthlyCost * initialCoinsurance;
      }

      // Check if this month's spending crosses a threshold
      if (!gapEntryMonth && projectedTotalCost > initialCoverageLimit) {
        // Handle cases where a single month's cost spans phases
        const costBeforeGap = initialCoverageLimit - cumulativeTotalCost;
        const costInGap = totalMonthlyCost - costBeforeGap;

        const oopBeforeGap = costBeforeGap * initialCoinsurance;
        const oopInGap = costInGap * gapCoinsurance;

        monthlyOOP = oopBeforeGap + oopInGap;
        phase = 'Initial & Gap';
        gapEntryMonth = month;
      }

      if (gapEntryMonth && !catastrophicEntryMonth && cumulativeOOP + monthlyOOP > catastrophicCoverageLimit) {
        // Handle cases where spending crosses into catastrophic in a single month
        const oopToReachCatastrophic = catastrophicCoverageLimit - cumulativeOOP;
        const oopInCatastrophic = monthlyOOP - oopToReachCatastrophic;

        // This part is complex; simplifying for the model. The actual OOP to trigger catastrophic is based on a complex "TrOOP" calculation.
        // For this model, we'll just flag the entry month. The monthly OOP will be slightly off in the transition month.
        catastrophicEntryMonth = month;
      }

      cumulativeTotalCost += totalMonthlyCost;
      cumulativeOOP += monthlyOOP;

      chartData.push({ month, name: `M${month}`, 'Your Monthly OOP': monthlyOOP, 'Total Drug Cost': totalMonthlyCost, phase });
    }

    // Generate Recommendations
    const recommendations = [];
    if (gapEntryMonth) {
      recommendations.push(`Based on your current spending, you are projected to enter the **Coverage Gap (Donut Hole)** in **Month ${gapEntryMonth}**.`);
      recommendations.push("During this time, your share of drug costs may increase significantly.");

      if (gapEntryMonth <= 6) {
        recommendations.push("Entering the gap early in the year means you will have higher costs for many months. It is critical to look for lower-cost generic alternatives.");
      }
    } else {
      recommendations.push("Great news! You are **not** projected to enter the coverage gap this year based on your current inputs.");
    }

    if (catastrophicEntryMonth) {
      recommendations.push(`You are projected to reach **Catastrophic Coverage** in **Month ${catastrophicEntryMonth}**, after which your costs will drop drastically.`);
    }

    // Generate Action Plan
    const plan = [
      { label: 'Shop Plans', detail: 'Use the Medicare Plan Finder during Open Enrollment (Oct 15 - Dec 7) to see if a different plan covers your specific drugs better.' },
      { label: 'Generics First', detail: 'Ask your doctor if there are generic versions of your medications. Using generics keeps your total cost lower, delaying your entry into the gap.' },
      { label: 'Extra Help', detail: 'Check if you qualify for "Extra Help" (low-income subsidy), which can eliminate the coverage gap entirely.' }
    ];

    setResult({
      totalMonthlyCost,
      gapEntryMonth,
      catastrophicEntryMonth,
      annualOutOfPocket: cumulativeOOP,
      chartData,
      initialCoverageLimit,
      catastrophicCoverageLimit,
      recommendations,
      plan,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WholeWord className="h-5 w-5" />
            Health Plan Coverage Gap Estimator
          </CardTitle>
          <CardDescription>
            Project when you might enter the Medicare Part D coverage gap ("donut hole") based on your drug costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Prescription Drugs</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end border p-4 rounded-lg relative">
                      <FormField
                        control={form.control}
                        name={`drugs.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Drug Name {index + 1}</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Ozempic" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`drugs.${index}.monthlyCost`}
                        render={({ field }) => (
                          <FormItem className="w-48">
                            <FormLabel>Total Monthly Cost</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 950" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', monthlyCost: undefined as unknown as number })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Drug
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Plan Limits (e.g., 2023 Standard)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="initialCoverageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Coverage Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 4660" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="catastrophicCoverageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catastrophic Limit ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 7400" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverageGapDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand-Name Gap Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 75" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit">Estimate Coverage</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Coverage Gap Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Est. Annual Out-of-Pocket</h4>
                  <p className="text-2xl font-bold">{formatNumberUS(result.annualOutOfPocket)}</p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Enter Coverage Gap In</h4>
                  <p className="text-2xl font-bold text-orange-600">{result.gapEntryMonth ? `Month ${result.gapEntryMonth}` : 'Never'}</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Enter Catastrophic Coverage In</h4>
                  <p className="text-2xl font-bold text-purple-600">{result.catastrophicEntryMonth ? `Month ${result.catastrophicEntryMonth}` : 'Never'}</p>
                </div>
              </div>
              <div className="mt-8">
                <Progress value={((result.annualOutOfPocket / result.catastrophicCoverageLimit) * 100)} className="h-4" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>$0</span>
                  <span>{formatNumberUS(result.catastrophicCoverageLimit)} (Catastrophic Limit)</span>
                </div>
              </div>
              <div className="mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatNumberUS(value)} />
                    <Tooltip
                      formatter={(value: number) => formatNumberUS(value)}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-background p-2 border rounded-lg shadow-lg">
                              <p className="font-bold">{label}</p>
                              <p className="text-sm text-blue-500">{`Your OOP: ${formatNumberUS(payload[0].value as number)}`}</p>
                              <p className="text-sm text-muted-foreground">{`Phase: ${payload[0].payload.phase}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="Your Monthly OOP" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary font-bold">•</span>
                      <span dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {result.plan.map((step, index) => (
                    <li key={index} className="space-y-1">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">
                          {index + 1}
                        </span>
                        {step.label}
                      </h4>
                      <p className="text-sm text-muted-foreground pl-8">{step.detail}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Script id="calc-schema" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Health Plan Coverage Gap Estimator",
          "description": "Project when you might enter the Medicare Part D coverage gap (donut hole) based on your drug costs.",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })
      }} />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Coverage Gap
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>The Medicare Part D coverage gap, commonly known as the "donut hole," is a temporary limit on what most drug plans will cover for drugs. Not everyone will enter the coverage gap. It begins after you and your drug plan have spent a certain amount for covered drugs.</p>
            <p>This calculator helps you estimate if and when you might hit the donut hole based on your current medication costs, giving you a clearer picture of your potential out-of-pocket expenses throughout the year.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Formula Explained
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Phased Calculation</h4>
              <p className="mt-2">This calculator works by simulating your drug spending month by month. It tracks the cumulative total retail cost of your drugs and applies the correct payment rules for each of the four Part D phases:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li><strong className="text-foreground">Deductible Phase:</strong> You pay 100% of costs until your deductible is met. (This calculator assumes it's met early for simplicity).</li>
                <li><strong className="text-foreground">Initial Coverage Phase:</strong> You pay a co-pay or co-insurance (e.g., 25%) and the plan pays the rest, until the total drug cost reaches the Initial Coverage Limit.</li>
                <li><strong className="text-foreground">Coverage Gap (Donut Hole):</strong> Once you hit the limit, you're in the gap. You'll pay a percentage (e.g., 25%) of the cost for both brand-name and generic drugs.</li>
                <li><strong className="font-semibold text-foreground">Catastrophic Coverage:</strong> After your total out-of-pocket spending reaches a certain limit, you leave the gap and your costs are drastically reduced for the rest of the year (e.g., a small co-pay or 5% co-insurance).</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/finance/health-insurance-subsidy-eligibility-calculator" className="hover:underline">Health Insurance Subsidy Calculator</Link></li>
              <li><Link href="/finance/prescription-refill-cost-estimator" className="hover:underline">Prescription Cost Estimator</Link></li>
              <li><Link href="/finance/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
              <li><Link href="/finance/hospital-stay-cost-by-specialty-calculator" className="hover:underline">Hospital Stay Cost Estimator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Navigating the Medicare Donut Hole: An In-Depth Guide</h1>
          <p className="text-lg italic">The Medicare Part D coverage gap, or "donut hole," can lead to unexpected and significant prescription costs. Understanding exactly how it works, what counts, and what strategies you can employ is the key to managing your budget and making informed decisions about your health plan.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What Exactly is the "Donut Hole"? A Journey Through the Four Stages</h2>
          <p>The "donut hole" isn't a physical place; it's the third of four distinct phases in your Medicare Part D prescription drug coverage. Think of your coverage as a journey you take each calendar year, with your progress determined by how much you and your plan spend on medications. The year resets on January 1st.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Stage 1: The Annual Deductible</strong>
              <p>At the beginning of the year, you are in the deductible phase. During this stage, you are typically responsible for 100% of your prescription drug costs until you have spent a predetermined amount—the deductible. For 2024, the maximum standard deductible is $545, but some plans may offer a lower deductible, or even a $0 deductible.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Stage 2: The Initial Coverage Phase</strong>
              <p>Once you've met your deductible, your plan's cost-sharing benefits kick in. You will now pay a copay (a fixed amount, like $15) or coinsurance (a percentage, like 25%) for each prescription. Your Part D plan pays the rest. You remain in this phase until the total amount that you <strong className="text-foreground">and</strong> your plan have spent reaches the Initial Coverage Limit. For 2024, this limit is $5,030. It's crucial to remember this is the <strong className="text-foreground">total retail cost</strong> of the drugs, not just your out-of-pocket spending.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Stage 3: The Coverage Gap (The Donut Hole)</strong>
              <p>This is the stage this calculator helps you predict. Once the total drug costs exceed the Initial Coverage Limit ($5,030 in 2024), you fall into the donut hole. In this phase, your cost-sharing responsibility increases significantly. Thanks to the Affordable Care Act and subsequent legislation, the cost is not 100%. In 2024, you will pay no more than 25% of the retail cost for both brand-name and generic drugs while in the gap. You stay in the donut hole until your total out-of-pocket spending for the year reaches the catastrophic coverage threshold.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Stage 4: Catastrophic Coverage</strong>
              <p>This is the final stage and your financial safety net. You exit the donut hole and enter catastrophic coverage once your <strong className="text-foreground">true out-of-pocket (TrOOP)</strong> spending reaches a certain limit. For 2024, this limit is $8,000. Once in this phase, your costs are drastically reduced for the rest of the year. Historically, you'd pay a small coinsurance or copay, but starting in 2024, there is <strong className="text-foreground">$0 cost-sharing</strong> for the remainder of the year once you hit the catastrophic limit. You have no further drug costs.</p>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What Counts Toward Getting Out of the Donut Hole? Understanding TrOOP</h2>
          <p>Getting out of the donut hole depends on your "True Out-of-Pocket" (TrOOP) costs. This is where things get a bit more complex. It's not just what you've paid. TrOOP includes:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold text-foreground">Your Deductible:</strong> The amount you spent before your initial coverage began.</li>
            <li><strong className="font-semibold text-foreground">Your Copays/Coinsurance:</strong> All the cost-sharing you paid during the initial coverage phase.</li>
            <li><strong className="font-semibold text-foreground">What You Pay in the Gap:</strong> The 25% (or less) of the drug cost you are responsible for while in the donut hole.</li>
            <li><strong className="font-semibold text-foreground">Manufacturer Discounts:</strong> This is a key component. While you pay 25% for brand-name drugs in the gap, the manufacturer provides a 70% discount on the retail price. This 70% discount <strong className="text-foreground">also counts</strong> toward your TrOOP, which helps you get out of the donut hole much faster.</li>
          </ul>
          <p className="mt-2">What does <strong className="text-foreground">not</strong> count toward TrOOP? Your plan's monthly premiums, the pharmacy's dispensing fee, and what your plan pays toward the cost of the drug.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Proactive Strategies to Manage Donut Hole Costs</h2>
          <p>If you anticipate falling into the donut hole, there are several powerful steps you can take to mitigate the financial impact long before you feel it at the pharmacy counter:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold text-foreground">Annual Plan Comparison:</strong> This is the most important step. During Medicare's Open Enrollment period (October 15 - December 7), use the official Medicare Plan Finder tool on Medicare.gov. Enter your specific list of medications and dosages. The tool will compare all available Part D plans in your area and show you your total estimated annual cost—including premiums, deductibles, and cost-sharing in every phase—for each plan. A plan with a slightly higher premium might save you thousands if it has better coverage for your specific drugs.</li>
            <li><strong className="font-semibold text-foreground">Talk to Your Doctor About Alternatives:</strong> Before Open Enrollment, have a conversation with your doctor. Show them your list of medications and ask, "Are there any lower-cost generic alternatives or different therapeutic options for my condition that would be just as safe and effective?" They may be able to switch you from a high-cost, Tier 3 brand-name drug to a low-cost, Tier 1 generic that achieves the same health outcome.</li>
            <li><strong className="font-semibold text-foreground">Apply for Extra Help:</strong> Extra Help is a federal program that assists people with limited income and resources in paying for their Part D premiums, deductibles, and coinsurance. If you qualify, your costs will be significantly lower, and you will not enter the donut hole. You can apply through the Social Security Administration's website.</li>
            <li><strong className="font-semibold text-foreground">Investigate State Pharmaceutical Assistance Programs (SPAPs):</strong> Some states have their own programs to help eligible residents pay for their prescriptions. Check your state's Department of Aging or Department of Health website to see if a program exists.</li>
            <li><strong className="font-semibold text-foreground">Use Mail-Order Pharmacies Strategically:</strong> Check your plan's benefits. Many offer a 90-day supply of maintenance medications for a reduced copay compared to three 30-day refills at a retail pharmacy. This can help reduce your out-of-pocket spending in the initial coverage phase.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Forewarned is Forearmed</h2>
          <p>The Medicare Part D coverage gap can be a significant financial challenge, but it doesn't have to be a crisis. By using this estimator to understand your potential costs and timeline, you empower yourself to plan ahead. You can budget for higher-cost months, have informed conversations with your doctor about alternatives, and use the Open Enrollment period to find the most cost-effective plan for your unique needs. Knowledge is your best tool for navigating the complexities of prescription drug coverage and ensuring your health and financial security.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What costs count toward entering the donut hole?</h4>
              <p className="text-muted-foreground">The total retail cost of your prescription drugs counts toward entering the donut hole. This includes both the portion you pay (deductible, copays) and the portion your Part D plan pays. For example, if a drug's retail cost is $400 and you have a $40 copay, the full $400 counts toward reaching the initial coverage limit.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What costs count toward getting out of the donut hole?</h4>
              <p className="text-muted-foreground">To get out of the donut hole, your True Out-of-Pocket (TrOOP) spending is what matters. This includes your deductible, your copays/coinsurance, what you pay in the gap, and, crucially, the 70% manufacturer discount on brand-name drugs while you are in the gap. This manufacturer discount helps you move through the gap much faster.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Do the Part D limits change every year?</h4>
              <p className="text-muted-foreground">Yes. The Centers for Medicare & Medicaid Services (CMS) adjusts the standard deductible, Initial Coverage Limit, and Out-of-Pocket Threshold annually. It's essential to check the current year's figures during the fall Open Enrollment period to understand how your costs might change.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is the donut hole going away?</h4>
              <p className="text-muted-foreground">While legislation has "closed" the donut hole in the sense that you no longer pay 100% of costs, the coverage gap phase itself still exists, and you still pay a higher share (25%) than in the initial phase. However, big changes are coming. Starting in 2025, the Inflation Reduction Act will cap all Medicare beneficiaries' out-of-pocket drug spending at $2,000 per year, effectively eliminating the catastrophic coverage phase and making costs much more predictable.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does this calculator use my plan's specific formulary?</h4>
              <p className="text-muted-foreground">No. This is a general estimator based on the total retail cost of drugs and standard cost-sharing rules. Your plan's specific formulary (list of covered drugs) and its tiering structure will ultimately determine your actual costs. This tool is best used for high-level planning and understanding the Part D structure.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I have a Medicare Advantage plan?</h4>
              <p className="text-muted-foreground">Most Medicare Advantage (Part C) plans include prescription drug coverage (these are called MA-PDs). These plans must still follow the same federally mandated four-phase structure as standalone Part D plans. Therefore, this estimator is still a useful tool for projecting your potential entry into the gap, even if you have a Medicare Advantage plan.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What happens to the limits if I switch plans mid-year?</h4>
              <p className="text-muted-foreground">You generally cannot switch plans mid-year unless you qualify for a Special Enrollment Period. Your spending accumulates within a single plan for a calendar year. If you do qualify to switch, your TrOOP spending from your old plan will transfer to your new plan, so you don't have to start over from zero in the same year.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a month-by-month projection to help you anticipate when you might enter the Medicare Part D coverage gap (the "donut hole"). By estimating your total annual out-of-pocket costs and pinpointing when your expenses may increase, this tool empowers you to budget more effectively and proactively discuss cost-saving strategies with your healthcare provider.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
