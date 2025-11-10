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
import { Zap, Leaf, Drumstick, WheatOff, Calendar } from 'lucide-react';

const formSchema = z.object({
  paleoServings: z.number().min(0).max(30).optional(),
  nonPaleoServings: z.number().min(0).max(30).optional(),
  processedServings: z.number().min(0).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  scorePercent: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Audit current meals and identify top non-Paleo staples' },
  { week: 2, focus: 'Replace breakfast grain/dairy items with protein and produce' },
  { week: 3, focus: 'Prepare two batch-cooked Paleo lunches for busy days' },
  { week: 4, focus: 'Experiment with Paleo-friendly starches (sweet potatoes, plantains)' },
  { week: 5, focus: 'Evaluate digestion, energy, and cravings; adjust carbohydrate load' },
  { week: 6, focus: 'Introduce supportive supplements if bloodwork indicates gaps (e.g., vitamin D, omega-3s)' },
  { week: 7, focus: 'Plan social strategies: bring dishes to gatherings or pre-eat protein' },
  { week: 8, focus: 'Reassess score, set long-term flex guidelines for grains/dairy if tolerated' },
];

const faqs: [string, string][] = [
  ['What is a Paleo compliance score?', 'It is an estimate of how closely your daily intake matches Paleo-style guidelines: whole foods, animal proteins, vegetables, fruits, nuts, and healthy fats while minimizing grains, legumes, dairy, and processed foods.'],
  ['How many Paleo servings should I eat?', 'There is no universal target, but many aim for 8–12 servings of animal protein, vegetables, and fruit combined each day, adjusted for calorie needs and activity levels.'],
  ['Can I include dairy or legumes?', 'Many people tolerate full-fat dairy or properly prepared legumes. Track how your body responds and adjust. The calculator treats them as non-Paleo but allows individual flexibility.'],
  ['How do I transition to a Paleo diet?', 'Start by swapping ultra-processed meals for whole-food options, increase protein and vegetables, and reduce refined grains and added sugars gradually to avoid digestive discomfort.'],
  ['Is Paleo automatically low carb?', 'Not necessarily. Sweet potatoes, fruit, and certain tubers can provide ample carbohydrates. Adjust intake to suit your performance and body composition goals.'],
  ['What about fiber and micronutrients?', 'A Paleo approach rich in vegetables, fruits, and tubers usually meets fiber and micronutrient needs. Monitor labs and consider supplementation if deficiencies persist.'],
  ['How does Paleo impact gut health?', 'Reducing processed foods and increasing whole foods may improve microbiome diversity for some people. Others may need resistant starch or fermented foods to support gut health.'],
  ['Can athletes follow Paleo?', 'Yes. Ensure adequate carbohydrate intake around training and consider carbohydrate refeed meals or strategic use of tolerated grains if performance declines.'],
  ['Is Paleo suitable for weight loss?', 'It can be effective due to increased satiety and reduced processed foods. Track calorie intake and adjust fat portions to maintain an appropriate energy deficit.'],
  ['What if I crave non-Paleo foods?', 'Plan intentional flexibility like 80/20 compliance, recreate favorites with Paleo ingredients, or integrate occasional treats while monitoring how you feel.'],
];

const interpret = (score: number) => {
  if (score >= 80) return 'High Paleo alignment—most meals center around whole foods and minimal processed ingredients.';
  if (score >= 55) return 'Moderate alignment—continue swapping grains, dairy, and packaged snacks for whole sources.';
  return 'Low alignment—focus on incremental changes such as replacing processed snacks, sugary drinks, and refined grains.';
};

const recommendations = (score: number) => [
  'Center each meal on animal or plant protein plus vegetables and healthy fats',
  'Batch-cook staples (roasted meats, root vegetables, broths) to reduce reliance on processed foods',
  score < 55
    ? 'Transition gradually: remove sugary beverages first, then processed snacks, then refined grains'
    : 'Experiment with fermented foods, organ meats, or bone broth to diversify micronutrients',
];

const warningSigns = () => [
  'Persistently low energy or poor lab markers may indicate insufficient carbs, fats, or micronutrients—adjust portions or consult a dietitian',
  'Overly restrictive Paleo interpretations can lead to under-eating; maintain adequate calories for activity level',
  'Monitor tolerance when reintroducing dairy/legumes; digestive symptoms may signal the need for moderation',
];

export default function PaleoComplianceScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paleoServings: undefined,
      nonPaleoServings: undefined,
      processedServings: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { paleoServings, nonPaleoServings, processedServings } = values;
    if (paleoServings == null || nonPaleoServings == null || processedServings == null) {
      setResult(null);
      return;
    }

    const totalPositive = paleoServings * 4;
    const totalNegative = nonPaleoServings * 2 + processedServings * 3;
    const rawScore = Math.max(0, Math.min(100, totalPositive - totalNegative));

    setResult({
      status: 'Calculated',
      interpretation: interpret(rawScore),
      recommendations: recommendations(rawScore),
      warningSigns: warningSigns(),
      plan: plan(),
      scorePercent: Math.round(rawScore),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" /> Paleo Compliance Score</CardTitle>
          <CardDescription>Estimate daily alignment with Paleo-style whole food guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="paleoServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Drumstick className="h-4 w-4" /> Paleo Servings (protein/veg/fruit)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 10"
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
                  name="nonPaleoServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><WheatOff className="h-4 w-4" /> Grains/Dairy/Legumes Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
                  name="processedServings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Zap className="h-4 w-4" /> Processed Food Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
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
              <Button type="submit" className="w-full md:w-auto">Calculate Compliance</Button>
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
                <CardTitle>Paleo Alignment Summary</CardTitle>
              </div>
              <CardDescription>Higher percentages reflect closer adherence to Paleo-style eating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.scorePercent} %</p>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Paleo Transition Plan</CardTitle>
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
          <CardDescription>Nutrition tools to support Paleo alignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4><p className="text-sm text-muted-foreground">Balance proteins, fats, and carbs for Paleo meals.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Align portion sizes with energy requirements.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">Fiber Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Confirm adequate fiber from vegetables and fruits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vitamin-mineral-rda-tracker-calculator" className="text-primary hover:underline">Micronutrient Tracker</Link></h4><p className="text-sm text-muted-foreground">Ensure Paleo choices cover vitamin and mineral targets.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Maintaining Paleo Flexibility</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Use the Paleo framework as a tool to emphasize nutrient-dense whole foods. Adjust carbohydrate and fat levels based on training demands, health markers, and tolerance to foods traditionally excluded from Paleo templates.</p>
          <p>Gradually introduce or remove foods while monitoring energy, digestion, sleep, and labs. Sustainable compliance comes from flexibility, meal preparation habits, and aligned lifestyle choices.</p>
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


