
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, Bed, Info, Shield, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

// Data from Genworth Cost of Care Survey (approximated for 2024)
const CURRENT_ANNUAL_COSTS = {
  'homemaker-services': 69500,
  'home-health-aide': 75500,
  'assisted-living': 64200,
  'nursing-home-semi-private': 109500,
  'nursing-home-private': 120500,
};

const formSchema = z.object({
  currentAge: z.number().positive('Current age must be positive.'),
  careStartAge: z.number().positive('Care start age must be positive.'),
  careType: z.enum(Object.keys(CURRENT_ANNUAL_COSTS) as [string, ...string[]]),
  currentAnnualCost: z.number().positive('Current annual cost must be positive.'),
  careDurationYears: z.number().positive('Care duration must be positive.'),
  inflationRate: z.number().min(0, 'Inflation rate cannot be negative.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  yearsUntilCare: number;
  futureAnnualCost: number;
  totalCareCost: number;
  chartData: { name: string; 'Future Annual Cost': number }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function LongTermCareCostEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      careStartAge: undefined,
      careType: 'assisted-living',
      currentAnnualCost: undefined,
      careDurationYears: undefined,
      inflationRate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { currentAge, careStartAge, currentAnnualCost, careDurationYears, inflationRate } = values;

    if (careStartAge <= currentAge) {
      form.setError('careStartAge', {
        type: 'manual',
        message: 'Care start age must be after current age.',
      });
      return;
    }

    const yearsUntilCare = careStartAge - currentAge;
    const inflation = inflationRate / 100;

    // Calculate the future cost of the first year of care
    const futureAnnualCost = currentAnnualCost * Math.pow(1 + inflation, yearsUntilCare);

    // Calculate the total cost over the duration, accounting for inflation during care
    let totalCareCost = 0;
    const chartData = [];
    for (let i = 0; i < careDurationYears; i++) {
      const costForYear = futureAnnualCost * Math.pow(1 + inflation, i);
      totalCareCost += costForYear;
      chartData.push({
        name: `Year ${i + 1}`,
        'Future Annual Cost': costForYear,
      });
    }

    // Generate Recommendations
    const recommendations = [];
    if (totalCareCost > 300000) {
      recommendations.push(`The total projected cost is substantial (**${formatNumberUS(totalCareCost)}**). Relying solely on personal savings may put your other retirement assets at risk.`);
    }

    if (yearsUntilCare < 15) {
      recommendations.push(`With care potentially needed in just **${yearsUntilCare} years**, you have a shorter window to save. Review your current assets immediately.`);
    } else {
      recommendations.push(`You have a **${yearsUntilCare}-year** runway. This is the ideal time to consider Long-Term Care Insurance, as premiums are lower when you are younger and healthier.`);
    }

    if (inflationRate > 4) {
      recommendations.push("You are modeling a high inflation rate (>4%). Even small differences in inflation can have a massive impact on future costs over decades.");
    }

    // Generate Action Plan
    const plan = [
      { label: 'Assess Liquidity', detail: 'Determine which assets (savings, home equity, investments) could be liquidated to pay for care if needed.' },
      { label: 'Explore Insurance', detail: 'Get quotes for traditional LTC insurance or hybrid life/LTC policies to see if they fit your budget.' },
      { label: 'Legal Prep', detail: 'Ensure you have a Power of Attorney and Health Care Proxy in place so a trusted person can manage your affairs if you are unable to.' }
    ];

    setResult({
      yearsUntilCare,
      futureAnnualCost,
      totalCareCost,
      chartData,
      recommendations,
      plan,
    });
  };

  const handleCareTypeChange = (value: keyof typeof CURRENT_ANNUAL_COSTS) => {
    form.setValue('careType', value);
    form.setValue('currentAnnualCost', CURRENT_ANNUAL_COSTS[value]);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Long-Term Care Cost Estimator
          </CardTitle>
          <CardDescription>
            Project the potential future costs of long-term care to inform your financial planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="currentAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Current Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 45" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="careStartAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Age to Start Care</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="careType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Care</FormLabel>
                      <Select onValueChange={(value) => handleCareTypeChange(value as keyof typeof CURRENT_ANNUAL_COSTS)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select care type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="homemaker-services">Homemaker Services</SelectItem>
                          <SelectItem value="home-health-aide">Home Health Aide</SelectItem>
                          <SelectItem value="assisted-living">Assisted Living Facility</SelectItem>
                          <SelectItem value="nursing-home-semi-private">Nursing Home (Semi-Private)</SelectItem>
                          <SelectItem value="nursing-home-private">Nursing Home (Private)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentAnnualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Annual Cost</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 64200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="careDurationYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration of Care (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inflationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LTC Inflation Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Estimate Future Cost
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Estimated Long-Term Care Costs</CardTitle>
              <CardDescription>
                Based on your inputs, here is a projection of your potential future long-term care expenses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Estimated Total Cost of Care</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.totalCareCost)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Care Begins In</h4>
                  <p className="text-2xl font-bold">
                    {result.yearsUntilCare} years
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Future Annual Cost (First Year)</h4>
                  <p className="text-2xl font-bold">
                    {formatNumberUS(result.futureAnnualCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Projected Annual Cost During Care</CardTitle>
              <CardDescription>
                This chart shows how the annual cost of care increases with inflation during the care period.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatNumberUS(value)} />
                  <Tooltip formatter={(value: number) => formatNumberUS(value)} cursor={{ fill: 'hsla(var(--muted))' }} />
                  <Bar dataKey="Future Annual Cost" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
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
          "name": "Long-Term Care Cost Estimator",
          "description": "Project the potential future costs of long-term care to inform your financial planning.",
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
              Understanding the Challenge of Long-Term Care Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Long-term care involves a variety of services designed to meet a person's health or personal care needs during a short or long period of time. These services help people live as independently and safely as possible when they can no longer perform everyday activities on their own. These are often referred to as "Activities of Daily Living" (ADLs), and typically include:</p>
            <p>This calculator uses national average data and an assumed inflation rate to project a potential future cost. It is a powerful tool for starting a conversation about how you will prepare for this possibility. The numbers can be startling, but having a realistic estimate is the first step toward creating a sound financial plan.</p>
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
              <h4 className="font-semibold text-foreground mb-2">Future Annual Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Future Cost = Current Cost * (1 + Inflation Rate) ^ Years Until Care</p>
              <p className="mt-2">This formula projects the cost of the first year of care by applying a compound inflation rate to today's average cost. It shows how much the price of care could increase by the time you need it.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Cost of Care</h4>
              <p className="mt-2">The total cost is calculated by summing the inflation-adjusted cost for each year of the care duration. This provides a comprehensive estimate of the total financial liability.</p>
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
              <li><Link href="/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
              <li><Link href="/hospital-stay-cost-by-specialty-calculator" className="hover:underline">Hospital Stay Cost Calculator</Link></li>
              <li><Link href="/dental-cost-comparison-calculator" className="hover:underline">Dental Cost Comparison Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Confronting the Elephant in the Room: Planning for Long-Term Care</h1>
          <p className="text-lg italic">It’s a topic many of us prefer to avoid, but planning for long-term care is a critical component of a secure retirement. Understanding the potential costs is the first step to taking control.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Long-Term Care?</h2>
          <p>Long-term care involves a variety of services designed to meet a person's health or personal care needs during a short or long period of time. These services help people live as independently and safely as possible when they can no longer perform everyday activities on their own. These are often referred to as "Activities of Daily Living" (ADLs), and typically include:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Bathing</li>
            <li>Dressing</li>
            <li>Eating</li>
            <li>Toileting</li>
            <li>Continence</li>
            <li>Transferring (getting in and out of a bed or chair)</li>
          </ul>
          <p>LTC is not just for the elderly; it can be required at any age due to an accident or chronic illness. However, the probability of needing care increases significantly as you get older. The U.S. Department of Health and Human Services estimates that someone turning 65 today has almost a 70% chance of needing some type of long-term care services in their remaining years.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Who Pays for Long-Term Care? The Surprising Truth</h2>
          <p>This is the most critical misconception many people have. Standard health insurance does <em className="italic">not</em> cover long-term care. Medicare provides very limited coverage (up to 100 days in a skilled nursing facility after a qualifying hospital stay), but it does not cover "custodial care," which makes up the majority of LTC services.</p>
          <p>So who foots the bill? Primarily, you do. The payment options are:</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Self-Funding:</strong> Using personal savings, retirement funds (like a 401(k) or IRA), and other assets to pay for care. This is the default option if no other plan is in place and can rapidly deplete a lifetime of savings. This calculator shows the potential scale of the liability you may need to self-fund.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Long-Term Care Insurance:</strong> Purchasing a specific insurance policy designed to cover LTC costs. There are traditional policies and "hybrid" policies that combine life insurance with an LTC rider. Premiums can be expensive and are not guaranteed to remain level.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Medicaid:</strong> The government program that acts as a safety net, but it is means-tested. To qualify, you must spend down your assets to a very low level (typically only a few thousand dollars). This means you effectively have to become impoverished to receive government assistance for care.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Strategies for Planning</h2>
          <p>Seeing a potential six- or seven-figure liability can be overwhelming, but it's better to know than to be surprised. This estimate allows you to start forming a strategy. Your plan might be a single approach or a combination of several:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Earmarking Assets:</strong> Based on your cost estimate, you can designate a portion of your investment portfolio specifically for potential LTC needs.</li>
            <li><strong className="font-semibold">Purchasing LTC Insurance:</strong> Now that you have a cost estimate, you can request quotes from insurance providers for a policy that would cover a significant portion of this liability. The younger and healthier you are when you apply, the lower the premiums will be.</li>
            <li><strong className="font-semibold">Utilizing an HSA:</strong> If you have a Health Savings Account, you can use those funds tax-free to pay for LTC insurance premiums or the cost of care directly. This is one of the most efficient ways to pay for care.</li>
            <li><strong className="font-semibold">Considering Home Equity:</strong> A reverse mortgage or the eventual sale of a home can be part of a comprehensive LTC funding plan.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Proactive Planning is Power</h2>
          <p>The purpose of this calculator is not to scare you, but to empower you. By replacing a vague fear with a concrete, data-driven estimate, you can move from anxiety to action. Long-term care is a family issue, and having a plan in place is one of the greatest gifts you can give to your loved ones, protecting them from the financial and emotional stress of becoming caregivers or making difficult financial decisions on your behalf.</p>
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
              <h4 className="font-semibold mb-2">Are these costs accurate for my specific location?</h4>
              <p className="text-muted-foreground">This calculator uses national averages, which can vary significantly from state to state and even city to city. For more precise local data, you can look up the Genworth Cost of Care Survey for your specific state. However, this tool provides a reasonable baseline for planning purposes.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's a realistic inflation rate for long-term care?</h4>
              <p className="text-muted-foreground">Healthcare and long-term care costs have historically risen faster than general inflation. While this calculator defaults to 3.5%, rates between 3% and 5% are commonly used for long-term projections. It's wise to run the numbers with a more aggressive inflation rate to see a more conservative outcome.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the average duration of care needed?</h4>
              <p className="text-muted-foreground">It varies greatly. According to the U.S. Department of Health and Human Services, on average, women need care for 3.7 years, while men need it for 2.2 years. About 20% of today's 65-year-olds will need care for longer than 5 years.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">When should I start planning for long-term care?</h4>
              <p className="text-muted-foreground">The best time to start planning is in your 50s. At this age, you are more likely to be healthy enough to qualify for long-term care insurance at a reasonable premium. The longer you wait, the more expensive (or unavailable) insurance becomes.</p>
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
            <p>This calculator provides a crucial, personalized estimate of one of the largest potential expenses in retirement: long-term care. By projecting the future cost based on care type, age, and inflation, it transforms an abstract risk into a tangible number. This empowers you to have informed conversations with your family and financial advisors about creating a strategy, whether it involves self-funding, purchasing insurance, or a hybrid approach, to protect your assets and ensure your future needs are met.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

