
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  gi: z.number().min(0).max(100),
  carbs: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

const getGlCategory = (gl: number) => {
    if (gl <= 10) return { name: 'Low', color: 'text-green-500' };
    if (gl <= 19) return { name: 'Medium', color: 'text-yellow-500' };
    return { name: 'High', color: 'text-red-500' };
};

export default function GlycemicLoadCalculator() {
  const [result, setResult] = useState<{ gl: number; category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gi: undefined,
      carbs: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const gl = (values.gi * values.carbs) / 100;
    setResult({ gl, category: getGlCategory(gl) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate how much a food serving will raise blood glucose levels.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="gi" render={({ field }) => (
              <FormItem>
                <FormLabel>Glycemic Index (GI) of Food</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0-100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="carbs" render={({ field }) => (
              <FormItem>
                <FormLabel>Net Carbs in Serving (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Glycemic Load</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Leaf className="h-8 w-8 text-primary" />
                    <CardTitle>Glycemic Load (GL) Result</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-4xl font-bold">{result.gl.toFixed(1)}</p>
                 <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name} Glycemic Load</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Glycemic Index (GI)</h4>
                    <p>A rating from 0 to 100 that indicates how quickly a carbohydrate-containing food raises blood sugar levels. You can find GI values for common foods through online databases.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Net Carbs in Serving (g)</h4>
                    <p>The total grams of carbohydrates in the portion of food you are eating, minus the fiber content.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>While the Glycemic Index (GI) tells you how fast a food raises blood sugar, the Glycemic Load (GL) gives a more complete picture by also considering the amount of carbs in a serving. The GL provides a more accurate measure of a food's real-world impact on your blood sugar.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Glycemic Load Calculator – Understand GI vs GL and Real‑World Impact" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to use glycemic load to plan meals, manage blood sugar, pick smart carbs, and pair foods for better responses." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">GI vs GL: What’s the Difference?</h2>
        <p itemProp="description">GI measures speed; GL measures speed × amount. GL therefore predicts a meal’s real‑world impact more accurately.</p>

        <h3 className="font-semibold text-foreground mt-6">Practical Ways to Lower GL</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Choose minimally processed carbs (oats, brown rice, legumes, fruit).</li>
          <li>Pair carbs with <strong>protein, fiber, and healthy fat</strong> to slow absorption.</li>
          <li>Mind portion size—bigger servings raise GL even if GI is moderate.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Who Benefits from Tracking GL?</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>People focused on steady energy and appetite control.</li>
          <li>Athletes balancing high‑ and low‑GI choices around training.</li>
          <li>Those managing blood glucose under professional guidance.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary underline">Carbohydrate Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary underline">Intermittent Fasting Calculator</Link></p>
        </div>

        <p className="italic">Educational use only. Work with your clinician for individualized nutrition targets.</p>

        <h3 className="font-semibold text-foreground mt-6">What Is Glycemic Load, Precisely?</h3>
        <p>
          <strong>GL = (GI × grams of available carbohydrate in the serving) ÷ 100.</strong> A food can have a high GI but a low GL if
          the serving contains few carbs (e.g., watermelon). That’s why GL often aligns better with how meals feel in daily life.
        </p>

        <h3 className="font-semibold text-foreground mt-6">Sample GL of Common Foods (approximate)</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Apple (medium): low GL</li>
          <li>White rice (1 cup cooked): medium–high GL depending on portion</li>
          <li>Beans/lentils (1 cup cooked): low–medium GL with high fiber and protein</li>
          <li>Whole‑grain bread (2 slices): medium GL—pair with lean protein for steadier response</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Is GL all I need to track?</strong> No—overall nutrients and calories still matter. GL is one tool among many to shape meals.</p>
          <p><strong>Can athletes use high‑GI foods?</strong> Around intense sessions, higher‑GI foods can be helpful for rapid fueling.</p>
          <p><strong>Do protein and fat change GI?</strong> They don’t change GI of the carb itself, but they slow gastric emptying and lower the meal’s effective GL impact.</p>
        </div>
      </section>
    </div>
  );
}
