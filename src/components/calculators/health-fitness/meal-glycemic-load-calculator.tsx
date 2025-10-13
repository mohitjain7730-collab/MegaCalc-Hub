
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const foodItemSchema = z.object({
  name: z.string().optional(),
  gi: z.number().min(0).max(100),
  carbs: z.number().positive(),
});

const formSchema = z.object({
  items: z.array(foodItemSchema).min(1, "Add at least one food item."),
});

type FormValues = z.infer<typeof formSchema>;

const getGlCategory = (gl: number) => {
    if (gl <= 10) return { name: 'Low', color: 'text-green-500' };
    if (gl <= 19) return { name: 'Medium', color: 'text-yellow-500' };
    return { name: 'High', color: 'text-red-500' };
};

export default function MealGlycemicLoadCalculator() {
  const [result, setResult] = useState<{ gl: number; category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: '', gi: undefined, carbs: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalGl = values.items.reduce((sum, item) => {
        const itemGl = ((item.gi || 0) * (item.carbs || 0)) / 100;
        return sum + itemGl;
    }, 0);
    setResult({ gl: totalGl, category: getGlCategory(totalGl) });
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Meal Components</CardTitle>
              <CardDescription>Add each food item in your meal with its Glycemic Index (GI) and net carbs to calculate the total GL.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <div className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-center font-medium text-sm mb-2">
                            <FormLabel>Food Item</FormLabel>
                            <FormLabel className="text-center">GI (0-100)</FormLabel>
                            <FormLabel className="text-center">Net Carbs (g)</FormLabel>
                            <span></span>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="e.g., Apple" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`items.${index}.gi`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`items.${index}.carbs`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', gi: undefined, carbs: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                    </div>
                    <Button type="submit">Calculate Total GL</Button>
                </form>
            </Form>
          </CardContent>
      </Card>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Leaf className="h-8 w-8 text-primary" />
                    <CardTitle>Total Meal Glycemic Load</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-4xl font-bold">{result.gl.toFixed(1)}</p>
                 <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name} Glycemic Load</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines the total Glycemic Load (GL) of a meal by first calculating the GL for each individual food item and then summing them up. This gives a more accurate picture of a meal's overall impact on blood sugar levels than looking at single ingredients in isolation.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Meal Glycemic Load Calculator – Build Lower‑GL Plates that Keep Energy Steady" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to calculate meal glycemic load, pair foods to reduce blood sugar spikes, portion strategies, examples, and FAQs." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How to Use Glycemic Load for Real Meals</h2>
        <p itemProp="description">GL estimates a meal’s blood‑sugar impact by combining the <strong>Glycemic Index (GI)</strong> with the <strong>carbs in your serving</strong>. This tool sums GL across foods, giving you a clearer picture than single ingredients alone.</p>

        <h3 className="font-semibold text-foreground mt-6">Meal GL Basics</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Formula:</strong> GL = GI × grams of available carbs ÷ 100 (per food); meal GL is the sum.</li>
          <li><strong>Targets (per serving):</strong> 0–10 low, 11–19 medium, ≥20 high. For full meals, aim for a <strong>moderate total GL</strong> unless fueling hard training.</li>
          <li><strong>Portions matter:</strong> Even low‑GI foods can create a high GL if servings are very large.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Lower‑GL Meal Building</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Anchor the plate with <strong>protein</strong> (eggs, fish, chicken, tofu, Greek yogurt).</li>
          <li>Use <strong>high‑fiber carbs</strong> (beans/lentils, oats, brown rice, whole‑grain breads, fruit) most of the time.</li>
          <li>Add <strong>non‑starchy vegetables</strong> and <strong>healthy fats</strong> (olive oil, avocado, nuts) to slow digestion.</li>
          <li>Save <strong>fast carbs</strong> (white rice, bread, sports drinks) for around intense workouts if needed.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Example Plates</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Burrito bowl:</strong> beans + rice (moderate portion) + chicken + salsa + avocado + lettuce → balanced, moderate GL.</li>
          <li><strong>Breakfast:</strong> oats + milk/yogurt + berries + nuts → fiber‑rich, lower GL.</li>
          <li><strong>Pasta night:</strong> whole‑grain pasta + turkey meat sauce + salad + olive‑oil dressing → moderate GL with protein and fiber.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Special Situations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Before hard training:</strong> slightly higher GL may help performance; prioritize easy‑to‑digest carbs.</li>
          <li><strong>Desk days / weight loss phases:</strong> choose lower‑GL plates with more vegetables and legumes.</li>
          <li><strong>Diabetes management:</strong> pair carbs with protein/fat, keep consistent portions, and follow clinician guidance.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Is GL better than GI?</strong> GL better reflects real meals because it accounts for <em>how much</em> you eat.</p>
          <p><strong>Do protein and fat reduce GL?</strong> They don’t change the GI of a carbohydrate, but they lower the <em>meal’s effective impact</em> by slowing absorption.</p>
          <p><strong>Should I count GL forever?</strong> Use it as an <em>education tool</em>—once you learn which combinations keep you energized, you can eyeball portions.</p>
        </div>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline">Single‑Food Glycemic Load</Link></p>
          <p><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary underline">Carbohydrate Intake Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}
