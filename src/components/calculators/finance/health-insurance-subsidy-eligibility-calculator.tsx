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
import { Landmark, Info, Shield, TrendingUp, Users, CheckCircle, XCircle, Target, Activity } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

// Federal Poverty Level (FPL) data for 2024 (for 2025 coverage)
const FPL_DATA = {
  // Contiguous 48 states and D.C.
  'standard': [
    { size: 1, level: 15060 },
    { size: 2, level: 20440 },
    { size: 3, level: 25820 },
    { size: 4, level: 31200 },
    { size: 5, level: 36580 },
    { size: 6, level: 41960 },
    { size: 7, level: 47340 },
    { size: 8, level: 52720 },
  ],
  // Alaska
  'alaska': [
    { size: 1, level: 18810 },
    { size: 2, level: 25540 },
    { size: 3, level: 32270 },
    { size: 4, level: 39000 },
    //... add more if needed
  ],
  // Hawaii
  'hawaii': [
    { size: 1, level: 17310 },
    { size: 2, level: 23500 },
    { size: 3, level: 29690 },
    { size: 4, level: 35880 },
    //... add more if needed
  ],
};
const FPL_PER_ADDITIONAL_PERSON = {
  'standard': 5380,
  'alaska': 6730,
  'hawaii': 6190,
};

const formSchema = z.object({
  householdIncome: z.number().positive("Income must be positive."),
  householdSize: z.number().min(1, "Household size must be at least 1."),
  state: z.enum(['standard', 'alaska', 'hawaii']),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  fplPercentage: number;
  isEligibleForSubsidy: boolean;
  isEligibleForMedicaid: boolean;
  isCliff: boolean;
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const getFpl = (size: number, state: keyof typeof FPL_DATA) => {
  const table = FPL_DATA[state];
  if (size <= table.length) {
    return table.find(d => d.size === size)?.level || 0;
  }
  const base = table[table.length - 1];
  return base.level + (size - base.size) * FPL_PER_ADDITIONAL_PERSON[state];
};

export default function HealthInsuranceSubsidyEligibilityCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      householdIncome: undefined,
      householdSize: undefined,
      state: undefined,
    },
  });

  const resetForm = () => {
    form.reset({
      householdIncome: undefined,
      householdSize: undefined,
      state: undefined,
    });
    setResult(null);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: FormValues) => {
    const { householdIncome, householdSize, state } = values;
    const fpl = getFpl(householdSize, state);
    if (fpl === 0) return;

    const fplPercentage = (householdIncome / fpl) * 100;

    // As of the Inflation Reduction Act, the 400% subsidy cliff is removed through 2025.
    // Premiums are capped at 8.5% of income.
    const isEligibleForSubsidy = fplPercentage >= 100;

    // Medicaid eligibility is generally 138% of FPL in states that expanded it.
    const isEligibleForMedicaid = fplPercentage < 138;

    // The "cliff" is effectively gone for now, but we can note if they are over 400%
    const isCliff = fplPercentage > 400;

    // Generate Recommendations
    const recommendations = [];
    if (isEligibleForMedicaid) {
      recommendations.push("Your income qualifies you for **Medicaid**, which typically offers free or very low-cost coverage.");
      recommendations.push("Contact your state's Medicaid office immediately to apply, as enrollment is often open year-round.");
    } else if (isEligibleForSubsidy) {
      recommendations.push("You are eligible for **Premium Tax Credits** to lower your monthly insurance bill.");

      if (fplPercentage >= 100 && fplPercentage <= 250) {
        recommendations.push("You also qualify for **Cost-Sharing Reductions (CSR)**, but only if you choose a **Silver** plan. This lowers your deductible and copays.");
        recommendations.push("When shopping, filter for Silver plans to see these extra savings.");
      }

      if (isCliff) {
        recommendations.push("Although your income is higher, you still qualify for subsidies that cap your premium at 8.5% of your income.");
      }
    } else {
      recommendations.push("Your income is below the poverty level but above Medicaid limits (in non-expansion states). This is the 'coverage gap'.");
      recommendations.push("Check with local community health centers for low-cost care options.");
    }


    // Generate Action Plan
    const plan = [
      { label: 'Verify Income', detail: 'Ensure your MAGI estimate is accurate, as subsidies are reconciled at tax time.' },
      { label: 'Shop Marketplace', detail: 'Visit HealthCare.gov or your state exchange to see actual plan prices with your subsidy applied.' },
      { label: 'Update Often', detail: 'If your income changes during the year, update your application immediately to avoid tax penalties.' }
    ];

    setResult({
      fplPercentage,
      isEligibleForSubsidy,
      isEligibleForMedicaid,
      isCliff,
      recommendations,
      plan,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Health Insurance Subsidy Eligibility Calculator
          </CardTitle>
          <CardDescription>
            Estimate your eligibility for premium tax credits (subsidies) under the Affordable Care Act (ACA).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="householdIncome" render={({ field }) => (<FormItem><FormLabel>Modified Adjusted Gross Income (MAGI)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="householdSize" render={({ field }) => (<FormItem><FormLabel>Household Size</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">48 Contiguous States & D.C.</SelectItem>
                        <SelectItem value="alaska">Alaska</SelectItem>
                        <SelectItem value="hawaii">Hawaii</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <Button type="submit">Check Eligibility</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className={result.isEligibleForSubsidy ? "border-green-500" : "border-red-500"}>
            <CardHeader>
              <CardTitle>Eligibility Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-muted-foreground">Your income is approximately</p>
                <p className="text-5xl font-bold text-primary">{result.fplPercentage.toFixed(0)}%</p>
                <p className="text-lg font-medium text-muted-foreground">of the Federal Poverty Level.</p>
              </div>

              {result.isEligibleForMedicaid ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-center">
                  <h3 className="text-xl font-bold text-blue-600 flex items-center justify-center gap-2"><CheckCircle /> Likely Eligible for Medicaid</h3>
                  <p className="text-muted-foreground mt-2">Based on your income, your household may be eligible for free or low-cost coverage through your state's Medicaid program. You should apply through your state agency.</p>
                </div>
              ) : result.isEligibleForSubsidy ? (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                  <h3 className="text-xl font-bold text-green-600 flex items-center justify-center gap-2"><CheckCircle /> Likely Eligible for Subsidies</h3>
                  <p className="text-muted-foreground mt-2">Your household is likely eligible for a Premium Tax Credit to lower your monthly health insurance premiums on a Marketplace plan.</p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                  <h3 className="text-xl font-bold text-red-600 flex items-center justify-center gap-2"><XCircle /> Likely Not Eligible for Subsidies</h3>
                  <p className="text-muted-foreground mt-2">Your income is below the 100% FPL threshold, placing you in the "coverage gap" if your state has not expanded Medicaid. You may have other options available.</p>
                </div>
              )}
              {result.isCliff && !result.isEligibleForMedicaid && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-center mt-4">
                  <p className="text-muted-foreground">Your income is above 400% of the FPL. While the "subsidy cliff" is currently removed (through 2025), your premium contribution will be capped at 8.5% of your income for a benchmark plan.</p>
                </div>
              )}
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
          "name": "Health Insurance Subsidy Eligibility Calculator",
          "description": "Estimate your eligibility for premium tax credits (subsidies) under the Affordable Care Act (ACA).",
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Health Insurance Subsidies</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>The Affordable Care Act (ACA) provides financial assistance to help individuals and families afford health insurance purchased through the Health Insurance Marketplace. This assistance primarily comes in the form of the Premium Tax Credit (PTC).</p>
            <p>Your eligibility is determined by your Modified Adjusted Gross Income (MAGI) and household size relative to the Federal Poverty Level (FPL). This calculator provides a high-level estimate of your status. The results can help you understand what level of assistance you might qualify for when you shop for plans on HealthCare.gov or your state's official marketplace.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Explained</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">FPL Percentage Calculation</h4>
              <p className="font-mono bg-muted p-4 rounded-md">FPL % = (Your MAGI / Federal Poverty Level for Your Household Size) * 100</p>
              <p className="mt-2">The core of the calculation is determining where your income falls in relation to the FPL. The calculator first identifies the FPL for your household size and location based on federal data. It then divides your income by this number to get your FPL percentage.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong className="text-foreground">Below 138% FPL:</strong> You are likely eligible for your state's Medicaid program (if your state expanded it).</li>
                <li><strong className="text-foreground">100% - 400% FPL:</strong> You are eligible for a Premium Tax Credit.</li>
                <li><strong className="text-foreground">Above 400% FPL:</strong> Under current law (through 2025), you are still eligible for a subsidy if the benchmark plan costs more than 8.5% of your income.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Explore other financial planning tools</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/finance/copay-vs-deductible-breakeven-calculator" className="hover:underline">Copay vs. Deductible Break-even Calculator</Link></li>
              <li><Link href="/finance/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
              <li><Link href="/finance/health-plan-coverage-gap-estimator" className="hover:underline">Health Plan Coverage Gap Estimator</Link></li>
              <li><Link href="/finance/hospital-stay-cost-by-specialty-calculator" className="hover:underline">Hospital Stay Cost Estimator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Making Healthcare Affordable: A Deep Dive into ACA Subsidies</h1>
          <p className="text-lg italic">The Affordable Care Act (ACA) transformed the individual health insurance market, and its most significant feature is the financial assistance it provides. Understanding if you qualify—and for what—is the first step toward securing affordable, quality health coverage.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Two Types of ACA Financial Assistance</h2>
          <p>The ACA created two distinct types of subsidies to make both premiums and out-of-pocket costs more manageable for millions of Americans. Your eligibility for each is determined by your income.</p>
          <ol className="list-disc ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Premium Tax Credits (PTC):</strong> This is the most common form of assistance. The PTC is a refundable tax credit designed to lower your monthly insurance premiums. It's often called a "subsidy." You can choose to have it paid directly to your insurance company each month to reduce your premium, or you can pay the full premium yourself and claim the entire credit when you file your federal income tax return. Your eligibility and the amount of your credit are based on a sliding scale. The lower your income, the higher your tax credit.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Cost-Sharing Reductions (CSR):</strong> This is an "extra" subsidy that helps lower your out-of-pocket costs, such as deductibles, copayments, and coinsurance. You are eligible for CSRs <strong className="text-foreground">only</strong> if your income is between 100% and 250% of the FPL, and you <strong className="text-foreground">must</strong> enroll in a Silver-level plan on the Marketplace to receive these benefits. This is a crucial point; if you choose a Bronze, Gold, or Platinum plan, you will not get cost-sharing reductions, even if your income qualifies. CSRs automatically lower the deductible, copayments, and max out-of-pocket limit of a Silver plan, making it function more like a Gold or Platinum plan without the higher premium.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Key Metrics: MAGI and FPL</h2>
          <p>Your eligibility for everything is determined by two key numbers, which this calculator uses:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong className="font-semibold text-foreground">Modified Adjusted Gross Income (MAGI):</strong> This is the figure the Marketplace uses to determine your income. It's not simply your salary. MAGI is your Adjusted Gross Income (AGI) from your tax return plus certain non-taxable income, such as tax-exempt interest and non-taxable Social Security benefits. For most people, MAGI is very close to or the same as their AGI. It is the combined income of everyone in your tax household who is required to file a tax return.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Federal Poverty Level (FPL):</strong> This is an income figure, set annually by the federal government, used to determine eligibility for a wide range of benefits, including ACA subsidies. The FPL varies by household size—the more people in your household, the higher the FPL. This calculator uses the official FPL figures to determine your income as a percentage of the poverty level.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Navigating the Subsidy Tiers</h2>
          <p>Your FPL percentage places you into a specific eligibility category:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong className="font-semibold text-foreground">Below 100% FPL: The Coverage Gap</strong>
              <p>In states that have <strong className="text-foreground">not</strong> expanded Medicaid, individuals with incomes below the poverty line fall into the "coverage gap." They earn too much to qualify for their state's traditional Medicaid program but too little to qualify for ACA premium subsidies (which start at 100% FPL). This is a difficult position, and individuals in this situation should seek out community health centers or other local resources.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Below 138% FPL: Medicaid Expansion</strong>
              <p>In the majority of states that <strong className="text-foreground">have</strong> expanded Medicaid, adults with household incomes up to 138% of the FPL are eligible for free or very low-cost coverage through Medicaid. If your income falls in this range and you live in an expansion state, you will likely be directed to your state's Medicaid agency to apply.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">100% to 400% FPL: The Heart of the Subsidies</strong>
              <p>This is the primary group targeted by the ACA's premium tax credits. The amount of your subsidy is calculated to ensure that the premium for the "second-lowest-cost silver plan" (the benchmark plan) in your area will not cost you more than a certain percentage of your income (from about 2% up to 8.5%). As noted earlier, if you are between 100% and 250% FPL, you are also eligible for powerful cost-sharing reductions if you enroll in a Silver plan.</p>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Above 400% FPL: The End of the "Subsidy Cliff"</strong>
              <p>Prior to 2021, if your income was even one dollar over 400% FPL, you lost all eligibility for subsidies, a situation known as the "subsidy cliff." The Inflation Reduction Act has eliminated this cliff through the end of 2025. Now, individuals and families with incomes above 400% FPL can still receive a subsidy. The assistance is designed so that the benchmark Silver plan premium will not exceed 8.5% of their household income. This has provided critical financial relief for many middle-income families, early retirees, and self-employed individuals in high-cost areas.</p>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Knowledge is Your Best Tool</h2>
          <p>Healthcare affordability is a major concern for most American families. The ACA subsidy system, while complex, provides a powerful mechanism to make coverage attainable. By using this calculator to get a clear estimate of your eligibility, you can approach the Health Insurance Marketplace with confidence. You'll know whether you should be looking for Medicaid, expecting a significant premium tax credit, or focusing your search on Silver plans to take advantage of cost-sharing reductions. This knowledge allows you to find the best possible coverage that fits your family's budget and healthcare needs.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What income should I use for the "household income" field?</h4>
              <p className="text-muted-foreground">You should use your best estimate of your Modified Adjusted Gross Income (MAGI) for the year you are seeking coverage (e.g., your expected 2025 income for a 2025 plan). This includes wages, salaries, tips, self-employment income, unemployment compensation, and Social Security benefits, among other things. It's the combined income of everyone in your tax household.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Who counts as a member of my "household"?</h4>
              <p className="text-muted-foreground">For Marketplace purposes, your household typically includes the tax filer, their spouse, and anyone they claim as a tax dependent. It's based on how you expect to file your taxes for the coverage year.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if my income changes during the year?</h4>
              <p className="text-muted-foreground">It is very important to report any income changes to the Marketplace as soon as possible. If your income goes up, your subsidy amount may decrease. If you don't report it, you might have to pay back the excess subsidy when you file your taxes. Conversely, if your income goes down, you might be eligible for a larger subsidy, lowering your monthly payments.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the "benchmark plan"?</h4>
              <p className="text-muted-foreground">The actual dollar amount of your premium tax credit is tied to the price of the "second-lowest-cost Silver plan" (SLCSP) available to you in your area. This is known as the benchmark plan. The subsidy is calculated to cover the difference between the benchmark plan's premium and the percentage of your income you're expected to contribute.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Can I get a subsidy if my employer offers health insurance?</h4>
              <p className="text-muted-foreground">Generally, no. If you have an offer of what the IRS considers "affordable" and "adequate" coverage from an employer, you are typically not eligible for a subsidy on the Marketplace. For 2024, coverage is considered affordable if the employee's share of the premium for the lowest-cost self-only plan is less than 8.39% of the household income.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What is the "Medicaid expansion" and how do I know if my state has it?</h4>
              <p className="text-muted-foreground">The ACA allowed states to expand their Medicaid programs to cover nearly all adults with incomes up to 138% of the FPL. Most, but not all, states have done so. You can find out if your state has expanded Medicaid by checking the Kaiser Family Foundation (KFF) website, which maintains an up-to-date status map.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a straightforward estimate of your eligibility for financial assistance under the Affordable Care Act (ACA). By comparing your income and household size to the Federal Poverty Level (FPL), it determines whether you are likely eligible for Medicaid in expansion states, a Premium Tax Credit (subsidy) on the Marketplace, or both. This initial check is the most critical first step in understanding how to access affordable health insurance for you and your family.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
