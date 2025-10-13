
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
import { Utensils } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Carb Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.min.toFixed(0)} - {result.max.toFixed(0)} g</p>
                    <CardDescription>This range is an estimate to fuel your activity level and replenish glycogen stores.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a common method among sports nutritionists to estimate daily carbohydrate needs based on body weight and activity volume. Carbohydrates are the body's primary fuel source for moderate to high-intensity exercise. The multiplier for each activity level reflects the increased demand for glucose to fuel muscles and replenish glycogen stores post-exercise.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Carbohydrate Intake Calculator – Evidence‑Based Guide to Daily Carbs" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How many carbs you need per day based on activity, goals, and body size. Carb periodization, glycogen, fiber targets, GI vs GL, and meal examples for athletes and everyday lifters." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How Many Carbs Should You Eat Daily?</h2>
        <p itemProp="description">This calculator gives a personalized daily carbohydrate range using sports‑nutrition multipliers (g/kg). Use the guide below to tailor carb timing, quality, and fiber to your training and goals.</p>

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

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs (TDEE)</Link></p>
          <p><Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline">Glycemic Load Calculator</Link></p>
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
        </div>

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

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Do carbs make you gain fat?</strong> Fat gain comes from a sustained calorie surplus. Carbs help training and can aid appetite control when paired with fiber and protein.</p>
          <p><strong>Is low‑carb best?</strong> It depends on preference and sport. Many people perform and feel better with moderate carbs matched to training.</p>
          <p><strong>What about late‑night carbs?</strong> They’re fine if they fit your calories and sleep; many athletes recover well with an evening carb + protein meal.</p>
        </div>
      </section>
    </div>
  );
}
