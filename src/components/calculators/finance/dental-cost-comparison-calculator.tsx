'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Smile, Info, Shield, PlusCircle, Trash2, TrendingUp, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import Script from 'next/script';

const PROCEDURE_COSTS = {
  'cleaning': { 'Private Practice': 120, 'Dental School': 60, 'Community Clinic': 80 },
  'filling': { 'Private Practice': 250, 'Dental School': 125, 'Community Clinic': 175 },
  'crown': { 'Private Practice': 1200, 'Dental School': 600, 'Community Clinic': 800 },
  'root-canal': { 'Private Practice': 1500, 'Dental School': 750, 'Community Clinic': 1000 },
  'extraction': { 'Private Practice': 300, 'Dental School': 150, 'Community Clinic': 200 },
};

const procedureSchema = z.object({
  procedure: z.enum(Object.keys(PROCEDURE_COSTS) as [string, ...string[]]),
  quantity: z.number().min(1, "Quantity must be at least 1."),
  privatePracticeCost: z.number().optional(),
  dentalSchoolCost: z.number().optional(),
  communityClinicCost: z.number().optional(),
});

const formSchema = z.object({
  procedures: z.array(procedureSchema).min(1, 'Please add at least one procedure.'),
  insuranceCoverage: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  chartData: { name: string; 'Private Practice': number; 'Dental School': number; 'Community Clinic': number; }[];
  recommendations: string[];
  plan: { label: string; detail: string; }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function DentalCostComparisonCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      procedures: [{ procedure: 'cleaning', quantity: 1, privatePracticeCost: undefined, dentalSchoolCost: undefined, communityClinicCost: undefined }],
      insuranceCoverage: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "procedures",
  });

  const onSubmit = (values: FormValues) => {
    const totalCostsByProvider: { [key: string]: number } = {
      'Private Practice': 0,
      'Dental School': 0,
      'Community Clinic': 0,
    };

    values.procedures.forEach(({ procedure, quantity, privatePracticeCost, dentalSchoolCost, communityClinicCost }) => {
      const defaultCosts = PROCEDURE_COSTS[procedure as keyof typeof PROCEDURE_COSTS];
      const costs = {
        'Private Practice': privatePracticeCost || defaultCosts['Private Practice'],
        'Dental School': dentalSchoolCost || defaultCosts['Dental School'],
        'Community Clinic': communityClinicCost || defaultCosts['Community Clinic'],
      };

      for (const provider in costs) {
        totalCostsByProvider[provider] += costs[provider as keyof typeof costs] * quantity;
      }
    });

    const insuranceMultiplier = 1 - ((values.insuranceCoverage || 0) / 100);

    const yourCosts = {
      name: 'Your Estimated Cost',
      'Private Practice': totalCostsByProvider['Private Practice'] * insuranceMultiplier,
      'Dental School': totalCostsByProvider['Dental School'] * insuranceMultiplier,
      'Community Clinic': totalCostsByProvider['Community Clinic'] * insuranceMultiplier,
    };

    // Generate Recommendations
    const recommendations = [];
    const costs = {
      private: yourCosts['Private Practice'],
      school: yourCosts['Dental School'],
      clinic: yourCosts['Community Clinic']
    };

    // Find absolute cheapest
    let cheapestProvider = 'Private Practice';
    let minCost = costs.private;

    if (costs.school < minCost) {
      minCost = costs.school;
      cheapestProvider = 'Dental School';
    }
    if (costs.clinic < minCost) {
      minCost = costs.clinic;
      cheapestProvider = 'Community Clinic';
    }

    const savingsVsPrivate = costs.private - minCost;

    if (cheapestProvider !== 'Private Practice') {
      recommendations.push(`You could save **${formatNumberUS(savingsVsPrivate)}** by choosing a **${cheapestProvider}** instead of a Private Practice.`);
      if (savingsVsPrivate > 500) {
        recommendations.push("Since the potential savings are significant (> $500), it's highly recommended to call local dental schools or clinics to check availability.");
      }
    } else {
      recommendations.push("In this specific scenario, Private Practice costs are competitive, especially if insurance coverage is high.");
    }

    if ((values.insuranceCoverage || 0) < 50) {
      recommendations.push("Because your insurance coverage is low (or zero), the price differences between providers are much more noticeable. Provider choice is critical.");
    }

    if (values.procedures.some(p => p.procedure === 'crown' || p.procedure === 'root-canal')) {
      recommendations.push("For major procedures like **Crowns** or **Root Canals**, dental schools often offer the best balance of quality and cost.");
    }


    // Generate Action Plan
    const plan = [
      { label: 'Get Quotes', detail: 'Call one Private Practice and one Dental School/Clinic to get a specific quote for your procedure.' },
      { label: 'Check Insurance', detail: 'Verify if your insurance is accepted at the Dental School or Community Clinic (many do accept PPO plans).' },
      { label: 'Ask for Payment Plans', detail: 'If the cost is still high, ask the provider about payment plans or third-party financing like CareCredit.' }
    ];

    setResult({
      chartData: [yourCosts],
      recommendations,
      plan,
    });
  };

  // Reset fields to blank
  const resetForm = () => {
    form.reset({
      procedures: [{ procedure: 'cleaning', quantity: 1, privatePracticeCost: undefined, dentalSchoolCost: undefined, communityClinicCost: undefined }],
      insuranceCoverage: undefined,
    });
    setResult(null);
  };

  // Set default to blank
  useEffect(() => {
    resetForm();
  }, []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5" />
            Dental Cost Comparison Calculator
          </CardTitle>
          <CardDescription>
            Compare estimated costs of dental procedures across different provider types. Use national averages or input your own costs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Dental Procedures</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-lg relative space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Procedure {index + 1}</h4>
                        <Button type="button" variant="ghost" size="icon" className="-mt-2 -mr-2" onClick={() => remove(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={`procedures.${index}.procedure`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Procedure</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select procedure" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cleaning">Cleaning</SelectItem>
                                  <SelectItem value="filling">Filling</SelectItem>
                                  <SelectItem value="crown">Crown</SelectItem>
                                  <SelectItem value="root-canal">Root Canal</SelectItem>
                                  <SelectItem value="extraction">Extraction</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`procedures.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Optional: Enter your known costs below to override averages.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`procedures.${index}.privatePracticeCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Private Practice Cost</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder={`Avg: ${formatNumberUS(PROCEDURE_COSTS[form.getValues(`procedures.${index}.procedure`) as keyof typeof PROCEDURE_COSTS]['Private Practice'])}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`procedures.${index}.dentalSchoolCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dental School Cost</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder={`Avg: ${formatNumberUS(PROCEDURE_COSTS[form.getValues(`procedures.${index}.procedure`) as keyof typeof PROCEDURE_COSTS]['Dental School'])}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`procedures.${index}.communityClinicCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Community Clinic Cost</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder={`Avg: ${formatNumberUS(PROCEDURE_COSTS[form.getValues(`procedures.${index}.procedure`) as keyof typeof PROCEDURE_COSTS]['Community Clinic'])}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ procedure: 'cleaning', quantity: 1, privatePracticeCost: undefined, dentalSchoolCost: undefined, communityClinicCost: undefined })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Procedure
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Insurance</h3>
                <FormField
                  control={form.control}
                  name="insuranceCoverage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Insurance Coverage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit">
                  Compare Costs
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
              <CardTitle>Your Estimated Dental Costs</CardTitle>
              <CardDescription>
                This comparison shows your estimated out-of-pocket costs at different provider types.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.chartData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatNumberUS(value)} />
                  <Tooltip formatter={(value: number) => formatNumberUS(value)} />
                  <Legend />
                  <Bar dataKey="Private Practice" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="Dental School" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="Community Clinic" fill="hsl(var(--chart-3))" />
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
          "name": "Dental Cost Comparison Calculator",
          "description": "Compare dental procedure costs across private practices, dental schools, and community clinics.",
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
              Understanding Dental Provider Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Dental care costs can vary dramatically depending on where you receive treatment. This calculator helps illustrate those differences.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Private Practice:</strong> A dental office owned by dentists. They typically offer the most personalized care and amenities but often have the highest costs.</li>
              <li><strong className="text-foreground">Dental School:</strong> Clinics at universities where dental students provide treatment under the close supervision of experienced, licensed dentists. Costs are significantly lower, but appointments may take longer.</li>
              <li><strong className="text-foreground">Community Clinic:</strong> Non-profit or government-funded clinics that aim to provide affordable care. They are a good middle-ground option for cost-effective care from licensed dentists.</li>
            </ul>
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
              <h4 className="font-semibold text-foreground mb-2">Total Procedure Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Total Cost = SUM(Procedure Cost * Quantity)</p>
              <p className="mt-2">For each provider type, the calculator first determines the cost for each procedure you've added. If you provide a custom cost, it uses that; otherwise, it uses the national average. It then multiplies that cost by the quantity.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Out-of-Pocket Cost</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Your Cost = Total Cost * (1 - Insurance Coverage %)</p>
              <p className="mt-2">After calculating the total bill for each provider type, your insurance coverage percentage is applied to determine your final out-of-pocket expense. This does not account for deductibles or annual maximums.</p>
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
              <li><Link href="/finance/hospital-stay-cost-by-specialty-calculator" className="hover:underline">Hospital Stay Cost Estimator</Link></li>
              <li><Link href="/finance/health-insurance-subsidy-eligibility-calculator" className="hover:underline">Health Insurance Subsidy Calculator</Link></li>
              <li><Link href="/finance/copay-vs-deductible-breakeven-calculator" className="hover:underline">Copay vs Deductible Breakeven Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Saving Your Smile: A Guide to Affordable Dental Care</h1>
          <p className="text-lg italic">Dental health is crucial for overall well-being, but costs can be a major barrier. Learn how to find quality care that fits your budget by understanding your options.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Costs Vary So Much: The Business of Dentistry</h2>
          <p>Unlike medical care, where prices are heavily influenced by insurance negotiations, dental costs can be more transparent but also more varied. The primary factors driving the price differences shown in this calculator are overhead, mission, and materials.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Private Practices</strong> are for-profit businesses with high overhead costs. These include staff salaries, rent in prime locations, marketing, and acquiring advanced technology (like digital X-rays or 3D imaging). This structure results in higher prices but often provides more convenience, a wider range of services, and a higher-end patient experience. They also have more flexibility in the quality of materials used for things like crowns or fillings, which can affect the price.</li>
            <li><strong className="font-semibold">Dental Schools</strong> are educational institutions. Their primary mission is to train the next generation of dentists. They operate with educational subsidies and supervised student labor, allowing them to charge significantly less (often 50% or more) than private practices for the same procedure. The trade-off is often time, as appointments are longer due to supervision and teaching protocols.</li>
            <li><strong className="font-semibold">Community Clinics</strong>, including Federally Qualified Health Centers (FQHCs), are typically non-profits. Their mission is public health, and they receive government funding and grants to provide affordable care to underserved populations. They often use a sliding scale fee structure based on income, making them an essential resource for many.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Making the Right Choice for Your Situation</h2>
          <p>There is no single "best" option; the right choice depends on your priorities: cost, convenience, and complexity of care.</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold">Choose a Private Practice if:</strong> You value a long-term relationship with a specific dentist, need appointments that fit a tight schedule, have good dental insurance, and prefer a more comfortable, service-oriented environment.</li>
            <li><strong className="font-semibold">Choose a Dental School if:</strong> Your primary concern is cost, you have flexibility in your schedule, and you are comfortable with treatment being performed by students under strict supervision. It's an excellent option for major, expensive procedures like crowns, bridges, or root canals where the savings can be substantial.</li>
            <li><strong className="font-semibold">Choose a Community Clinic if:</strong> You have a limited income, are uninsured or underinsured, and are looking for quality, no-frills care from licensed professionals at a reduced cost. They are ideal for preventative and routine care.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Be a Proactive Patient and Reduce Costs</h2>
          <p>Don't let cost prevent you from getting necessary dental care. Use this calculator to understand your options, then take these steps:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong className="font-semibold text-foreground">Always Ask for a Pre-Treatment Estimate:</strong> Before any major work, ask your dentist for a detailed breakdown of costs. You can submit this to your insurance company to see exactly what they will cover.</li>
            <li><strong className="font-semibold text-foreground">Discuss Material Options:</strong> For procedures like crowns or fillings, there are often different material options at different price points (e.g., porcelain vs. metal crown). Ask your dentist what is clinically appropriate for your situation.</li>
            <li><strong className="font-semibold text-foreground">Inquire about Payment Plans:</strong> Many private practices offer in-house financing or work with third-party lenders like CareCredit to help you spread out the cost of treatment over time.</li>
            <li><strong className="font-semibold text-foreground">Focus on Prevention:</strong> The cheapest dental care is the care you don't need. Regular check-ups, cleanings, and good home care (brushing and flossing) can prevent small problems from becoming large, expensive ones.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: An Informed Patient is an Empowered Patient</h2>
          <p>Navigating the cost of dental care can be intimidating, but you have more control than you might think. By understanding the different provider types, asking the right questions, and prioritizing preventative care, you can maintain your dental health without breaking the bank. Use this tool as your starting point to becoming a more informed and empowered patient.</p>
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
              <h4 className="font-semibold mb-2">Is the quality of care lower at a dental school or community clinic?</h4>
              <p className="text-muted-foreground">Not necessarily. At dental schools, all work is meticulously checked by experienced, licensed faculty. It can be a great way to get high-quality work done affordably. Community clinics are staffed by licensed dentists and hygienists focused on public health. The primary difference is often in the amenities, appointment length, and range of services, not the quality of the clinical work itself.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Do dental schools accept insurance?</h4>
              <p className="text-muted-foreground">Many do, but not all. It's essential to call and confirm beforehand. Even if they accept your insurance, you will be responsible for any co-pays or portions not covered, though the base cost will be much lower, maximizing your insurance benefits.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's a "sliding scale fee"?</h4>
              <p className="text-muted-foreground">This is a payment model used by many community clinics where the fee for services is adjusted based on your income. You will typically need to provide proof of income (like a tax return or pay stubs) to qualify for a lower rate.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How can I find a dental school or community clinic near me?</h4>
              <p className="text-muted-foreground">You can search online for "dental schools near me" or check the American Dental Association (ADA) website. For community clinics, the Health Resources and Services Administration (HRSA) has a search tool for finding Federally Qualified Health Centers (FQHCs).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if I need a specialist, like an endodontist or oral surgeon?</h4>
              <p className="text-muted-foreground">Dental schools often have specialty departments (endodontics, periodontics, oral surgery) where you can get advanced care at a lower cost. Community clinics may refer you to a specialist, but some larger clinics have them on staff.</p>
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
            <p>This calculator highlights the significant cost variations for identical dental procedures across different provider settings. By comparing costs at private practices, dental schools, and community clinics—and allowing you to input your own known costs—it empowers you to make informed decisions based on your budget and priorities, potentially saving you hundreds or thousands of dollars on dental care.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
