'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

const formSchema = z.object({
  tdee: z.number().positive(),
  method: z.enum(['percentage', 'remainder']),
  fatPercentage: z.number().min(0).max(100).optional(),
  proteinGrams: z.number().nonnegative().optional(),
  carbGrams: z.number().nonnegative().optional(),
}).refine(data => {
    if (data.method === 'percentage') {
        return data.fatPercentage !== undefined;
    }
    return true;
}, {
    message: 'Fat percentage is required.',
    path: ['fatPercentage'],
}).refine(data => {
    if (data.method === 'remainder') {
        return data.proteinGrams !== undefined && data.carbGrams !== undefined;
    }
    return true;
}, {
    message: 'Protein and Carb grams are required.',
    path: ['proteinGrams'],
});


type FormValues = z.infer<typeof formSchema>;

export default function FatIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        tdee: undefined,
        method: 'percentage',
        fatPercentage: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let fatGrams;
    if (values.method === 'percentage' && values.fatPercentage) {
        fatGrams = (values.tdee * (values.fatPercentage / 100)) / 9;
    } else if (values.method === 'remainder' && values.proteinGrams !== undefined && values.carbGrams !== undefined) {
        const proteinCalories = values.proteinGrams * 4;
        const carbCalories = values.carbGrams * 4;
        const remainingCalories = values.tdee - (proteinCalories + carbCalories);
        fatGrams = remainingCalories / 9;
    }
    setResult(fatGrams ? Math.max(0, fatGrams) : null);
  };
  
  const method = form.watch('method');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Fat Intake
          </CardTitle>
          <CardDescription>
            Determine your optimal daily fat intake based on your calorie needs and macronutrient goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="tdee" render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Total Daily Calories (TDEE)</FormLabel>
                    <Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-xs text-primary underline">
                      (Calculate)
                    </Link>
                  </div>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Calculation Method</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="percentage" /></FormControl><FormLabel className="font-normal">By Percentage</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="remainder" /></FormControl><FormLabel className="font-normal">By Remainder (after protein & carbs)</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              {method === 'percentage' ? (
                <FormField control={form.control} name="fatPercentage" render={({ field }) => (
                  <FormItem><FormLabel>Desired Fat Percentage (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="proteinGrams" render={({ field }) => (
                    <FormItem><FormLabel>Daily Protein Goal (g)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="carbGrams" render={({ field }) => (
                    <FormItem><FormLabel>Daily Carb Goal (g)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              )}

              <Button type="submit">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result !== null && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Droplets className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recommended Daily Fat Intake</CardTitle>
                  <CardDescription>Personalized fat target in grams</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)} g</p>
                    <CardDescription>A healthy range for fat intake is typically 20-35% of total daily calories.</CardDescription>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Calories from fat: <span className="font-semibold text-foreground">{(result * 9).toFixed(0)} calories</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Percentage of total calories: {((result * 9 / form.getValues('tdee')) * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Daily Calories (TDEE)</h4>
              <p className="text-muted-foreground">
                Your Total Daily Energy Expenditure (TDEE) is the foundation for calculating fat intake. This represents all calories you burn in a day, including your basal metabolic rate and activity. You can calculate your TDEE using our Daily Calorie Needs Calculator.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Calculation Method: By Percentage</h4>
              <p className="text-muted-foreground">
                This method calculates fat intake based on a desired percentage of total calories. Most health organizations recommend 20-35% of calories from fat. For example, if your TDEE is 2,000 calories and you want 30% from fat, that's 600 calories from fat, which equals about 67 grams (since fat has 9 calories per gram).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Calculation Method: By Remainder</h4>
              <p className="text-muted-foreground">
                This method calculates how much fat you should eat after accounting for your protein and carbohydrate goals. Once you've allocated calories for protein (4 cal/g) and carbs (4 cal/g), the remaining calories are assigned to fat. This approach ensures you meet your protein and carb targets first, then let fat fill the rest.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fat Percentage Range</h4>
              <p className="text-muted-foreground">
                For most people, 20-35% of calories from fat is recommended. Very active athletes may prefer 20-25% to leave more room for carbohydrates, while those following lower-carb patterns may go up to 30-40% or more. Avoid going below 15-20% unless under medical supervision, as very low fat intake can impair hormone function and vitamin absorption.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other nutrition calculators to complete your macronutrient planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure (TDEE) to know your starting point for fat calculations.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal daily protein intake to balance with your fat goals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">
                    Carbohydrate Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Find your ideal daily carbohydrate intake to complete your macronutrient planning.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  See how your fat intake fits into your overall macronutrient distribution.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Complete Guide to Fat Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How Much Dietary Fat Do You Need?</h2>
            <p>A healthy intake typically lands between <strong>20–35% of calories</strong>. Use the calculator to set a gram target, then focus on food quality.</p>

            <h3 className="font-semibold text-foreground mt-6">Why Fat Matters</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Provides essential fatty acids (linoleic and alpha‑linolenic acids).</li>
              <li>Aids absorption of fat‑soluble vitamins A, D, E, K.</li>
              <li>Supports hormones, cell membranes, brain function, and satiety.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Fat Quality: Make Most Fats Unsaturated</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Monounsaturated:</strong> olive oil, avocado, nuts—great everyday staples.</li>
              <li><strong>Polyunsaturated (Omega‑3):</strong> salmon, sardines, trout, flax, chia, walnuts—aim for 2–3 servings fatty fish/week or EPA/DHA supplements if needed.</li>
              <li><strong>Saturated:</strong> butter, cheese, fatty meats—enjoy in moderation within your total fat budget.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Practical Targets</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Minimum intake:</strong> avoid chronically dipping far below ~15–20% of calories unless medically supervised.</li>
              <li><strong>High‑carb athletes:</strong> you may feel best on 20–25% fat to prioritize carbs for training.</li>
              <li><strong>Lower‑carb patterns:</strong> 30–40% fat (or more) can fit, provided protein and micronutrients are met.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Smart Cooking and Snacking</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use olive oil for sautés and dressings; avocado or canola oil for higher‑heat applications.</li>
              <li>Snack ideas: Greek yogurt + nuts, hummus + veggies, whole‑grain toast + peanut butter.</li>
              <li>Choose minimally processed foods; keep an eye on deep‑fried items and ultra‑processed snacks.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">What Is Dietary Fat?</h3>
            <p>
              Dietary fats are triglycerides composed of fatty acids. The <strong>saturation</strong> (number of double bonds) impacts
              how the fat behaves in the body and at cooking temperatures. Beyond calories, fats carry fat‑soluble vitamins and provide
              essential fats your body can't make.
            </p>

            <h4 className="font-semibold text-foreground">Types of Fat</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Monounsaturated (MUFA):</strong> olives, avocado, almonds, pistachios—cardiometabolic friendly.</li>
              <li><strong>Polyunsaturated (PUFA):</strong> includes omega‑6 and omega‑3; focus on <strong>EPA/DHA</strong> from fish.</li>
              <li><strong>Saturated:</strong> dairy fat and red meat; moderate intakes fit fine within a varied diet.</li>
              <li><strong>Trans fats:</strong> avoid industrial trans fats (partially hydrogenated oils).</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Omega‑3s: Why They Matter</h3>
            <p>
              Long‑chain omega‑3s (EPA/DHA) support heart, brain, and inflammation balance. Aim for 2–3 fatty‑fish meals weekly or consider
              a quality fish‑oil/algae‑oil supplement if intake is low.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about fat intake and daily requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Do high-fat diets harm cholesterol?</h4>
              <p className="text-muted-foreground">
                It depends on the fat profile and the individual. Diets high in monounsaturated and polyunsaturated fats (like the Mediterranean diet) often improve cholesterol profiles. However, very high saturated fat intake may raise LDL cholesterol in some people. Emphasize MUFA/PUFA sources (olive oil, nuts, fatty fish), manage saturated fat, and prioritize whole foods for best results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Butter vs olive oil—which is better?</h4>
              <p className="text-muted-foreground">
                Olive oil is generally the better choice for day-to-day cooking and dressings due to its high content of monounsaturated fats, which support heart health. Butter works fine for flavor in moderation, but it's higher in saturated fat. For high-heat cooking, avocado oil or canola oil may be better choices than extra virgin olive oil, which has a lower smoke point.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I avoid all seed oils?</h4>
              <p className="text-muted-foreground">
                Current evidence supports using moderate amounts of unsaturated seed oils (like canola, sunflower, safflower) within an overall balanced diet. These oils provide essential fatty acids and can be part of a healthy diet. However, avoid heavily processed or repeatedly heated oils, and prioritize whole food fat sources (nuts, seeds, fish, avocado) when possible.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How low is too low for fat intake?</h4>
              <p className="text-muted-foreground">
                Chronically consuming less than 15–20% of calories from fat can lead to problems, including impaired hormone production (especially sex hormones), reduced absorption of fat-soluble vitamins (A, D, E, K), and potential mood and cognitive issues. Unless under medical supervision for specific conditions, aim for at least 20% of calories from fat, preferably 25–35%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to track different types of fat separately?</h4>
              <p className="text-muted-foreground">
                For most people, tracking total fat grams is sufficient. However, it's helpful to be aware of fat quality. Aim to get most of your fat from unsaturated sources (nuts, seeds, olive oil, fatty fish) and limit saturated fat to less than 10% of total calories. Prioritize omega-3 sources (fatty fish, flax, chia, walnuts) and limit trans fats as much as possible.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can eating fat make me gain weight?</h4>
              <p className="text-muted-foreground">
                Fat itself doesn't cause weight gain—a calorie surplus does. However, fat is calorie-dense (9 calories per gram vs. 4 for protein and carbs), so it's easier to overconsume calories when eating high-fat foods. Moderate fat intake (20–35% of calories) can actually support weight management by increasing satiety and improving meal satisfaction. The key is balancing fat intake with your total calorie needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I get enough omega-3s if I don't like fish?</h4>
              <p className="text-muted-foreground">
                If you don't eat fish, you can get omega-3s from plant sources like flaxseeds, chia seeds, walnuts, and hemp seeds. However, these provide ALA (alpha-linolenic acid), which your body must convert to EPA and DHA. This conversion is inefficient, so consider an algae-based DHA/EPA supplement, which provides the beneficial long-chain omega-3s directly without consuming fish.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I eat fat before or after workouts?</h4>
              <p className="text-muted-foreground">
                Generally, it's best to avoid large amounts of fat right before workouts, as fat slows digestion and may cause discomfort during exercise. However, small amounts of fat (like a handful of nuts) 2–3 hours before training is usually fine. After workouts, combining fat with protein and carbs is perfectly acceptable and may support recovery. The timing is less critical than meeting your daily fat targets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is coconut oil healthy?</h4>
              <p className="text-muted-foreground">
                Coconut oil is high in saturated fat (about 90%), but it contains medium-chain triglycerides (MCTs) that may have some unique metabolic effects. While it's fine to use occasionally, it's not a "superfood." Current evidence suggests it may raise LDL cholesterol, so moderate use is reasonable. For daily cooking, olive oil, avocado oil, or other unsaturated oils are better primary choices.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between the two calculation methods?</h4>
              <p className="text-muted-foreground">
                The "percentage" method lets you set a specific percentage of calories from fat, which is straightforward and allows you to prioritize fat intake. The "remainder" method calculates fat after you've determined protein and carb targets, ensuring you meet those goals first. This is useful when you want to lock in specific protein and carb amounts. Both methods are valid—choose based on your tracking style and priorities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
