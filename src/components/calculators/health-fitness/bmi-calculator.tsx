
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
import { Scale, ArrowUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { name: 'Underweight', color: 'bg-yellow-400' };
  if (bmi < 25) return { name: 'Normal weight', color: 'bg-green-500' };
  if (bmi < 30) return { name: 'Overweight', color: 'bg-orange-500' };
  return { name: 'Obese', color: 'bg-red-500' };
};

const BmiChart = ({ bmiValue }: { bmiValue: number }) => {
    const categories = [
        { name: 'Underweight', range: '< 18.5', min: 10, max: 18.5, color: 'bg-yellow-400' },
        { name: 'Normal', range: '18.5 - 24.9', min: 18.5, max: 25, color: 'bg-green-500' },
        { name: 'Overweight', range: '25 - 29.9', min: 25, max: 30, color: 'bg-orange-500' },
        { name: 'Obese', range: '30+', min: 30, max: 40, color: 'bg-red-500' },
    ];
    
    const totalRange = 30; // from 10 to 40
    const position = Math.max(0, Math.min(100, ((bmiValue - 10) / totalRange) * 100));

    return (
        <div className="w-full mt-6">
            <div className="relative h-8 w-full flex rounded-full overflow-hidden">
                {categories.map((cat, index) => (
                    <div key={index} className={`${cat.color} h-full`} style={{ width: `${((cat.max - cat.min) / totalRange) * 100}%` }}></div>
                ))}
            </div>
             <div className="relative h-4 w-full" style={{ left: `${position}%` }}>
                <ArrowUp className="h-6 w-6 -ml-3 text-foreground" />
                <span className="absolute -ml-4 mt-1 text-xs font-bold">{bmiValue.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-4">
                 {categories.map((cat, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                        <span className='font-bold'>{cat.name}</span>
                        <span>{cat.range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function BmiCalculator() {
  const [result, setResult] = useState<{ bmi: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'metric',
      weight: undefined,
      height: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { weight, height, unit } = values;
    let bmi;
    if (unit === 'metric') {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
    } else {
      bmi = (weight / (height * height)) * 703;
    }
    setResult({ bmi, category: getBmiCategory(bmi) });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, cm)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height ({unit === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate BMI</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Scale className="h-8 w-8 text-primary" /><CardTitle>Your BMI Result</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.bmi.toFixed(1)}</p>
                    <p className={`text-2xl font-semibold`}>{result.category.name}</p>
                </div>
                 <BmiChart bmiValue={result.bmi} />
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Units</h4>
                  <p>Choose between Metric (kilograms and centimeters) or Imperial (pounds and inches) systems for your measurements.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Weight</h4>
                  <p>Your current body weight in either kilograms or pounds.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Height</h4>
                  <p>Your current height in either centimeters or inches.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>Body Mass Index (BMI) is a simple calculation using a person's height and weight. The formula is BMI = kg/m² where kg is a person's weight in kilograms and m² is their height in metres squared. For imperial units, the formula is (lbs / in²) * 703.</p>
                 <p className="mt-2">For adults 20 years old and older, BMI is interpreted using standard weight status categories that are the same for all ages and for both men and women.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on BMI and its implications for health, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.cdc.gov/bmi/faq/?CDC_AAref_Val=https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">Centers for Disease Control and Prevention (CDC) – BMI FAQ</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="BMI Calculator – What Body Mass Index Tells You (and What It Doesn’t)" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How BMI is calculated, population use cases, limitations for individuals, waist measures, and practical next steps." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding BMI</h2>
        <p itemProp="description">BMI is a simple height‑to‑weight index used at a population level to screen for weight categories. It does <strong>not</strong> measure body fat or health directly.</p>

        <h3 className="font-semibold text-foreground mt-6">Strengths</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Fast, inexpensive, and consistent across large groups.</li>
          <li>Correlates with disease risk at a population level.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Limitations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Cannot distinguish muscle from fat; athletes may read “overweight.”</li>
          <li>Does not reflect fat distribution; abdominal fat is more strongly linked to risk.</li>
          <li>Cutoffs may vary across ethnic groups; discuss results with a healthcare professional.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Better Context: Combine With Other Measures</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Waist circumference</strong> and <strong>waist‑to‑height ratio</strong> (target ≤0.5) for central adiposity.</li>
          <li><strong>Body composition</strong> estimates (DEXA, BIA, skinfolds) when available.</li>
          <li>Fitness, labs, sleep, and lifestyle patterns.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Next Steps</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Define a realistic goal (performance, health, aesthetics).</li>
          <li>Set nutrition and training targets that match the goal—see related tools below.</li>
          <li>Follow up with your clinician for individualized guidance.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/bmr-calculator" className="text-primary underline">BMR Calculator</Link></p>
          <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs (TDEE)</Link></p>
        </div>
      </section>
    </div>
  );
}
