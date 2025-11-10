'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, Apple, Leaf, Droplets, Wheat, Calendar } from 'lucide-react';

const formSchema = z.object({
  fructans: z.number().min(0).max(20).optional(),
  lactose: z.number().min(0).max(40).optional(),
  polyols: z.number().min(0).max(30).optional(),
  excessFructose: z.number().min(0).max(30).optional(),
  galactans: z.number().min(0).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  totalLoad: number;
  groupTotals: { label: string; value: number }[];
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Track daily FODMAP intake and note symptom timing/intensity' },
  { week: 2, focus: 'Remove the highest FODMAP category (e.g., lactose) for 7–14 days' },
  { week: 3, focus: 'Reintroduce the removed category in controlled portions while logging symptoms' },
  { week: 4, focus: 'Repeat reintroduction for the next category to isolate triggers' },
  { week: 5, focus: 'Build a personalized low-FODMAP meal plan using tolerated foods' },
  { week: 6, focus: 'Add gut-supportive elements (fiber diversity, probiotics) if tolerated' },
  { week: 7, focus: 'Coordinate with a dietitian to liberalize diet and avoid nutrient gaps' },
  { week: 8, focus: 'Establish long-term maintenance, rotating tolerated foods to protect microbiome health' },
];

const faqs: [string, string][] = [
  ['What are FODMAPs?', 'FODMAPs are fermentable carbohydrates (fructans, lactose, polyols, excess fructose, galactans) that can trigger gas, bloating, and GI symptoms in sensitive individuals, especially those with IBS.'],
  ['How do I use this calculator?', 'Enter approximate grams of each FODMAP group consumed in a meal or day. The calculator sums the load to help you identify whether your intake is low, moderate, or high.'],
  ['What counts as a low FODMAP load?', 'Although tolerance varies, many IBS protocols target less than 10 g total per meal and under 20 g per day during elimination phases. Use personal tolerance and dietitian guidance for precise targets.'],
  ['How accurate are food FODMAP values?', 'Values can vary by ripeness, processing, and portion size. Use reliable databases (Monash University, accredited dietitians) and keep a symptom journal to tailor the plan.'],
  ['Can I stay on a low-FODMAP diet forever?', 'Long-term strict FODMAP restriction may reduce beneficial gut bacteria. The diet is typically implemented as elimination, reintroduction, then personalization to include as many foods as tolerated.'],
  ['Do FODMAPs affect everyone?', 'No. Many people digest FODMAPs without issue. They primarily trigger symptoms in individuals with IBS, SIBO, or other functional gut disorders.'],
  ['How do I reintroduce FODMAPs?', 'Test one group at a time in gradually increasing portions over 3–4 days while monitoring symptoms. Work with a dietitian for structure and to avoid unnecessary restrictions.'],
  ['Can I combine FODMAP groups in one meal?', 'Yes, but cumulative load matters. Even tolerated foods can provoke symptoms if multiple FODMAP groups are consumed in large amounts simultaneously.'],
  ['What other factors influence symptoms?', 'Stress, sleep, hormones, and gut microbiome health all affect symptom severity. Pair diet adjustments with lifestyle and stress-management strategies.'],
  ['Should I take supplements?', 'Digestive enzymes, probiotics, or prebiotics may help some people. Introduce supplements cautiously and preferably under professional guidance, especially during elimination phases.'],
];

const interpret = (total: number) => {
  if (total > 25) return 'High FODMAP load—likely to provoke symptoms in sensitive individuals. Consider reducing portions or distributing foods across meals.';
  if (total > 12) return 'Moderate load—monitor tolerance and consider reducing one or two FODMAP groups on this day.';
  return 'Low load—generally tolerated during elimination phases, though individual responses vary.';
};

const recommendations = (groupTotals: { label: string; value: number }[]) => [
  'Prioritize tolerated low-FODMAP vegetables, proteins, and grains to maintain nutrient diversity',
  'Distribute FODMAP portions throughout the day instead of consuming multiple high-FODMAP foods at one meal',
  groupTotals.reduce((max, current) => (current.value > max.value ? current : max), groupTotals[0]).value > 8
    ? `Focus on moderating ${groupTotals.reduce((max, current) => (current.value > max.value ? current : max), groupTotals[0]).label} servings—they contribute most to your load`
    : 'Gradually test higher-FODMAP foods in small amounts to expand dietary variety',
];

const warningSigns = () => [
  'Rapid weight loss or nutrient gaps can occur on overly restrictive low-FODMAP diets; consult a dietitian if intake becomes limited',
  'Persistent symptoms despite low loads may indicate other GI issues requiring medical evaluation',
  'Reintroduce foods cautiously to avoid unnecessary long-term restriction and microbiome depletion',
];

export default function FodmapLoadCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fructans: undefined,
      lactose: undefined,
      polyols: undefined,
      excessFructose: undefined,
      galactans: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { fructans, lactose, polyols, excessFructose, galactans } = values;
    if (
      fructans == null ||
      lactose == null ||
      polyols == null ||
      excessFructose == null ||
      galactans == null
    ) {
      setResult(null);
      return;
    }

    const groupTotals = [
      { label: 'Fructans', value: fructans },
      { label: 'Lactose', value: lactose },
      { label: 'Polyols', value: polyols },
      { label: 'Excess Fructose', value: excessFructose },
      { label: 'Galactans', value: galactans },
    ];
    const totalLoad = groupTotals.reduce((sum, group) => sum + group.value, 0);

    setResult({
      status: 'Calculated',
      interpretation: interpret(totalLoad),
      recommendations: recommendations(groupTotals),
      warningSigns: warningSigns(),
      plan: plan(),
      totalLoad: Math.round(totalLoad * 10) / 10,
      groupTotals,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Apple className="h-5 w-5" /> FODMAP Load Calculator</CardTitle>
          <CardDescription>Estimate the combined intake of key FODMAP carbohydrate groups</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="fructans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Fructans (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 3"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lactose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Lactose (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 6"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="polyols"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Wheat className="h-4 w-4" /> Polyols (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="excessFructose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Apple className="h-4 w-4" /> Excess Fructose (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 4"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="galactans"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Galactans (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate FODMAP Load</Button>
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
                <CardTitle>Total FODMAP Load</CardTitle>
              </div>
              <CardDescription>Summed intake across key FODMAP categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-primary">{result.totalLoad} g</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Group</th>
                      <th className="text-left p-2">Grams</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.groupTotals.map((group) => (
                      <tr key={group.label} className="border-b">
                        <td className="p-2">{group.label}</td>
                        <td className="p-2">{Math.round(group.value * 10) / 10}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.warningSigns.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Low-FODMAP Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Week</th>
                      <th className="text-left p-2">Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.plan.map((step) => (
                      <tr key={step.week} className="border-b">
                        <td className="p-2">{step.week}</td>
                        <td className="p-2">{step.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Support gut health and personalized nutrition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary hover:underline">Glycemic Load Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess blood sugar impact of meals alongside FODMAP load.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">Fiber Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Ensure fiber sufficiency even while limiting certain carbohydrates.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/plant-based-protein-gap-calculator" className="text-primary hover:underline">Plant-Based Protein Gap</Link></h4><p className="text-sm text-muted-foreground">Balance protein while selecting gut-friendly ingredients.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary hover:underline">Hydration Needs</Link></h4><p className="text-sm text-muted-foreground">Optimize hydration to support digestion and symptom management.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Navigating FODMAPs</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>A staged low-FODMAP approach helps identify trigger carbohydrates while maintaining nutritional adequacy. Combine elimination, systematic reintroduction, and personalized maintenance to broaden food variety without aggravating symptoms.</p>
          <p>Work with a healthcare professional for medical conditions, ensure adequate calories, and integrate stress management, sleep, and movement to complement dietary changes.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([question, answer], index) => (
            <div key={index}>
              <h4 className="font-semibold mb-1">{question}</h4>
              <p className="text-sm text-muted-foreground">{answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


