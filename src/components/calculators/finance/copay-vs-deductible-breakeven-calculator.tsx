import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, Scale, AlertTriangle, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const planSchema = z.object({
  annualPremium: z.number().positive("Premium must be positive."),
  deductible: z.number().min(0, "Deductible can't be negative."),
  coinsurance: z.number().min(0).max(100),
  maxOutOfPocket: z.number().positive("Max OOP must be positive."),
});

const formSchema = z.object({
  planA: planSchema,
  planB: planSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  breakEvenPoint: number | null;
  chartData: { medicalCosts: number; 'Plan A Total Cost': number; 'Plan B Total Cost': number; }[];
  planA: FormValues['planA'];
  planB: FormValues['planB'];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

const calculateTotalCost = (medicalCosts: number, plan: z.infer<typeof planSchema>): number => {
  const { annualPremium, deductible, coinsurance, maxOutOfPocket } = plan;

  let outOfPocketOnMedical = 0;
  if (medicalCosts > deductible) {
    const coinsuranceAmount = (medicalCosts - deductible) * (coinsurance / 100);
    outOfPocketOnMedical = deductible + coinsuranceAmount;
  } else {
    outOfPocketOnMedical = medicalCosts;
  }

  const cappedOutOfPocketOnMedical = Math.min(outOfPocketOnMedical, maxOutOfPocket);
  return annualPremium + cappedOutOfPocketOnMedical;
};

export default function CopayVsDeductibleBreakevenCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planA: { annualPremium: undefined, deductible: undefined, coinsurance: undefined, maxOutOfPocket: undefined },
      planB: { annualPremium: undefined, deductible: undefined, coinsurance: undefined, maxOutOfPocket: undefined },
    },
  });

  const resetForm = () => {
    form.reset({
      planA: { annualPremium: undefined, deductible: undefined, coinsurance: undefined, maxOutOfPocket: undefined },
      planB: { annualPremium: undefined, deductible: undefined, coinsurance: undefined, maxOutOfPocket: undefined },
    });
    setResult(null);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: FormValues) => {
    const { planA, planB } = values;

    // Find break-even point by iterating
    let breakEvenPoint: number | null = null;
    let maxMedicalCost = Math.max(planA.maxOutOfPocket, planB.maxOutOfPocket) * 2;
    if (maxMedicalCost === 0) maxMedicalCost = 20000;

    const chartData = [];
    const steps = 100;

    let costA_at_0 = calculateTotalCost(0, planA);
    let costB_at_0 = calculateTotalCost(0, planB);

    for (let i = 0; i <= steps; i++) {
      const medicalCosts = (maxMedicalCost / steps) * i;
      const costA = calculateTotalCost(medicalCosts, planA);
      const costB = calculateTotalCost(medicalCosts, planB);
      chartData.push({ medicalCosts, 'Plan A Total Cost': costA, 'Plan B Total Cost': costB });

      if (breakEvenPoint === null) {
        if ((costA_at_0 < costB_at_0 && costA >= costB) || (costA_at_0 > costB_at_0 && costA <= costB)) {
          breakEvenPoint = medicalCosts;
        }
      }
    }

    // Generate Recommendations
    const recommendations = [];
    const planAName = "Plan A";
    const planBName = "Plan B";

    if (breakEvenPoint !== null) {
      recommendations.push(`The break-even point is **${formatNumberUS(breakEvenPoint)}** in medical bills.`);
      if (costA_at_0 < costB_at_0) {
        recommendations.push(`If your medical costs are **below ${formatNumberUS(breakEvenPoint)}**, **${planAName}** (lower premium) is cheaper.`);
        recommendations.push(`If your medical costs are **above ${formatNumberUS(breakEvenPoint)}**, **${planBName}** (likely lower deductible/OOP) becomes cost-effective.`);
      } else {
        recommendations.push(`If your medical costs are **below ${formatNumberUS(breakEvenPoint)}**, **${planBName}** is cheaper.`);
        recommendations.push(`If your medical costs are **above ${formatNumberUS(breakEvenPoint)}**, **${planAName}** becomes cost-effective.`);
      }
    } else {
      if (costA_at_0 < costB_at_0) {
        recommendations.push(`**${planAName}** is consistently cheaper than **${planBName}** at all spending levels modeled.`);
      } else {
        recommendations.push(`**${planBName}** is consistently cheaper than **${planAName}** at all spending levels modeled.`);
      }
    }

    if (planA.deductible > 1600 || planB.deductible > 1600) {
      recommendations.push("Since you are considering a high-deductible plan, check if it is HSA-eligible. Contributing to an HSA provides significant tax benefits.");
    }

    const plan = [
      { label: 'Review Usage', detail: 'Check your last 12 months of medical expenses to see where you typically fall relative to the break-even point.' },
      { label: 'Check Network', detail: 'Ensure your preferred doctors are in-network for the plan that looks financially best.' },
      { label: 'Fund HSA', detail: 'If choosing a High Deductible Health Plan, open an HSA immediately to pay for costs with pre-tax dollars.' }
    ];

    setResult({ breakEvenPoint, chartData, planA, planB, recommendations, plan });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Copay vs. Deductible Break-even Calculator
          </CardTitle>
          <CardDescription>
            Compare two health insurance plans to find the point where their total annual costs are equal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Plan A */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-center">Plan A (e.g., High Premium / Low Deductible)</h3>
                  <FormField control={form.control} name="planA.annualPremium" render={({ field }) => (<FormItem><FormLabel>Annual Premium ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 6000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planA.deductible" render={({ field }) => (<FormItem><FormLabel>Deductible ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planA.coinsurance" render={({ field }) => (<FormItem><FormLabel>Coinsurance (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planA.maxOutOfPocket" render={({ field }) => (<FormItem><FormLabel>Max Out-of-Pocket ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {/* Plan B */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-center">Plan B (e.g., Low Premium / High Deductible)</h3>
                  <FormField control={form.control} name="planB.annualPremium" render={({ field }) => (<FormItem><FormLabel>Annual Premium ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planB.deductible" render={({ field }) => (<FormItem><FormLabel>Deductible ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planB.coinsurance" render={({ field }) => (<FormItem><FormLabel>Coinsurance (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="planB.maxOutOfPocket" render={({ field }) => (<FormItem><FormLabel>Max Out-of-Pocket ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 8000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit">Compare Plans</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Comparison Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Break-even Point</p>
                {result.breakEvenPoint !== null ? (
                  <>
                    <p className="text-5xl font-bold text-primary">{formatNumberUS(result.breakEvenPoint)}</p>
                    <p className="text-muted-foreground mt-2">This is the estimated amount of annual medical expenses where both plans cost you the same.</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-orange-500 flex items-center justify-center gap-2"><AlertTriangle /> No Break-even Point Found</p>
                    <p className="text-muted-foreground mt-2">One plan is consistently cheaper than the other across all levels of spending. See the chart below.</p>
                  </>
                )}
              </div>

              <div className="mt-8 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="medicalCosts" name="Total Medical Costs" tickFormatter={(value) => formatNumberUS(value)} />
                    <YAxis name="Total Annual Cost" tickFormatter={(value) => formatNumberUS(value)} />
                    <Tooltip formatter={(value: number, name: string) => [formatNumberUS(value), name]} labelFormatter={(label: number) => `Medical Costs: ${formatNumberUS(label)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="Plan A Total Cost" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Plan A" />
                    <Line type="monotone" dataKey="Plan B Total Cost" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Plan B" />
                    {result.breakEvenPoint && <Line type="monotone" dataKey="breakEven" strokeDasharray="3 3" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((step) => (
                    <li key={step.label}>
                      <span className="font-semibold text-foreground">{step.label}:</span> {step.detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Break-even Point</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Choosing a health insurance plan involves a trade-off between fixed costs (premiums) and variable costs (deductibles, coinsurance). The "break-even point" is the total amount of medical bills in a year at which the total cost of two different plans becomes equal.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>If your expected annual medical expenses are <strong className="text-foreground">BELOW</strong> the break-even point, the plan with the lower premium (typically Plan B) is usually cheaper overall.</li>
              <li>If your expected annual medical expenses are <strong className="text-foreground">ABOVE</strong> the break-even point, the plan with the lower out-of-pocket costs (typically Plan A) is usually cheaper overall.</li>
            </ul>
            <p>This calculator helps you make an informed decision by moving beyond just the monthly premium and considering how your healthcare usage impacts your total annual cost.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Explained</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Annual Cost Calculation</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Total Cost = Annual Premium + MIN(Max Out-of-Pocket, (Deductible + ((Medical Bills - Deductible) * Coinsurance %)))</p>
              <p className="mt-2">For any given amount of medical bills, the calculator determines your total out-of-pocket responsibility for each plan. It works like this:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>You pay 100% of medical bills until your deductible is met.</li>
                <li>After the deductible is met, you pay your coinsurance percentage (e.g., 20%) on all subsequent bills.</li>
                <li>Your spending on the deductible and coinsurance is capped by your plan's Max Out-of-Pocket limit.</li>
                <li>Your true <strong className="text-foreground">Total Annual Cost</strong> is this out-of-pocket medical spending plus the fixed annual premium you pay regardless of care.</li>
              </ol>
              <p className="mt-2">The break-even point is the "Medical Bills" value where the "Total Annual Cost" for Plan A equals the "Total Annual Cost" for Plan B.</p>
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
              <li><Link href="/investment/hsa-tax-benefit-calculator" className="hover:underline">HSA Tax Benefit Calculator</Link></li>
              <li><Link href="/investment/health-plan-coverage-gap-estimator" className="hover:underline">Health Plan Coverage Gap Estimator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Decoding Health Insurance: A Guide to Premiums, Deductibles, and Making the Right Choice</h1>
          <p className="text-lg italic">Choosing a health insurance plan is one of the most complex and impactful financial decisions you'll make each year. Understanding the core trade-offs between premiums and out-of-pocket costs is the key to selecting a plan that protects both your health and your finances.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Fundamental Trade-Off: Paying Now vs. Paying Later</h2>
          <p>At its heart, choosing a health plan is a bet on your future healthcare needs. You are balancing two primary types of costs:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold">Fixed Costs (Premiums):</strong> This is the guaranteed amount you pay every month to keep your insurance active. A plan with a high premium typically offers more predictable, lower costs when you actually need medical care.</li>
            <li><strong className="font-semibold">Variable Costs (Out-of-Pocket Expenses):</strong> This is what you pay when you use healthcare services. It includes your deductible, copayments, and coinsurance. A plan with a low premium usually shifts more of the financial risk to you in the form of higher out-of-pocket costs.</li>
          </ul>
          <p>The break-even calculator is designed to find the tipping point where the total cost of a high-premium/low-deductible plan and a low-premium/high-deductible plan intersect. This point is your key decision-making metric.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">A Deep Dive into Key Insurance Terms</h2>
          <p>To use this calculator effectively, you must understand what each input represents. These terms define how your plan works.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Premium:</strong> The fixed monthly fee you pay to the insurance company to maintain your coverage. This cost is incurred whether you see a doctor or not. This calculator asks for the <strong className="text-foreground">annual</strong> premium (monthly premium x 12).
            </li>
            <li>
              <strong className="font-semibold text-foreground">Deductible:</strong> This is the amount of money you must pay out-of-pocket for covered medical services before your insurance plan starts to pay. For example, if your deductible is $3,000, you are responsible for the first $3,000 of your medical bills. After you've paid this amount, you move into the coinsurance phase.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Coinsurance:</strong> This is your share of the costs of a covered service, calculated as a percentage. It applies <strong className="text-foreground">after</strong> you've met your deductible. If your coinsurance is 20%, you pay 20% of the bill, and your insurer pays 80%. If you have a $1,000 bill after meeting your deductible, you would owe $200.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Max Out-of-Pocket (OOPM):</strong> This is your financial safety net. It is the absolute most you will have to pay for covered, in-network services in a plan year. This amount includes what you spend on your deductible, copayments, and coinsurance. Once you hit this limit, the insurance plan pays 100% of all covered services for the rest of the year. It's the most important number for protecting yourself from catastrophic medical costs.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Who Should Choose Which Plan?</h2>
          <p>Your personal health and financial situation should guide your choice. This calculator gives you the numbers to back up your decision.</p>
          <ul className="list-disc ml-6 space-y-3">
            <li>
              <strong className="font-semibold text-foreground">A High-Premium, Low-Deductible Plan (like Plan A) is often better if:</strong>
              <ul className="list-circle pl-6 mt-2 space-y-2">
                <li>You expect to have significant medical needs in the coming year (e.g., a planned surgery, managing a chronic condition, planning a pregnancy).</li>
                <li>You prefer predictable costs and want to minimize large, unexpected bills.</li>
                <li>You regularly take expensive brand-name prescription drugs.</li>
                <li>You have young children who frequently visit the doctor.</li>
                <li>Your financial situation makes it difficult to afford a sudden large expense equal to a high deductible.</li>
              </ul>
            </li>
            <li>
              <strong className="font-semibold text-foreground">A Low-Premium, High-Deductible Plan (like Plan B) is often better if:</strong>
              <ul className="list-circle pl-6 mt-2 space-y-2">
                <li>You are generally healthy and don't anticipate needing many medical services.</li>
                <li>You want to minimize your fixed monthly expenses (premiums).</li>
                <li>You have enough savings to comfortably cover the entire deductible and a portion of the coinsurance if a major, unexpected medical event occurs.</li>
                <li>You are eligible for and want to contribute to a Health Savings Account (HSA), which is only available with qualified high-deductible health plans. The tax savings from an HSA can help offset the higher out-of-pocket risk.</li>
              </ul>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Beyond the Numbers: Other Factors to Consider</h2>
          <p>While this calculator is a powerful tool for cost comparison, other factors are equally important:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold text-foreground">Network:</strong> Ensure that your preferred doctors, specialists, and hospitals are "in-network" for any plan you consider. Out-of-network care can be drastically more expensive and may not count toward your deductible or max out-of-pocket.</li>
            <li><strong className="font-semibold text-foreground">Copayments:</strong> This calculator focuses on coinsurance, but many plans use fixed copayments for routine services like doctor visits or specialist visits (e.g., $25 for a primary care visit). These often apply <strong className="text-foreground">before</strong> you've met your deductible. If you expect many routine visits, a plan with low copays can be beneficial.</li>
            <li><strong className="font-semibold text-foreground">Prescription Drug Coverage:</strong> Check the plan's formulary (list of covered drugs) to ensure your specific medications are covered and at what cost (tier). Drug costs are a major component of overall healthcare spending.</li>
            <li><strong className="font-semibold text-foreground">HSA Eligibility:</strong> Only qualified High-Deductible Health Plans (HDHPs) allow you to contribute to a tax-advantaged Health Savings Account (HSA). The ability to save and invest pre-tax dollars for healthcare is a significant financial benefit that can make an HDHP more attractive, even with its higher risk.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Using Data to Make an Empowered Choice</h2>
          <p>Don't choose a health plan based on the premium alone. By entering the details of the plans you're considering into this calculator, you can transform an abstract choice into a data-driven decision. Estimate your expected healthcare usage for the year—are you healthy, or do you have a chronic condition? Use the break-even point as your guide. This analysis will give you the confidence that you've selected the plan that best balances cost, coverage, and risk for your unique circumstances, protecting both your health and your financial future.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if a plan uses copays instead of coinsurance for some services?</h4>
              <p className="text-muted-foreground">This calculator is most accurate for comparing costs related to major medical events that involve coinsurance. For plans with heavy copay usage (e.g., for doctor/specialist visits), you should manually add your expected annual copay costs to the "Annual Premium" to get a more accurate total cost comparison. For example, if you expect 10 doctor visits with a $30 copay, add $300 to that plan's premium input.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does the "Max Out-of-Pocket" include my premiums?</h4>
              <p className="text-muted-foreground">No, and this is a critical distinction. The Max Out-of-Pocket (OOPM) limit applies <strong className="text-foreground">only</strong> to your spending on covered medical services (deductibles, copays, and coinsurance). Your monthly premiums are a separate, fixed cost that you must pay regardless of how much healthcare you use. Your true total annual cost is your premiums plus your medical out-of-pocket spending.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I don't know my expected medical costs?</h4>
              <p className="text-muted-foreground">If you're generally healthy, you can assume a low amount of medical costs (e.g., a few hundred dollars for preventative care and a sick visit). If you have a chronic condition, review the prior year's expenses to get a baseline. The most important use of the break-even point is to ask yourself: "Do I think my medical bills will be more or less than this amount?" Your answer guides your choice.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I find the details for each plan?</h4>
              <p className="text-muted-foreground">During open enrollment, your employer or the Health Insurance Marketplace (HealthCare.gov) will provide a "Summary of Benefits and Coverage" (SBC) for each plan. This standardized document lists all the key details you need for this calculator: premium, deductible, coinsurance, and max out-of-pocket.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Are all deductibles and max out-of-pocket limits the same for individuals and families?</h4>
              <p className="text-muted-foreground">No. Plans always have separate limits for individuals and families. A family plan often has an "embedded" individual deductible (e.g., $3,000 per person) and a higher overall family deductible (e.g., $6,000). Once one person meets the individual limit, their coinsurance kicks in. Once the family as a whole meets the family limit, coinsurance kicks in for everyone, even if some members haven't met their individual deductible. This calculator is designed for an individual's cost; use the individual limits for the most accurate result.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What does it mean if there is no break-even point?</h4>
              <p className="text-muted-foreground">This happens when one plan is cheaper at every single level of medical spending. For example, if Plan B has a lower premium AND a lower max out-of-pocket, it will always be the better financial choice. This is rare but can occur, especially if one plan is heavily subsidized. The chart will clearly show one line consistently below the other.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator demystifies the choice between high-premium/low-deductible and low-premium/high-deductible health plans. By calculating the "break-even point"—the annual medical spending at which both plans cost the same—it empowers you to make a data-driven decision. If you anticipate medical costs below this point, the lower premium plan is likely your best bet. If you expect costs above this point, the security of the lower deductible plan will likely save you money, providing a clear framework for balancing risk and cost.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
