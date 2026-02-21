'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, PlusCircle, Trash2, Pill, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const refillSchema = z.object({
  name: z.string().min(1, "Name is required."),
  cost: z.number().positive("Cost must be positive."),
  frequency: z.enum(['monthly', '90-day', 'annually']),
  insuranceCopay: z.number().min(0).optional(),
});

const formSchema = z.object({
  prescriptions: z.array(refillSchema).min(1, 'Please add at least one prescription.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalAnnualCost: number;
  totalAnnualCopay: number;
  yourTotalAnnualCost: number;
  chartData: { name: string; 'Out-of-Pocket': number; 'Insurance Pays': number; }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const REFILLS_PER_YEAR = {
  monthly: 12,
  '90-day': 4,
  annually: 1,
};

export default function PrescriptionRefillCostEstimator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prescriptions: [{ name: '', cost: undefined, frequency: 'monthly', insuranceCopay: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  const resetForm = () => {
    form.reset({
      prescriptions: [{ name: '', cost: undefined, frequency: 'monthly', insuranceCopay: undefined }],
    });
    setResult(null);
  };

  const onSubmit = (values: FormValues) => {
    let totalAnnualCost = 0;
    let totalAnnualCopay = 0;
    const chartData: CalculationResult['chartData'] = [];
    let hasMonthly = false;

    values.prescriptions.forEach(rx => {
      const refillsPerYear = REFILLS_PER_YEAR[rx.frequency];
      if (rx.frequency === 'monthly') hasMonthly = true;
      const annualCost = rx.cost * refillsPerYear;
      const annualCopay = (rx.insuranceCopay ?? rx.cost) * refillsPerYear;

      totalAnnualCost += annualCost;
      totalAnnualCopay += annualCopay;

      chartData.push({
        name: rx.name,
        'Out-of-Pocket': annualCopay,
        'Insurance Pays': Math.max(0, annualCost - annualCopay),
      });
    });

    // Generate Recommendations
    const recommendations = [];
    if (totalAnnualCopay > 500) {
      recommendations.push(`Your estimated annual out-of-pocket cost is **${formatNumberUS(totalAnnualCopay)}**. Exploring cost-saving measures could yield significant savings.`);
    } else {
      recommendations.push(`Your estimated annual cost is **${formatNumberUS(totalAnnualCopay)}**, which is relatively manageable.`);
    }

    if (hasMonthly) {
      recommendations.push("You have monthly refills. Check if your insurance offers a **90-day mail-order** option, which often costs the same as two monthly copays (saving you 33%).");
    }

    if (totalAnnualCost > totalAnnualCopay + 1000) {
      recommendations.push("Your insurance is covering a large portion of the retail cost. Ensure you stay in-network to maintain this coverage.");
    }

    // Generate Action Plan
    const plan = [
      { label: 'Go Generic', detail: 'Ask your doctor or pharmacist if there is a generic equivalent for any brand-name drugs you are taking.' },
      { label: 'Check GoodRx', detail: 'Compare your insurance copay against discount card prices (like GoodRx or SingleCare). Sometimes the cash price is lower.' },
      { label: 'Review Formulary', detail: 'Check your insurance formulary to ensure your medications are on a preferred tier (lower copay).' }
    ];

    setResult({
      totalAnnualCost,
      totalAnnualCopay,
      yourTotalAnnualCost: totalAnnualCopay,
      chartData,
      recommendations,
      plan,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Prescription Refill Cost Estimator
          </CardTitle>
          <CardDescription>
            Estimate your annual out-of-pocket costs for recurring prescription medications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Your Prescriptions</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative">
                      <h4 className="absolute -top-2.5 left-2 bg-background px-1 text-xs text-muted-foreground">Prescription {index + 1}</h4>
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medication Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Lisinopril" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.cost`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost per Refill</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Refill Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="90-day">Every 90 Days</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`prescriptions.${index}.insuranceCopay`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Copay (Optional)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', cost: undefined as unknown as number, frequency: 'monthly', insuranceCopay: undefined })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                </Button>
              </div>
              <div className="flex gap-4">
                <Button type="submit">Estimate Annual Cost</Button>
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
              <CardTitle>Your Estimated Annual Prescription Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Your Estimated Annual Out-of-Pocket Cost</p>
                <p className="text-5xl font-bold text-primary">{formatNumberUS(result.yourTotalAnnualCost)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Retail Cost</h4>
                  <p className="text-2xl font-bold">{formatNumberUS(result.totalAnnualCost)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground">Insurance Pays</h4>
                  <p className="text-2xl font-bold text-green-600">{formatNumberUS(result.totalAnnualCost - result.yourTotalAnnualCost)}</p>
                </div>
              </div>
              <div className="mt-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} layout="vertical">
                    <XAxis type="number" tickFormatter={(value) => formatNumberUS(value)} />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value: number) => formatNumberUS(value)} cursor={{ fill: 'hsla(var(--muted))' }} />
                    <Legend />
                    <Bar dataKey="Out-of-Pocket" stackId="a" fill="hsl(var(--primary))" />
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
          "name": "Prescription Refill Cost Estimator",
          "description": "Estimate your annual out-of-pocket costs for recurring prescription medications.",
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
              Understanding Prescription Costs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Prescription drug costs can be a significant and recurring part of any household's budget. Prices are determined by the drug's manufacturer, but what you actually pay is determined by your health insurance plan's formulary, your deductible, and your copay/coinsurance structure.</p>
            <p>This calculator helps you estimate your annual spending by adding up the costs of your regular medications. By entering your copay, you can see a more accurate picture of your out-of-pocket expenses versus what your insurance covers.</p>
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
              <h4 className="font-semibold text-foreground mb-2">Annual Cost Per Prescription</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Annual Cost = Cost per Refill * Refills per Year</p>
              <p className="mt-2">The calculator first determines the number of refills needed per year based on your selected frequency (12 for monthly, 4 for 90-day, 1 for annually). It then multiplies this by the cost per refill to find the total annual cost for each medication.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Your Out-of-Pocket Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Your Annual Cost = (Your Copay) * Refills per Year</p>
              <p className="mt-2">If you provide a copay, it's used to calculate your total out-of-pocket cost for the year. If no copay is entered, the calculator assumes you are paying the full retail cost for the medication.</p>
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
              <li><Link href="/finance/health-plan-coverage-gap-estimator" className="hover:underline">Health Plan Coverage Gap Estimator</Link></li>
              <li><Link href="/finance/dental-cost-comparison-calculator" className="hover:underline">Dental Cost Comparison Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Patient's Guide to Managing Prescription Drug Costs</h1>
          <p className="text-lg italic">Prescription medications are a vital part of health management for millions, but navigating the costs can be a challenge. Understanding the system and knowing your options are the keys to ensuring you get the treatment you need without facing financial hardship. This guide offers in-depth strategies to help you save money at the pharmacy counter.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Decoding the Price: Why Are Drug Costs So Complicated?</h2>
          <p>The price you pay for a prescription is rarely the simple "list price." It's the end result of a complex, often opaque, series of negotiations and relationships between drug manufacturers, wholesalers, insurance companies, and pharmacy benefit managers (PBMs). Understanding the key components of your insurance plan is the first step to deciphering your bill.</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold text-foreground">Formulary:</strong> This is the official list of prescription drugs covered by your health insurance plan. A formulary is not just a simple list; it's a strategic document. Drugs are typically grouped into "tiers." Tier 1 is usually reserved for preferred generic drugs and has the lowest copay. Tier 2 might be preferred brand-name drugs, with a higher copay. Tier 3 could be non-preferred brand-name drugs with an even higher copay, and Tier 4 or a specialty tier is for very expensive, often biologic, drugs that may require you to pay a percentage of the cost (coinsurance) rather than a flat copay. If a drug is not on the formulary at all, you may have to pay 100% of the cost.</li>
            <li><strong className="font-semibold text-foreground">Deductible:</strong> This is the amount you must pay out-of-pocket for healthcare services, including prescriptions, before your insurance plan begins to pay. For many high-deductible health plans (HDHPs), you could be responsible for the full, negotiated price of your medications until your deductible is met. It's crucial to know if your plan has a separate drug deductible or if it's combined with your medical deductible.</li>
            <li><strong className="font-semibold text-foreground">Copay vs. Coinsurance:</strong> These are the two main forms of cost-sharing after your deductible is met. A <strong className="text-foreground">copay</strong> is a predictable, fixed dollar amount (e.g., $10 for a generic, $40 for a brand-name drug) you pay for a prescription. <strong className="text-foreground">Coinsurance</strong> is a percentage of the drug's negotiated cost (e.g., 25%) that you are responsible for. Coinsurance can be unpredictable, as your share fluctuates with the drug's price. It's most common for expensive, specialty-tier drugs.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Actionable Strategies for Substantial Savings</h2>
          <p>Even within this complex system, you have significant power to lower your costs. This calculator provides a baseline for your annual expenses; the next step is to actively manage them. Try these proven strategies:</p>
          <ul className="list-disc ml-6 space-y-4">
            <li><strong className="font-semibold text-foreground">Embrace Generic Drugs:</strong> This is the single most effective cost-saving strategy. When your doctor prescribes a new medication, always ask, "Is there a generic version of this, or a generic alternative in the same class?" Generic drugs are required by the FDA to have the same active ingredient, strength, quality, and dosage form as their brand-name counterparts. They are typically 80-85% cheaper because their manufacturers didn't have to bear the massive costs of initial research, development, and marketing.</li>
            <li><strong className="font-semibold text-foreground">Leverage 90-Day Mail-Order Supplies:</strong> For medications you take long-term (maintenance medications for conditions like high blood pressure or cholesterol), using your insurance plan's preferred mail-order pharmacy is often a huge money-saver. Many plans offer a significant discount, such as getting a three-month supply for the price of two retail copays. This also adds convenience and reduces trips to the pharmacy.</li>
            <li><strong className="font-semibold text-foreground">Always Check Prescription Discount Cards:</strong> Never assume your insurance copay is the lowest price. Services like GoodRx, SingleCare, and WellRx are free to use and can provide a coupon price that is substantially cheaper than your copay, especially for common generic drugs. You cannot combine a discount card with your insurance for a single transaction, but you can ask the pharmacist to run the price both ways and choose the cheaper option. Note that what you pay using a discount card typically does not count toward your insurance deductible.</li>
            <li><strong className="font-semibold text-foreground">Seek Out Manufacturer Assistance:</strong> For expensive, brand-name drugs, the manufacturer is often your best resource. They frequently offer <strong className="text-foreground">copay cards</strong> or <strong className="text-foreground">coupons</strong> that can reduce your out-of-pocket cost to a very small amount, sometimes as low as $5 or $10 per month. These are designed for people with commercial insurance. For those with lower incomes or who are uninsured, <strong className="text-foreground">Patient Assistance Programs (PAPs)</strong> can sometimes provide the medication completely free of charge. You can find these programs on the drug manufacturer's website or by using search tools like the Medicine Assistance Tool (MAT.org).</li>
            <li><strong className="font-semibold text-foreground">Engage Your Healthcare Team:</strong> Your doctor and pharmacist are your best advocates.
              <ul className="list-circle pl-6 mt-2 space-y-2">
                <li><strong className="text-foreground">Talk to your Doctor:</strong> When a new drug is prescribed, discuss the cost. Ask if there are less expensive but equally effective alternatives, known as "therapeutic substitution." Sometimes an older, cheaper drug in the same class can work just as well.</li>
                <li><strong className="text-foreground">Talk to your Pharmacist:</strong> Your pharmacist is an expert on drug costs. Before you pay, ask them if there are any available discounts or if paying cash with a coupon would be cheaper than your insurance copay. They can often help you navigate the options in real-time.</li>
              </ul>
            </li>
            <li><strong className="font-semibold text-foreground">Navigate Prior Authorizations and Appeals:</strong> If your insurance denies coverage for a drug, don't give up. This often triggers a "prior authorization" (PA) requirement. Your doctor's office must submit paperwork to the insurer explaining why you need that specific medication. If the PA is still denied, you have the right to appeal the decision. This can be a frustrating process, but persistence often pays off.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Be a Proactive Healthcare Consumer</h2>
          <p>Managing prescription costs requires being an engaged, informed, and proactive consumer. You cannot control the list price of a drug, but you can control how, where, and under what terms you purchase it. By understanding your insurance plan's structure, diligently exploring discount options, and maintaining open communication with your healthcare team, you can ensure you get the medications you need without letting the cost become a barrier to your health and financial well-being.</p>
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
              <h4 className="font-semibold mb-2">Can I use a discount card (like GoodRx) and my insurance at the same time?</h4>
              <p className="text-muted-foreground">No, you cannot combine them in a single transaction. You must choose one or the other. However, you can ask the pharmacist to check the price with both your insurance and a discount coupon, then pay the lower of the two. A key consideration is that payments made using a discount card usually do not count toward your insurance plan's deductible or out-of-pocket maximum.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Is it always cheaper to get a 90-day supply?</h4>
              <p className="text-muted-foreground">Often, but not always. Many insurance plans are specifically structured to incentivize 90-day refills for maintenance medications, frequently offering a "3-for-2" deal (e.g., three months of medication for two copays). This is a common feature of mail-order pharmacy programs. Always check your plan's benefits or call their member services line to confirm the pricing structure for 30-day versus 90-day supplies.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the difference between a generic and a brand-name drug?</h4>
              <p className="text-muted-foreground">A generic drug is required by the FDA to be a bioequivalent to the brand-name drug. This means it must have the same active ingredient, strength, dosage form, and route of administration. They are typically much cheaper because the manufacturers did not have to bear the enormous costs of initial research, clinical trials, and marketing that the brand-name company incurred.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What should I do if my insurance requires a "prior authorization"?</h4>
              <p className="text-muted-foreground">A prior authorization means your insurance company wants more information from your doctor before they will agree to cover the medication. Contact your doctor's office immediately to let them know the prior authorization is required. Their staff will typically handle the paperwork, which involves explaining to the insurer why you need that specific drug. Be prepared for this process to take several days.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Where can I find Patient Assistance Programs (PAPs)?</h4>
              <p className="text-muted-foreground">A good place to start is the drug manufacturer's official website, as they often have a dedicated section for patient support. You can also use the Medicine Assistance Tool (MAT.org), which is a search engine designed to help patients, caregivers, and healthcare providers find information on the many assistance programs available from pharmaceutical companies.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is a "therapeutic alternative" or "therapeutic substitution"?</h4>
              <p className="text-muted-foreground">This is a drug that is chemically different from the one originally prescribed but is in the same class and works in a similar way to treat the same condition. For example, there are many different types of statins to treat high cholesterol. If your prescribed statin is expensive, your doctor might suggest a cheaper therapeutic alternative that is on a lower tier of your insurance formulary.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Why did the price of my generic drug suddenly increase?</h4>
              <p className="text-muted-foreground">Generic drug prices can fluctuate due to several factors, including manufacturing shortages, consolidation of manufacturers, or changes in your insurance plan's formulary from one year to the next. If you see a sudden price spike, it's a good time to check discount card prices and talk to your pharmacist about whether other pharmacies might have it for less.</p>
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
            <p>This calculator helps you aggregate the individual costs of your recurring prescriptions into a clear annual estimate. By allowing you to input the retail cost and your specific insurance copay, it provides a powerful visual breakdown of your out-of-pocket expenses versus what your insurance covers. This empowers you to budget effectively and identify which medications have the largest financial impact, so you can explore cost-saving strategies where they matter most.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
