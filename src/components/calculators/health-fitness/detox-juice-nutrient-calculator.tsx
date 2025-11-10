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
import { Zap, Droplet, Apple, Leaf, BarChart3, Calendar, Flame } from 'lucide-react';

const formSchema = z.object({
  servings: z.number().min(1).max(10).optional(),
  caloriesPerServing: z.number().min(20).max(400).optional(),
  sugarPerServing: z.number().min(0).max(60).optional(),
  fiberPerServing: z.number().min(0).max(15).optional(),
  vitaminCPerServing: z.number().min(0).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  totalCalories: number;
  totalSugar: number;
  totalFiber: number;
  totalVitaminC: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Audit current juice recipes and serving sizes' },
  { week: 2, focus: 'Swap at least half the fruit for leafy greens to cut sugar' },
  { week: 3, focus: 'Add fiber sources (chia, flax, psyllium) or switch to smoothies' },
  { week: 4, focus: 'Pair juices with protein-rich snacks to stabilize blood sugar' },
  { week: 5, focus: 'Rotate ingredients to diversify phytonutrients and flavor' },
  { week: 6, focus: 'Limit juice calories to fit within weekly energy targets' },
  { week: 7, focus: 'Monitor digestion, energy, and cravings; adjust sugar accordingly' },
  { week: 8, focus: 'Create go-to recipes for training days, rest days, and recovery' },
];

const faqs: [string, string][] = [
  ['Are detox juices healthy?', 'They can provide vitamins and hydration but often lack protein, fiber, and healthy fats. Evaluate sugar content and balance juices with whole-food meals to prevent nutrient gaps.'],
  ['How much sugar is too much in a juice?', 'Nutrition guidelines suggest keeping added sugars under 25–36 g per day. Many juices exceed this in a single serving, so aim for less than 20 g per serving and prioritize whole fruits and vegetables.'],
  ['Should I juice or blend?', 'Blending (smoothies) retains fiber, which helps control blood sugar and improves satiety. Juicing removes most fiber, making sugar hit the bloodstream faster. Choose based on your goals and digestion.'],
  ['How can I add more fiber to juices?', 'Add chia seeds, ground flax, psyllium husk, or blend in leafy greens and whole fruits. Alternatively, pair the juice with fiber-rich snacks such as nuts or raw vegetables.'],
  ['Do detox juices help with weight loss?', 'They can create a calorie deficit if used to replace higher-calorie meals. However, the low protein and high sugar can lead to hunger and muscle loss. Track total calories and macronutrients for sustainable results.'],
  ['What’s a good serving size?', 'A serving of 8–12 oz (250–350 ml) is typical. Larger portions add significant sugar and calories without additional fiber. Stick to one serving unless it replaces a meal and includes protein.'],
  ['Can I drink detox juice daily?', 'Yes, if it fits your calories and macros, and you still consume adequate protein, fiber, and micronutrients. Rotate ingredients and monitor how your body responds.'],
  ['How do I reduce the sugar content?', 'Use more vegetables (cucumber, celery, kale), herbs (mint, parsley), and a squeeze of citrus instead of multiple sweet fruits. Consider diluting high-sugar juices with water or sparkling water.'],
  ['Should I take supplements with my juice?', 'A multivitamin or specific supplements may be helpful if your diet lacks certain micronutrients, but focus on whole-food variety first. Consult a healthcare professional before supplementing heavily.'],
  ['How do I store juices safely?', 'Cold-press juices can be refrigerated in airtight containers for up to 72 hours. Oxidation and nutrient loss increase over time, so consume as fresh as possible or freeze in portions.'],
];

export default function DetoxJuiceNutrientCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      servings: undefined,
      caloriesPerServing: undefined,
      sugarPerServing: undefined,
      fiberPerServing: undefined,
      vitaminCPerServing: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { servings, caloriesPerServing, sugarPerServing, fiberPerServing, vitaminCPerServing } = values;
    if (
      servings == null ||
      caloriesPerServing == null ||
      sugarPerServing == null ||
      fiberPerServing == null ||
      vitaminCPerServing == null
    ) {
      setResult(null);
      return;
    }

    const totalCalories = servings * caloriesPerServing;
    const totalSugar = servings * sugarPerServing;
    const totalFiber = servings * fiberPerServing;
    const totalVitaminC = servings * vitaminCPerServing;

    const interpretation =
      totalSugar > 60
        ? 'High sugar load—consider more vegetables or dilution to control blood glucose spikes.'
        : totalFiber >= 8
        ? 'Balanced micronutrient profile with solid fiber support.'
        : 'Moderate sugar with limited fiber—pair with protein and healthy fats to stabilize energy.';

    const recommendations = [
      'Cap juice calories within your daily energy budget to avoid hidden surpluses',
      'Blend or pair juices with lean protein to maintain muscle and satiety',
      'Rotate produce to cover a spectrum of antioxidants and phytonutrients',
    ];

    const warningSigns = [
      'Frequent energy crashes or cravings can signal excess liquid sugar',
      'Digestive upset may indicate low fiber or poor ingredient balance',
      'People with blood sugar concerns should monitor glucose response closely',
    ];

    setResult({
      status: 'Calculated',
      interpretation,
      recommendations,
      warningSigns,
      plan: plan(),
      totalCalories: Math.round(totalCalories),
      totalSugar: Math.round(totalSugar),
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalVitaminC: Math.round(totalVitaminC),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplet className="h-5 w-5" /> Detox Juice Nutrient Analyzer</CardTitle>
          <CardDescription>Evaluate calories, sugar, fiber, and vitamin C across your juice servings</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Servings</FormLabel>
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
                  name="caloriesPerServing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Calories / Serving</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 160"
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
                  name="sugarPerServing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Apple className="h-4 w-4" /> Sugar / Serving (g)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="fiberPerServing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Fiber / Serving (g)</FormLabel>
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
                  name="vitaminCPerServing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Vitamin C / Serving (mg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="10"
                          placeholder="e.g., 120"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Analyze Juice</Button>
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
                <CardTitle>Juice Nutrition Summary</CardTitle>
              </div>
              <CardDescription>Total intake across your chosen servings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold">Calories</h4>
                  <p className="text-primary text-lg font-bold">{result.totalCalories} kcal</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold">Sugar</h4>
                  <p className="text-primary text-lg font-bold">{result.totalSugar} g</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold">Fiber</h4>
                  <p className="text-primary text-lg font-bold">{result.totalFiber} g</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold">Vitamin C</h4>
                  <p className="text-primary text-lg font-bold">{result.totalVitaminC} mg</p>
                </div>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Optimization Plan</CardTitle>
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
          <CardDescription>Balance juices with overall nutrition goals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Anchor juice intake within your energy budget.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary hover:underline">Glycemic Load Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess blood sugar impact of meals and juices.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">Fiber Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Ensure total daily fiber hits health-promoting targets.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sugar-intake-calculator" className="text-primary hover:underline">Sugar Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Monitor added sugar alongside natural fruit sugars.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Smarter Juicing</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Juices concentrate nutrients but also calories and sugars. Prioritize vegetable-heavy recipes, integrate fiber boosters, and pair with protein to stabilize energy. View juice as a supplement to—not replacement for—balanced meals.</p>
          <p>Track weekly totals so that juice complements your training, hydration, and recovery goals. Revisit recipes seasonally to capture a broad array of vitamins, minerals, and phytonutrients without exceeding your calorie needs.</p>
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


