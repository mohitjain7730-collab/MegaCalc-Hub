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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  weightKg: z.number().min(35).max(200).optional(),
  heightCm: z.number().min(120).max(220).optional(),
  age: z.number().min(16).max(60).optional(),
  activity: z.enum(['sedentary','light','moderate','active','very_active']).optional(),
  breastfeeding: z.enum(['none','partial','exclusive']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostpartumCalorieNeedsCalculator() {
  const [result, setResult] = useState<{ maintenanceKcal: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { weightKg: undefined, heightCm: undefined, age: undefined, activity: undefined, breastfeeding: undefined } });

  const activityFactor = (a: string) => ({ sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 } as any)[a] || 1.2;
  const breastfeedingExtra = (b: string) => (b === 'exclusive' ? 500 : b === 'partial' ? 250 : 0);

  const onSubmit = (v: FormValues) => {
    if (v.weightKg == null || v.heightCm == null || v.age == null || v.activity == null || v.breastfeeding == null) { setResult(null); return; }
    const bmr = 10 * v.weightKg + 6.25 * v.heightCm - 5 * v.age - 161; // Mifflin-St Jeor female
    const maintenance = bmr * activityFactor(v.activity) + breastfeedingExtra(v.breastfeeding);
    const interpretation = v.breastfeeding !== 'none' ? 'Includes breastfeeding energy needs.' : 'Maintenance calories without breastfeeding addition.';
    const opinion = 'Prioritize nutrient-dense foods, adequate protein, and hydration. Adjust based on weight trend and energy levels.';
    setResult({ maintenanceKcal: Math.round(maintenance), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="weightKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 68" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="heightCm" render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 165" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="activity" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="very_active">Very Active</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="breastfeeding" render={({ field }) => (
              <FormItem>
                <FormLabel>Breastfeeding</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Postpartum Calories</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Maintenance Calories</CardTitle>
              </div>
              <CardDescription>Includes activity and breastfeeding status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.maintenanceKcal} kcal/day</p>
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
          <AccordionTrigger>Complete Guide: Postpartum Nutrition</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Prioritize protein, fiber, and hydration for recovery and satiety.</li>
              <li>Adjust calories by monitoring weight trend and energy levels.</li>
              <li>Consult your provider for individualized advice, especially when breastfeeding.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/breastfeeding-calorie-needs-calculator" className="text-primary underline">Breastfeeding Calorie Needs</a></li>
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


