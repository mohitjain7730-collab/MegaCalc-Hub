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
import { Zap, Flame, Drumstick, Salad, Croissant, Calendar } from 'lucide-react';

const formSchema = z.object({
  proteinGrams: z.number().min(0).max(200).optional(),
  carbGrams: z.number().min(0).max(300).optional(),
  fatGrams: z.number().min(0).max(150).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  totalCalories: number;
  tefMin: number;
  tefMax: number;
  tefPercentRange: [number, number];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Log meals with macros and note how you feel (energy, hunger) afterward' },
  { week: 2, focus: 'Increase lean protein at breakfast to leverage higher TEF early in the day' },
  { week: 3, focus: 'Swap refined carbs for whole-food sources to modestly raise digestive cost' },
  { week: 4, focus: 'Evaluate hydration and fiber intake—both support digestion and satiety' },
  { week: 5, focus: 'Batch cook high-protein lunches to maintain consistency during busy weeks' },
  { week: 6, focus: 'Experiment with meal timing (pre/post workout) to maximize recovery and appetite control' },
  { week: 7, focus: 'Assess body composition and adjust macros if fat loss or muscle gain stalls' },
  { week: 8, focus: 'Plan long-term macro balance that fits your lifestyle and supports metabolic health' },
];

const faqs: [string, string][] = [
  ['What is the thermic effect of food?', 'The thermic effect of food (TEF) is the energy required to digest, absorb, and metabolize the nutrients in a meal. It typically accounts for 5–15% of total daily energy expenditure.'],
  ['Which macronutrient has the highest TEF?', 'Protein has the highest TEF (20–30%), carbohydrates are moderate (5–10%), and fats are lowest (0–3%). Fiber and minimally processed foods may increase TEF slightly.'],
  ['Can TEF help with weight loss?', 'A higher TEF can modestly increase daily calorie burn, especially when protein intake is high. However, total calorie balance and activity remain the main drivers of weight change.'],
  ['Does meal timing affect TEF?', 'TEF occurs after each meal regardless of timing. Distributing protein across meals can stabilize blood sugar and appetite, indirectly supporting weight management.'],
  ['How accurate is this calculator?', 'It uses established ranges for each macro. Individual responses vary with gut health, food processing, and metabolic differences, so treat results as estimates.'],
  ['Do liquids have the same TEF as whole foods?', 'Liquids or highly processed foods are often digested more easily, resulting in a slightly lower TEF compared with whole-food equivalents.'],
  ['What about mixed meals?', 'This calculator accounts for mixed meals by summing macro-specific TEF estimates. Actual TEF depends on cooking methods, fiber, and individual physiology.'],
  ['Should I prioritize TEF or total calories?', 'Total calories and nutrient quality matter most. Use TEF as a bonus when optimizing protein intake, satiety, and metabolic health.'],
  ['Does TEF change with dieting?', 'Extended caloric deficits can modestly reduce TEF due to adaptive thermogenesis. Maintaining protein intake helps offset the decline.'],
  ['Can supplements raise TEF?', 'Some thermogenic supplements may slightly increase energy expenditure, but consistent meal planning, protein intake, and activity deliver more reliable results.'],
];

const understandingInputs = [
  { label: 'Protein (g)', description: 'Total grams of protein in the meal. Higher protein raises TEF more than other macros.' },
  { label: 'Carbohydrates (g)', description: 'Total grams of carbs consumed, including fiber and sugars.' },
  { label: 'Fat (g)', description: 'Total grams of dietary fat in the meal.' },
];

const calculateTef = ({ proteinGrams = 0, carbGrams = 0, fatGrams = 0 }: FormValues) => {
  const proteinCalories = proteinGrams * 4;
  const carbCalories = carbGrams * 4;
  const fatCalories = fatGrams * 9;
  const totalCalories = proteinCalories + carbCalories + fatCalories;

  const tefMin = proteinCalories * 0.20 + carbCalories * 0.05 + fatCalories * 0.00;
  const tefMax = proteinCalories * 0.30 + carbCalories * 0.10 + fatCalories * 0.03;

  const percentMin = totalCalories > 0 ? (tefMin / totalCalories) * 100 : 0;
  const percentMax = totalCalories > 0 ? (tefMax / totalCalories) * 100 : 0;

  return {
    totalCalories,
    tefMin,
    tefMax,
    percentRange: [percentMin, percentMax] as [number, number],
  };
};

const interpret = (percentRange: [number, number]) => {
  if (percentRange[0] >= 10) return 'This meal has a high thermic effect—expect greater post-meal calorie burn thanks to substantial protein and whole-food content.';
  if (percentRange[1] >= 8) return 'Thermic effect is moderate. Consistent protein and fiber intake keep TEF elevated throughout the day.';
  return 'Thermic effect is modest. Consider increasing protein or whole-food ingredients if you want a higher digestion cost.';
};

const recommendations = (percentRange: [number, number]) => [
  percentRange[1] < 8
    ? 'Increase lean protein or legumes to raise TEF and satiety'
    : 'Distribute protein evenly across meals to maintain elevated TEF',
  'Choose minimally processed carbs and fiber-rich vegetables to prolong digestion',
  'Pair meals with resistance training or NEAT to amplify total daily energy expenditure',
];

const warningSigns = () => [
  'Digestive discomfort after high-protein meals may signal the need for gradual increases and adequate hydration',
  'Very low calorie or restrictive diets can suppress TEF and energy—monitor overall intake',
  'Consult a healthcare provider if you have digestive disorders or metabolic diseases before making major dietary changes',
];

export default function ThermicEffectOfFoodCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proteinGrams: undefined,
      carbGrams: undefined,
      fatGrams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { proteinGrams, carbGrams, fatGrams } = values;
    if (proteinGrams == null && carbGrams == null && fatGrams == null) {
      setResult(null);
      return;
    }

    const { totalCalories, tefMin, tefMax, percentRange } = calculateTef(values);

    setResult({
      status: 'Calculated',
      interpretation: interpret(percentRange),
      recommendations: recommendations(percentRange),
      warningSigns: warningSigns(),
      plan: plan(),
      totalCalories: Math.round(totalCalories),
      tefMin: Math.round(tefMin),
      tefMax: Math.round(tefMax),
      tefPercentRange: [Math.round(percentRange[0] * 10) / 10, Math.round(percentRange[1] * 10) / 10],
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> Thermic Effect of Food (TEF)</CardTitle>
          <CardDescription>Estimate digestion energy cost based on meal macronutrients.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="proteinGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Drumstick className="h-4 w-4" /> Protein (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 30"
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
                  name="carbGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Salad className="h-4 w-4" /> Carbohydrates (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 60"
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
                  name="fatGrams"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Croissant className="h-4 w-4" /> Fat (g)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 20"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate TEF</Button>
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
                <CardTitle>TEF Summary</CardTitle>
              </div>
              <CardDescription>Estimated digestion energy cost for this meal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Meal Calories</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">TEF Range</h4>
                  <p className="text-2xl font-bold text-primary">{result.tefMin}–{result.tefMax} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Percent of Meal</h4>
                  <p className="text-2xl font-bold text-primary">{result.tefPercentRange[0]}–{result.tefPercentRange[1]}%</p>
                </div>
              </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Metabolic Meal Plan</CardTitle>
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
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Identify the macro values needed for a TEF estimate</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {understandingInputs.map((item) => (
              <li key={item.label}>
                <span className="font-semibold text-foreground">{item.label}:</span>
                <span className="text-sm text-muted-foreground"> {item.description}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complement TEF estimates with other nutrition tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4><p className="text-sm text-muted-foreground">Design balanced meals aligned with goals.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Set daily targets before layering in TEF.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/adaptive-thermogenesis-calculator" className="text-primary hover:underline">Adaptive Thermogenesis</Link></h4><p className="text-sm text-muted-foreground">Account for metabolic slowdowns during dieting.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cheat-meal-impact-on-weekly-calories-calculator" className="text-primary hover:underline">Cheat Meal Impact</Link></h4><p className="text-sm text-muted-foreground">Balance higher-calorie meals within weekly totals.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Maximizing TEF Strategically</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Elevating TEF begins with protein-rich, minimally processed meals supported by fiber, hydration, and regular activity. Track how macro balance affects hunger, performance, and body composition to refine your nutrition plan.</p>
          <p>This calculator offers a structured estimate. Combine the results with consistent food logging, strength training, and recovery practices for sustainable metabolic progress.</p>
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
