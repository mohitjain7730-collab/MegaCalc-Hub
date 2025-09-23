
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
import { Scale } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { name: 'Underweight', color: 'text-yellow-500' };
  if (bmi < 25) return { name: 'Normal weight', color: 'text-green-500' };
  if (bmi < 30) return { name: 'Overweight', color: 'text-orange-500' };
  return { name: 'Obese', color: 'text-red-500' };
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
                    <p className={`text-2xl font-semibold ${result.category.color}`}>{result.category.name}</p>
                </div>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>Body Mass Index (BMI) is a simple calculation using a person's height and weight. The formula is BMI = kg/m2 where kg is a person's weight in kilograms and m2 is their height in metres squared. For imperial units, the formula is (lbs / in^2) * 703.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on BMI and its implications for health, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.cdc.gov/healthyweight/assessing/bmi/adult_bmi/index.html" target="_blank" rel="noopener noreferrer" className="text-primary underline">Centers for Disease Control and Prevention (CDC) – About Adult BMI</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
