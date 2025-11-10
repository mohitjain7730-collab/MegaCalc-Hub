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
import { Zap, Leaf, Drumstick, Scale, Calendar } from 'lucide-react';

const formSchema = z.object({
  bodyMassKg: z.number().min(30).max(200).optional(),
  targetProteinPerKg: z.number().min(0.8).max(2.2).optional(),
  currentProteinIntake: z.number().min(0).max(250).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type PlanStep = { week: number; focus: string };

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: PlanStep[];
  targetProtein: number;
  gapProtein: number;
  gapPercent: number;
};

const plan = (): PlanStep[] => [
  { week: 1, focus: 'Track protein intake for 3–5 days to establish a reliable baseline' },
  { week: 2, focus: 'Add a protein source (tofu, tempeh, seitan, legumes) to every main meal' },
  { week: 3, focus: 'Introduce high-protein snacks such as edamame, lupini beans, or protein shakes' },
  { week: 4, focus: 'Distribute protein evenly—aim for 20–35 g per meal to support muscle protein synthesis' },
  { week: 5, focus: 'Experiment with protein fortification (chia seeds, nutritional yeast, hemp hearts)' },
  { week: 6, focus: 'Evaluate digestion and adjust fiber or enzyme support if high-protein legumes cause discomfort' },
  { week: 7, focus: 'Re-test body composition or performance; adjust targets if training load changes' },
  { week: 8, focus: 'Develop a weekly meal rotation to maintain variety and adequate amino acid profiles' },
];

const faqs: [string, string][] = [
  ['How much protein do plant-based athletes need?', 'Most active individuals thrive on 1.2–2.0 g/kg bodyweight. Strength-focused or dieting athletes may target the higher end, while general health can be maintained with 0.8–1.2 g/kg.'],
  ['Is plant protein as effective as animal protein?', 'Plant proteins can match animal protein when total intake is adequate and diverse. Combining complementary sources (legumes + grains) ensures all essential amino acids.'],
  ['What are good plant-based protein sources?', 'Tofu, tempeh, seitan, lentils, chickpeas, black beans, quinoa, edamame, soy milk, plant-based protein powders, nuts, and seeds are excellent options.'],
  ['Do I need protein powder?', 'Not necessarily, but powders are convenient for closing gaps and hitting protein targets with minimal calories. Choose products with complete amino acid profiles and minimal additives.'],
  ['How do I avoid digestive issues?', 'Increase fiber gradually, soak or pressure-cook legumes, use digestive enzymes if needed, and ensure adequate hydration to tolerate higher fiber intake.'],
  ['Can plant-based diets support muscle gain?', 'Yes. Ensure a modest calorie surplus, adequate protein distribution, progressive resistance training, and sufficient recovery to support muscle growth.'],
  ['What about micronutrients?', 'Monitor vitamin B12, iron, zinc, calcium, iodine, and omega-3 fatty acids. Consider fortified foods or supplements to maintain optimal levels.'],
  ['How do I hit protein on low-calorie diets?', 'Use concentrated sources like seitan, soy products, and plant protein isolates. Emphasize vegetables with higher protein-to-calorie ratios and plan snacks strategically.'],
  ['Is the protein gap harmful?', 'Large, chronic gaps may impair recovery, immune function, and lean mass. Track intake, adjust meal composition, and consider professional guidance if the gap persists.'],
  ['How often should I reassess targets?', 'Recalculate every time body weight, training volume, or goals shift substantially. Regularly audit intake to ensure targets are met without excessive restriction.'],
];

const interpret = (gap: number, target: number) => {
  if (gap <= 0) return 'Target met—maintain your current meal structure and monitor consistency.';
  const gapPercent = (gap / target) * 100;
  if (gapPercent <= 15) return 'Slight shortfall—small adjustments to meals or snacks will close the gap.';
  if (gapPercent <= 30) return 'Moderate shortfall—add 15–25 g protein to two meals or use supplementation.';
  return 'Significant shortfall—restructure daily menus to include higher-protein staples and consider support from a dietitian.';
};

const recommendations = (gap: number) => [
  gap <= 0
    ? 'Maintain protein distribution across meals to preserve muscle protein synthesis.'
    : 'Add 15–20 g of protein to breakfast and post-training meals to close the gap.',
  'Leverage soy foods, seitan, high-protein legumes, and plant-based protein powders for convenience.',
  'Pair protein with vitamin C-rich produce to enhance iron absorption and overall nutrient density.',
];

const warningSigns = () => [
  'Persistent muscle soreness, poor recovery, or hair loss can signal inadequate protein or calories',
  'Excessive reliance on ultra-processed meat substitutes may introduce high sodium or saturated fats—balance with whole foods',
  'Digestive discomfort from legumes may require soaking, sprouting, or digestive enzyme support',
];

const understandingInputs = [
  { label: 'Body Mass (kg)', description: 'Current body weight used to scale daily protein targets.' },
  { label: 'Target Protein (g/kg)', description: 'Desired grams of protein per kilogram of bodyweight based on goals and activity.' },
  { label: 'Current Protein (g/day)', description: 'Average daily protein intake from food logs or tracking apps.' },
];

export default function PlantBasedProteinGapCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyMassKg: undefined,
      targetProteinPerKg: undefined,
      currentProteinIntake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { bodyMassKg, targetProteinPerKg, currentProteinIntake } = values;
    if (bodyMassKg == null || targetProteinPerKg == null || currentProteinIntake == null) {
      setResult(null);
      return;
    }

    const targetProtein = bodyMassKg * targetProteinPerKg;
    const gapProtein = Math.max(0, targetProtein - currentProteinIntake);
    const gapPercent = targetProtein > 0 ? (gapProtein / targetProtein) * 100 : 0;

    setResult({
      status: 'Calculated',
      interpretation: interpret(gapProtein, targetProtein),
      recommendations: recommendations(gapProtein),
      warningSigns: warningSigns(),
      plan: plan(),
      targetProtein: Math.round(targetProtein),
      gapProtein: Math.round(gapProtein),
      gapPercent: Math.round(gapPercent * 10) / 10,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Leaf className="h-5 w-5" /> Plant-Based Protein Gap</CardTitle>
          <CardDescription>Estimate daily protein targets versus current intake on a plant-forward diet</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bodyMassKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Body Mass (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 70"
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
                  name="targetProteinPerKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Drumstick className="h-4 w-4" /> Target Protein (g/kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.6"
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
                  name="currentProteinIntake"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Current Protein (g/day)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 90"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Protein Gap</Button>
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
                <CardTitle>Daily Protein Summary</CardTitle>
              </div>
              <CardDescription>Compare current intake to your personalized target</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Target Protein</h4>
                  <p className="text-2xl font-bold text-primary">{result.targetProtein} g</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Current Gap</h4>
                  <p className="text-2xl font-bold text-primary">{result.gapProtein} g</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-semibold text-sm text-muted-foreground">Gap (%)</h4>
                  <p className="text-2xl font-bold text-primary">{result.gapPercent}%</p>
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
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8-Week Protein Optimization Plan</CardTitle>
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
          <CardDescription>Clarify the data needed before evaluating your protein gap</CardDescription>
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
          <CardDescription>Support plant-forward macro planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">Protein Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Set baseline protein targets for different goals.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4><p className="text-sm text-muted-foreground">Balance carbs and fats while increasing protein.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary hover:underline">Fiber Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Ensure adequate fiber alongside higher protein meals.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/iron-intake-calculator" className="text-primary hover:underline">Iron Intake Calculator</Link></h4><p className="text-sm text-muted-foreground">Monitor iron intake when reducing animal products.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Plant-Based Protein Strategy</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Successful plant-based athletes combine diverse protein sources, adequate calories, and smart supplementation when needed. Enhance protein quality with soy, legumes, grains, nuts, and seeds, and distribute protein evenly to maximize muscle protein synthesis.</p>
          <p>Reassess intake regularly, especially during weight loss or heavy training cycles, and collaborate with sports dietitians to tailor macros and micronutrients for optimal performance.</p>
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


