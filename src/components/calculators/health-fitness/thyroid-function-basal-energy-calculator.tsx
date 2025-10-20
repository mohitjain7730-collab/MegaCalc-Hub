'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  weightKg: z.number().min(30).max(200).optional(),
  heightCm: z.number().min(120).max(220).optional(),
  age: z.number().min(14).max(90).optional(),
  sex: z.enum(['male','female']).optional(),
  tshMiuL: z.number().min(0.01).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ThyroidFunctionBasalEnergyCalculator() {
  const [result, setResult] = useState<{ bmr: number; adjustedBmr: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { weightKg: undefined, heightCm: undefined, age: undefined, sex: undefined, tshMiuL: undefined } });

  const mifflin = (sex: string, w: number, h: number, a: number) => sex === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;

  const thyroidFactorFromTSH = (tsh: number) => {
    // Simplified heuristic: normal ~0.4-4.0 → factor 1.0; hypothyroid high TSH reduces BMR; hyper low TSH increases
    if (tsh < 0.3) return 1.05;
    if (tsh <= 4.5) return 1.0;
    if (tsh <= 10) return 0.95;
    return 0.9;
  };

  const onSubmit = (v: FormValues) => {
    if (v.weightKg == null || v.heightCm == null || v.age == null || v.sex == null || v.tshMiuL == null) { setResult(null); return; }
    const bmr = mifflin(v.sex, v.weightKg, v.heightCm, v.age);
    const factor = thyroidFactorFromTSH(v.tshMiuL);
    const adjusted = bmr * factor;
    const interpretation = factor > 1 ? 'Possible hyperthyroid effect—elevated basal energy.' : factor < 1 ? 'Possible hypothyroid effect—reduced basal energy.' : 'Basal energy near expected for profile.';
    const opinion = 'Discuss thyroid labs with a clinician for diagnosis; tailor calories to trends, not a single estimate.';
    setResult({ bmr: Math.round(bmr), adjustedBmr: Math.round(adjusted), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weightKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="heightCm" render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 175" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tshMiuL" render={({ field }) => (
              <FormItem>
                <FormLabel>TSH (mIU/L)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 2.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Basal Energy</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Basal Energy (BMR)</CardTitle>
              </div>
              <CardDescription>Mifflin-St Jeor and thyroid-adjusted estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">BMR: <span className="font-semibold text-foreground">{result.bmr} kcal/day</span></p>
              <p className="text-muted-foreground">Adjusted: <span className="font-semibold text-foreground">{result.adjustedBmr} kcal/day</span></p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide: Thyroid & Basal Energy</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>TSH is a screening marker; full thyroid panel gives better insight.</li>
              <li>Energy needs vary with activity, composition, and health.</li>
              <li>Use weight trends to calibrate calorie targets over weeks.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/resting-metabolic-rate-calculator" className="text-primary underline">Resting Metabolic Rate</a></li>
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


