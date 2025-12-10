'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Hospital, Info, Shield, TrendingUp, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const COST_PER_DAY = {
  cardiology: 3500,
  orthopedics: 3000,
  neurology: 4000,
  oncology: 4500,
  'general-surgery': 2800,
};

const formSchema = z.object({
  specialty: z.enum(Object.keys(COST_PER_DAY) as [string, ...string[]]),
  lengthOfStay: z.number().positive('Length of stay must be positive.'),
  insuranceCoverage: z.number().min(0, 'Coverage cannot be negative.').max(100, 'Coverage cannot exceed 100.'),
  deductible: z.number().min(0, 'Deductible cannot be negative.'),
  maxOutOfPocket: z.number().positive('Max out-of-pocket must be positive.'),
  customDailyCost: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalBaseCost: number;
  insurancePays: number;
  yourTotalCost: number;
  chartData: { name: string; 'Your Cost': number; 'Insurance Pays': number; }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function HospitalStayCostCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialty: undefined,
      lengthOfStay: undefined,
      insuranceCoverage: undefined,
      deductible: undefined,
      maxOutOfPocket: undefined,
      customDailyCost: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      specialty: undefined,
      lengthOfStay: undefined,
      insuranceCoverage: undefined,
      deductible: undefined,
      maxOutOfPocket: undefined,
      customDailyCost: undefined,
    });
    setResult(null);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: FormValues) => {
    const { specialty, lengthOfStay, insuranceCoverage, deductible, maxOutOfPocket, customDailyCost } = values;

    const dailyCost = customDailyCost || COST_PER_DAY[specialty as keyof typeof COST_PER_DAY];
    const totalBaseCost = dailyCost * lengthOfStay;

    const remainingDeductible = deductible;
    const costAfterDeductible = Math.max(0, totalBaseCost - remainingDeductible);

    const yourCoinsurance = costAfterDeductible * (1 - (insuranceCoverage / 100));
    let yourTotalCost = remainingDeductible + yourCoinsurance;

    // Check if hitting Max OOP
    const hitMaxOOP = yourTotalCost >= maxOutOfPocket;
    yourTotalCost = Math.min(yourTotalCost, maxOutOfPocket, totalBaseCost);

    const insurancePays = totalBaseCost - yourTotalCost;

    // Generate Recommendations
    const recommendations = [];
    if (hitMaxOOP) {
      recommendations.push(`You are projected to hit your **Max Out-of-Pocket limit of ${formatNumberUS(maxOutOfPocket)}**. Any additional covered care this year should be 100% paid by insurance.`);
    } else {
      recommendations.push(`You are projected to pay **${formatNumberUS(yourTotalCost)}**, which is below your annual max of ${formatNumberUS(maxOutOfPocket)}.`);
    }

    if (yourTotalCost > 2000) {
      recommendations.push("Since your estimated cost is significant (> $2,000), ask the hospital billing department about **interest-free payment plans** or financial assistance.");
    }

    if (insuranceCoverage < 70) {
      recommendations.push("Your plan covers less than 70% of costs after deductible. Be prepared for a higher share of the bill.");
    }

    // Generate Action Plan
    const plan = [
      { label: 'Check Network', detail: 'Verify that the hospital, surgeon, and anesthesiologist are all in-network to avoid surprise bills.' },
      { label: 'Get Estimate', detail: 'Ask the hospital for a written good-faith estimate before the procedure (if scheduled).' },
      { label: 'Review Bill', detail: 'After discharge, request an itemized bill and check for errors before paying.' }
    ];

    setResult({
      totalBaseCost,
      insurancePays,
      yourTotalCost,
      chartData: [
        { name: 'Cost Breakdown', 'Your Cost': yourTotalCost, 'Insurance Pays': insurancePays },
      ],
      recommendations,
      plan,
    });
  };

  const specialty = form.watch("specialty");

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hospital className="h-5 w-5" />
            Hospital Stay Cost by Specialty Calculator
          </CardTitle>
          <CardDescription>
            Estimate your potential out-of-pocket costs for a hospital stay using averages or your own cost data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Specialty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="oncology">Oncology</SelectItem>
                          <SelectItem value="general-surgery">General Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lengthOfStay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length of Stay (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="customDailyCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Average Daily Cost (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={specialty ? `Avg for ${specialty}: ${formatNumberUS(COST_PER_DAY[specialty as keyof typeof COST_PER_DAY])}` : "e.g., 3200"}
                          {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="deductible"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remaining Deductible ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 1500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Co-insurance Coverage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxOutOfPocket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Out-of-Pocket ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  Estimate Cost
                </Button>
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
              <CardTitle>Your Estimated Hospital Stay Costs</CardTitle>
              <CardDescription>
                This is an estimate based on the information provided. Actual costs may vary.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Your Estimated Out-of-Pocket Cost</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.yourTotalCost)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Estimated Bill</h4>
                  <p className="text-2xl font-bold">
                    {formatNumberUS(result.totalBaseCost)}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Estimated Payment</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumberUS(result.insurancePays)}
                  </p>
                </div>
              </div>
              <div className="mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} layout="vertical">
                    <XAxis type="number" tickFormatter={(value) => formatNumberUS(value)} />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip formatter={(value: number) => formatNumberUS(value)} cursor={{ fill: 'hsla(var(--muted))' }} />
                    <Bar dataKey="Your Cost" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="Insurance Pays" stackId="a" fill="hsl(var(--chart-2))" />
                  </BarChart>
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
          "name": "Hospital Stay Cost Calculator",
          "description": "Estimate your potential out-of-pocket costs for a hospital stay using averages or your own cost data.",
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
              Understanding Hospital Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>The cost of a hospital stay is one of the most complex and opaque areas of healthcare finance. The final bill is influenced by numerous factors, including the specific hospital, its location, negotiated rates with your insurer, and every single service, medication, and supply used during your stay.</p>
            <p>This calculator provides a high-level estimate based on national averages for daily costs and your specific insurance structure. It's a starting point to help you understand the potential financial impact, but it cannot predict the exact cost. Using a known daily rate from your hospital or insurer will provide a more accurate result.</p>
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
              <h4 className="font-semibold text-foreground mb-2">Total Base Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Total Base Cost = Avg. Daily Cost * Length of Stay</p>
              <p className="mt-2">This is the initial estimated bill from the hospital before any insurance is applied. The calculator uses your custom daily cost if provided; otherwise, it uses the national average for the selected specialty.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Your Out-of-Pocket Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Your Cost = Deductible + ((Total Base Cost - Deductible) * (1 - Co-insurance %))</p>
              <p className="mt-2">This formula models how insurance benefits are applied. First, you pay your remaining deductible. After the deductible is met, your co-insurance kicks in, where you pay a percentage of the remaining bill. Your total payment is ultimately capped by your plan's maximum out-of-pocket limit.</p>
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
              <li><Link href="/finance/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
              <li><Link href="/finance/long-term-care-cost-estimator" className="hover:underline">Long-Term Care Cost Estimator</Link></li>
              <li><Link href="/finance/dental-cost-comparison-calculator" className="hover:underline">Dental Cost Comparison Calculator</Link></li>
              <li><Link href="/finance/health-plan-coverage-gap-estimator" className="hover:underline">Health Plan Coverage Gap Estimator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Decoding Your Hospital Bill: A Guide to Medical Costs</h1>
          <p className="text-lg italic">Navigating healthcare costs can be confusing and stressful. This guide breaks down the key terms and factors that determine what you'll owe after a hospital stay, empowering you to be a more informed patient.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Key Health Insurance Terms You Must Know</h2>
          <p>Understanding your insurance plan is the first and most critical step to managing medical expenses. Here are the most important terms this calculator uses:</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Deductible:</strong> This is the amount of money you must pay out-of-pocket for covered healthcare services before your insurance plan starts to pay. For example, if your deductible is $1,500, you pay the first $1,500 of covered services yourself. This resets every plan year.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Co-insurance:</strong> This is your share of the costs of a covered health care service, calculated as a percentage (e.g., 20%) of the allowed amount for the service. You pay co-insurance *after* you've met your deductible. For a $10,000 bill where you've met your deductible, your 20% co-insurance share would be $2,000.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Max Out-of-Pocket (OOPM):</strong> This is the absolute most you will have to pay for covered, in-network services in a plan year. After you spend this amount on deductibles, copayments, and co-insurance, your health plan pays 100% of the costs of covered benefits for the rest of the year. This is your most important financial protection.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How It All Works Together: A Real-World Example</h2>
          <p>Imagine a $20,000 hospital bill. Your plan has a $3,000 deductible, 20% co-insurance, and an $8,000 max out-of-pocket.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Step 1: Meet the Deductible.</strong> You are responsible for the first $3,000 of the bill. This satisfies your deductible for the year. The remaining bill is now $17,000.</li>
            <li><strong className="font-semibold">Step 2: Pay Co-insurance.</strong> You are responsible for 20% of the remaining $17,000, which is $3,400. Your insurance will cover the other 80% ($13,600).</li>
            <li><strong className="font-semibold">Step 3: Calculate Your Total.</strong> Your total potential out-of-pocket cost is your deductible + your co-insurance: $3,000 + $3,400 = $6,400.</li>
            <li><strong className="font-semibold">Step 4: Check Against Your Max Out-of-Pocket.</strong> Since your calculated total of $6,400 is less than your $8,000 max, you owe $6,400. If the bill had been much larger (e.g., $100,000), your total would have been capped at $8,000.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Proactive Steps to Manage Hospital Costs</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold text-foreground">Confirm Network Status:</strong> Before any planned procedure, confirm that the hospital AND the specific doctors who will treat you (like the surgeon and anesthesiologist) are in your insurance network. Out-of-network care can be catastrophically expensive.</li>
            <li><strong className="font-semibold text-foreground">Request an Estimate:</strong> For non-emergency procedures, ask the hospital's billing department for a good-faith estimate. While not a guarantee, it provides a crucial baseline.</li>
            <li><strong className="font-semibold text-foreground">Review Your Bill Carefully:</strong> Hospital bills are notoriously error-prone. Request an itemized bill (not just a summary) and review every charge. Look for duplicate charges, services you didn't receive, or incorrect quantities. Don't be afraid to question and dispute items with the billing department.</li>
            <li><strong className="font-semibold text-foreground">Negotiate a Cash Price:</strong> If you are uninsured, always ask the hospital for the "self-pay" or "cash" price. This is often significantly lower than the initial "chargemaster" rate they bill to insurers.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Plan for the Unexpected</h2>
          <p>While you can't predict a medical emergency, understanding your insurance and potential costs can help you prepare financially. This calculator provides a valuable baseline to inform your planning, whether that's building an adequate emergency fund, choosing the right health plan during open enrollment, or understanding the benefits of an HSA.</p>
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
              <h4 className="font-semibold mb-2">Why are the average costs in the calculator so high?</h4>
              <p className="text-muted-foreground">The costs are based on hospital "chargemaster" rates, which are the official, inflated prices. Insurers negotiate these rates down to an "allowed amount." This calculator uses average daily costs as a general baseline before applying your specific insurance details.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does this estimate include doctor's fees?</h4>
              <p className="text-muted-foreground">No. This is a critical point. You will often receive separate bills from the hospital (for the room, nurses, supplies) and from the physicians who treated you (like surgeons, radiologists, or anesthesiologists). This calculator primarily estimates the hospital facility charges.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I go to an out-of-network hospital?</h4>
              <p className="text-muted-foreground">Out-of-network care is significantly more expensive and unpredictable. Your insurer will cover a much smaller portion, or none at all. Crucially, you may be subject to "balance billing," where the provider bills you for the full difference between their charge and what the insurer paid. This calculator assumes in-network care.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is an EOB (Explanation of Benefits)?</h4>
              <p className="text-muted-foreground">After you receive care, your insurer will send you an EOB. This is NOT a bill. It's a statement that shows what the provider charged, what the insurer paid, and what your responsibility is. Always wait for the actual bill from the provider before paying, and compare it to your EOB.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I can't afford my bill?</h4>
              <p className="text-muted-foreground">Never ignore a medical bill. Call the hospital's billing department immediately. Ask if you qualify for their financial assistance or charity care program. You can also try to negotiate a lower lump-sum payment or request an interest-free payment plan. Many hospitals are willing to work with patients to find a solution.</p>
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
            <p>This calculator helps demystify the cost of a hospital stay by applying your specific health insurance terms (deductible, co-insurance, max out-of-pocket) to an estimated total bill. By allowing you to input a custom daily cost or use a specialty-based average, it provides a personalized baseline for your out-of-pocket expenses. This empowers you to better prepare for medical costs and understand the financial protection your health plan offers.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
