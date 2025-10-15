'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bone, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().int().positive().optional(),
  sex: z.enum(['female', 'male']).optional(),
  bmi: z.number().positive().optional(),
  priorFracture: z.enum(['yes', 'no']).optional(),
  parentalHipFracture: z.enum(['yes', 'no']).optional(),
  smoker: z.enum(['yes', 'no']).optional(),
  glucocorticoids: z.enum(['yes', 'no']).optional(),
  rheumatoidArthritis: z.enum(['yes', 'no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function computeScore(values: FormValues) {
  let score = 0;
  if (values.age && values.age >= 65) score += 3;
  else if (values.age && values.age >= 55) score += 2;
  else if (values.age && values.age >= 45) score += 1;

  if (values.sex === 'female') score += 2;
  if (values.bmi && values.bmi < 20) score += 2;
  if (values.priorFracture === 'yes') score += 3;
  if (values.parentalHipFracture === 'yes') score += 2;
  if (values.smoker === 'yes') score += 2;
  if (values.glucocorticoids === 'yes') score += 3;
  if (values.rheumatoidArthritis === 'yes') score += 2;

  let category: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 8) category = 'High';
  else if (score >= 4) category = 'Moderate';
  return { score, category };
}

export default function OsteoporosisRiskCalculator() {
  const [result, setResult] = useState<{ score: number; category: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      sex: undefined,
      bmi: undefined,
      priorFracture: undefined,
      parentalHipFracture: undefined,
      smoker: undefined,
      glucocorticoids: undefined,
      rheumatoidArthritis: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(computeScore(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="sex" render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="bmi" render={({ field }) => (
              <FormItem>
                <FormLabel>BMI</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="priorFracture" render={({ field }) => (
              <FormItem>
                <FormLabel>Prior Fragility Fracture</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="parentalHipFracture" render={({ field }) => (
              <FormItem>
                <FormLabel>Parental Hip Fracture</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="smoker" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Smoker</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="glucocorticoids" render={({ field }) => (
              <FormItem>
                <FormLabel>On Glucocorticoids (≥3 months)</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="rheumatoidArthritis" render={({ field }) => (
              <FormItem>
                <FormLabel>Rheumatoid Arthritis</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bone className="h-8 w-8 text-primary" />
              <CardTitle>Osteoporosis Risk</CardTitle>
            </div>
            <CardDescription>Simple point-based screen (not a diagnosis)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result.score}</p>
              <p className="text-xl font-semibold">{result.category} Risk</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.category === 'High' && 'Your inputs suggest a higher risk of low bone density. Consider a DEXA scan and speak with your clinician about calcium, vitamin D, resistance training, and falls prevention.'}
                {result.category === 'Moderate' && 'Some risk factors are present. Focus on bone‑healthy habits and discuss screening intervals with your clinician.'}
                {result.category === 'Low' && 'Few risk factors detected. Maintain a bone‑healthy lifestyle and reassess as age or risk factors change.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Osteoporosis Risk Calculator – Screening Factors and Prevention" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Learn key osteoporosis risk factors, practical prevention tips, and when to consider bone density testing." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Your Risk</h2>
        <p>Bone strength reflects bone density and quality. Risk rises with age and with certain lifestyle and medical factors.</p>
        <h3 className="font-semibold text-foreground mt-4">Major Modifiable Factors</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Quit smoking and limit alcohol.</li>
          <li>Aim for adequate protein, calcium, and vitamin D.</li>
          <li>Incorporate resistance and impact training for bone loading.</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Medical Considerations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Discuss steroid use, endocrine disorders, and autoimmune conditions with your clinician.</li>
          <li>DEXA scan timing depends on age and risk profile.</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/bone-density-t-score-calculator">Bone Density T‑Score</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/calcium-intake-calculator">Calcium Intake</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength‑to‑Weight</Link></p>
      </div>
    </div>
  );
}


