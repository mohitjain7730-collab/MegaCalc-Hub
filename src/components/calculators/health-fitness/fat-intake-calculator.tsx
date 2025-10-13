
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    path: ['proteinGrams'], // or carbGrams
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="tdee" render={({ field }) => (
            <FormItem><FormLabel>Total Daily Calories (TDEE)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
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
                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="remainder" /></FormControl><FormLabel className="font-normal">By Remainder</FormLabel></FormItem>
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
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Fat Intake</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(0)} g</p>
                    <CardDescription>A healthy range for fat intake is typically 20-35% of total daily calories.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines your daily fat intake goal based on your total calorie needs using one of two methods:</p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>By Percentage:</strong> It calculates the number of calories from fat based on your desired percentage of total calories, then divides by 9 (the number of calories in one gram of fat).</li>
                  <li><strong>By Remainder:</strong> It first calculates the calories from your protein and carbohydrate goals (at 4 calories per gram each). It subtracts this from your total daily calories, and the remaining calories are allocated to fat, divided by 9 to get the gram amount.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Fat Intake Calculator – How Much Fat Per Day?" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Daily fat targets for health, hormones, and performance. Saturated vs unsaturated fat, omega‑3 sources, cooking oils, and meal examples." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How Much Dietary Fat Do You Need?</h2>
        <p itemProp="description">A healthy intake typically lands between <strong>20–35% of calories</strong>. Use the calculator to set a gram target, then focus on food quality.</p>

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

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary underline">Carbohydrate Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio Calculator</Link></p>
        </div>

        <h3 className="font-semibold text-foreground mt-6">What Is Dietary Fat?</h3>
        <p>
          Dietary fats are triglycerides composed of fatty acids. The <strong>saturation</strong> (number of double bonds) impacts
          how the fat behaves in the body and at cooking temperatures. Beyond calories, fats carry fat‑soluble vitamins and provide
          essential fats your body can’t make.
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

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Do high‑fat diets harm cholesterol?</strong> It depends on the fat profile and the person. Emphasize MUFA/PUFA, manage saturated fat, and prioritize whole foods.</p>
          <p><strong>Butter vs olive oil?</strong> Olive oil is a great default for day‑to‑day cooking and dressings; butter works for flavor in moderation.</p>
          <p><strong>Should I avoid all seed oils?</strong> Current evidence supports using moderate amounts of unsaturated oils within an overall balanced diet.</p>
        </div>
      </section>
    </div>
  );
}
