'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Info, Target, Activity, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const activityLevels = {
  low: { min: 2, max: 3, description: 'Low Intensity / Sedentary' },
  moderate: { min: 3, max: 5, description: 'Moderate Activity (~1 hr/day)' },
  high: { min: 5, max: 8, description: 'High Activity (1-3 hr/day)' },
  veryHigh: { min: 8, max: 10, description: 'Very High Activity (4-5+ hr/day)' },
};

const formSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
  activityLevel: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarbohydrateIntakeCalculator() {
  const [result, setResult] = useState<{ min: number; max: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityLevel: 'moderate',
    },
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    if (values.unit === 'lbs') {
      weightInKg *= 0.453592;
    }
    
    const level = activityLevels[values.activityLevel as keyof typeof activityLevels];
    
    setResult({
        min: weightInKg * level.min,
        max: weightInKg * level.max,
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Carbohydrate Needs
          </CardTitle>
          <CardDescription>
            Determine your optimal daily carbohydrate intake based on your activity level and body weight
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem><FormLabel>Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">Kilograms (kg)</SelectItem><SelectItem value="lbs">Pounds (lbs)</SelectItem></SelectContent></Select></FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel>Daily Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.entries(activityLevels).map(([key, value]) => <SelectItem key={key} value={key}>{value.description}</SelectItem>)}</SelectContent></Select></FormItem>
                )} />
              </div>
              <Button type="submit">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Utensils className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recommended Daily Carb Intake</CardTitle>
                  <CardDescription>Personalized range based on your activity level</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.min.toFixed(0)} - {result.max.toFixed(0)} g</p>
                    <CardDescription>This range is an estimate to fuel your activity level and replenish glycogen stores.</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Body Weight</h4>
              <p className="text-muted-foreground">
                Carbohydrate needs are calculated based on body weight because larger individuals require more fuel to support their higher energy expenditure. The calculator uses grams per kilogram (g/kg) multipliers, which is the standard method used by sports nutritionists.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Daily Activity Level</h4>
              <p className="text-muted-foreground">
                Your activity level determines how much carbohydrate you need to fuel your workouts and replenish glycogen stores. Low-intensity or sedentary individuals need less (2-3 g/kg), while very active athletes performing 4-5+ hours of training per day may need 8-10 g/kg. Choose the level that best matches your typical weekly training volume.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why There's a Range</h4>
              <p className="text-muted-foreground">
                The calculator provides a range because carbohydrate needs can vary based on training intensity, individual metabolism, and whether you're in a calorie deficit or surplus. Start at the lower end if you're less active or trying to lose weight, and use the higher end if you're very active or trying to gain weight.
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
              Explore other nutrition calculators to optimize your diet
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
                  Calculate your total daily energy expenditure to understand your overall calorie needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal protein intake to balance with your carbohydrate needs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  See how your carb intake fits into your overall macronutrient distribution.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/fat-intake-calculator" className="text-primary hover:underline">
                    Fat Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your daily fat requirements to complete your macronutrient planning.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Complete Guide to Carbohydrate Intake
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How Many Carbs Should You Eat Daily?</h2>
            <p>This calculator gives a personalized daily carbohydrate range using sports‑nutrition multipliers (g/kg). Use the guide below to tailor carb timing, quality, and fiber to your training and goals.</p>

            <h3 className="font-semibold text-foreground mt-6">Carb Ranges by Training Volume (g/kg)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Low intensity / sedentary:</strong> ~2–3 g/kg supports general health and light movement.</li>
              <li><strong>Moderate training (~1 h/day):</strong> ~3–5 g/kg for most gym‑goers and recreational athletes.</li>
              <li><strong>High volume (1–3 h/day):</strong> ~5–8 g/kg for team sports, CrossFit® or hybrid endurance.</li>
              <li><strong>Very high (4–5+ h/day):</strong> ~8–10 g/kg short‑term for camps, stage races, or peak blocks.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Carb Periodization (Fuel for the Work Required)</h3>
            <p>Match carb intake to training demand. Use <strong>high‑carb days</strong> for long/quality sessions and <strong>lower‑carb days</strong> for easy/recovery. This improves performance while maintaining healthy body composition.</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Pre‑workout (1–3 h):</strong> 1–3 g/kg depending on session length/intensity.</li>
              <li><strong>During (≥90 min):</strong> 30–60 g/hour (up to 90 g with mixed glucose:fructose).</li>
              <li><strong>Post:</strong> 1.0–1.2 g/kg in the first 1–2 h to accelerate glycogen resynthesis when training again within 24 h.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Fiber, GI, and GL</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Fiber:</strong> Aim for ~14 g per 1,000 kcal (≈ 25–38 g/day). Increase gradually and hydrate.</li>
              <li><strong>Glycemic Index (GI):</strong> rate of rise in blood glucose. <strong>Glycemic Load (GL)</strong> = GI × carbs per serving ÷ 100 (better for real meals).</li>
              <li>Choose <strong>whole, minimally processed</strong> carbs for most meals; use <strong>faster carbs</strong> around high‑intensity training.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Practical Meal Ideas (per ~30–60 g carbs)</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li>Oats + banana + milk/yogurt</li>
              <li>Rice + beans + salsa; or quinoa bowl with chickpeas</li>
              <li>2 slices whole‑grain bread + turkey + fruit</li>
              <li>Potatoes/sweet potatoes + lean protein + salad</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Troubleshooting</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Low energy in workouts:</strong> raise pre‑/intra‑workout carbs 15–30 g.</li>
              <li><strong>GI distress:</strong> reduce fiber/fat pre‑workout; practice fueling to build tolerance.</li>
              <li><strong>Plateauing fat loss:</strong> daily calories likely too high; adjust total energy while keeping performance carbs near hard sessions.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">What Are Carbohydrates?</h3>
            <p>
              Carbohydrates are one of the three macronutrients (along with protein and fat). Chemically, they are sugars, starches,
              and fibers. Your body breaks digestible carbohydrates down to glucose, a universal fuel that powers the brain and working
              muscles. Glycogen, the storage form of glucose in muscle and liver, supports high‑intensity exercise, sprints, and heavy
              lifting. Fiber, a non‑digestible carbohydrate, nourishes gut microbes and supports digestive and metabolic health.
            </p>

            <h4 className="font-semibold text-foreground">Carb Types at a Glance</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Sugars:</strong> glucose, fructose, and sucrose (table sugar); quick energy, prevalent in fruit, milk, and sweets.</li>
              <li><strong>Starches:</strong> long chains of glucose found in grains, rice, potatoes, and legumes; slower energy.</li>
              <li><strong>Fiber:</strong> soluble and insoluble types; slows digestion, improves satiety, supports a healthy microbiome.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Why Carbohydrates Are Important</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Performance:</strong> Adequate carbs sustain pace and power output by preserving muscle glycogen.</li>
              <li><strong>Recovery:</strong> Carbs + protein after training replenish glycogen and support muscle repair.</li>
              <li><strong>Brain function:</strong> The brain prefers glucose; low carb availability can feel like brain fog for some.</li>
              <li><strong>Hormones:</strong> Chronically low energy/carbs can disrupt sex hormones and thyroid in susceptible individuals.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Carb Quality and Real‑World Choices</h3>
            <p>
              Most of your carbohydrates should come from minimally processed foods packed with micronutrients and fiber: fruit, legumes,
              whole grains, potatoes/sweet potatoes, dairy, and vegetables. Save highly refined carbs for strategic use around intense
              workouts when fast fuel is beneficial.
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Great daily staples:</strong> oats, rice, quinoa, whole‑grain bread, lentils/beans, fruit, milk/yogurt.</li>
              <li><strong>Workout fuel (as needed):</strong> sports drinks/gels, white rice, bananas, toast with honey.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Special Considerations</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Weight loss:</strong> Keep total calories in check; maintain performance carbs on hard days and pull from lower‑priority meals.</li>
              <li><strong>Diabetes/prediabetes:</strong> Focus on lower‑GL meals, fiber, protein pairing, and consistent portion sizes (work with your clinician).</li>
              <li><strong>Endurance blocks:</strong> Practice race‑day fueling to train your gut and discover your personal carb tolerance.</li>
            </ul>
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
              Common questions about carbohydrate intake and daily requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Do carbs make you gain fat?</h4>
              <p className="text-muted-foreground">
                No, carbs themselves don't cause fat gain—a sustained calorie surplus does. Carbohydrates can actually help with weight management when paired with fiber and protein, as they promote satiety and fuel your workouts. The key is matching carb intake to your activity level and overall calorie needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is a low-carb diet best for everyone?</h4>
              <p className="text-muted-foreground">
                Not necessarily. It depends on your preferences, activity level, and sport. Many people perform and feel better with moderate carbs matched to their training. Low-carb diets can work for sedentary individuals, but active people and athletes typically need more carbs to fuel performance and recovery.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What about eating carbs late at night?</h4>
              <p className="text-muted-foreground">
                Late-night carbs are fine if they fit your total daily calories and don't disrupt your sleep. In fact, many athletes recover well with an evening meal containing carbs and protein. The timing matters less than total daily intake, though some people find avoiding carbs too close to bedtime can improve sleep quality.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if I'm eating enough carbs?</h4>
              <p className="text-muted-foreground">
                Signs you might need more carbs include: low energy during workouts, poor recovery between sessions, brain fog or difficulty concentrating, irritability, and difficulty maintaining training intensity. If you're within the calculated range but still experiencing these issues, try increasing carbs (especially around workouts) or ensure you're eating enough total calories.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I eat carbs before or after workouts?</h4>
              <p className="text-muted-foreground">
                Both can be beneficial. Pre-workout carbs (1-3 hours before) fuel your session, while post-workout carbs (within 1-2 hours) help replenish glycogen stores and aid recovery. For longer or more intense sessions, you may benefit from both. For shorter or lighter workouts, post-workout carbs may be sufficient.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between simple and complex carbs?</h4>
              <p className="text-muted-foreground">
                Simple carbs (like sugar, honey, fruit) are quickly digested and provide fast energy—ideal around workouts. Complex carbs (like oats, brown rice, sweet potatoes) digest more slowly and provide sustained energy—better for most meals. Most people benefit from a mix of both, with complex carbs making up the majority of intake and simple carbs used strategically around training.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I still lose weight while eating carbs?</h4>
              <p className="text-muted-foreground">
                Absolutely. Weight loss is primarily about creating a calorie deficit, not eliminating carbs. In fact, including carbs can make dieting more sustainable by providing energy for workouts, improving mood, and making meals more satisfying. Focus on total calories first, then adjust carb amounts based on your activity level and preferences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much fiber should I get from carbs?</h4>
              <p className="text-muted-foreground">
                Aim for about 14 grams of fiber per 1,000 calories, which typically translates to 25-38 grams per day for most adults. Fiber is found in whole grains, fruits, vegetables, and legumes. Increasing fiber gradually and staying well-hydrated helps prevent digestive discomfort. Most people don't get enough fiber, so prioritize whole, unprocessed carb sources.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I have diabetes or prediabetes?</h4>
              <p className="text-muted-foreground">
                If you have diabetes or prediabetes, focus on lower-glycemic load meals, pair carbs with protein and fiber, and aim for consistent portion sizes. Work with your healthcare provider or registered dietitian to determine appropriate carb intake and timing, as individual needs vary based on medication, blood sugar control, and other factors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need to carb-load before competitions?</h4>
              <p className="text-muted-foreground">
                Carb-loading (increasing carb intake 24-48 hours before an event) can benefit endurance athletes competing in events lasting 90+ minutes. For shorter events or strength competitions, it's usually unnecessary and may cause bloating. Practice your fueling strategy during training to determine what works best for you. Most people don't need extreme carb-loading for typical workouts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
