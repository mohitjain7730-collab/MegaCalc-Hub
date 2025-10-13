'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Utensils } from 'lucide-react';

const formSchema = z.object({ sodium: z.number().nonnegative(), potassium: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function SodiumPotassiumRatioCalculator() {
  const [ratio, setRatio] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sodium: undefined, potassium: undefined } });
  const onSubmit = (v: FormValues) => setRatio(v.sodium > 0 && v.potassium > 0 ? v.sodium / v.potassium : 0);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sodium" render={({ field }) => (<FormItem><FormLabel>Sodium Intake (mg/day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="potassium" render={({ field }) => (<FormItem><FormLabel>Potassium Intake (mg/day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Na:K Ratio</Button>
        </form>
      </Form>
      {ratio !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Sodium:Potassium Ratio</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{ratio.toFixed(2)}</p>
              <CardDescription>Lower ratios (closer to or below 1.0) are generally considered favorable.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <NaKGuide />
    </div>
  );
}

export function NaKGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Sodium-to-Potassium Ratio Calculator – Guide to Blood Pressure and Food Choices" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Understanding Na:K ratio, daily targets, high-sodium foods, potassium-rich options, and how to improve the ratio with simple swaps." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Why the Na:K Ratio Matters</h2>
      <p itemProp="description">Balancing sodium and potassium helps regulate fluid balance, nerve impulses, and blood pressure. Many diets are high in sodium and low in potassium due to processed foods and low fruit/vegetable intake.</p>

      <h3 className="font-semibold text-foreground mt-6">Targets & Interpretation</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Closer to <strong>1.0</strong> (or less) is generally favorable.</li>
        <li>Improve the ratio by <strong>reducing sodium</strong> and <strong>increasing potassium</strong> simultaneously.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Strategies to Improve Na:K</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Cook more at home; salt at the table lightly after tasting.</li>
        <li>Swap processed meats and instant noodles for fresh proteins and whole grains.</li>
        <li>Emphasize potassium‑rich foods: potatoes, beans, lentils, leafy greens, bananas, yogurt.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p>
        <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
      </div>
    </section>
  );
}


