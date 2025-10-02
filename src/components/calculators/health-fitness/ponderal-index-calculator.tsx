
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function PonderalIndexCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        unit: 'imperial',
    }
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    let heightInM = values.height;

    if (values.unit === 'imperial') {
        weightInKg = values.weight * 0.453592;
        heightInM = values.height * 0.0254;
    }

    const pi = weightInKg / Math.pow(heightInM, 3);
    setResult(pi);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, m)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
            )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit === 'metric' ? 'm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Dna className="h-8 w-8 text-primary" /><CardTitle>Ponderal Index (PI)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)} kg/m³</p>
                    <CardDescription>A normal range for adults is typically between 11 and 15.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The Ponderal Index relates weight to height. The formula is `PI = Weight (kg) / Height (m)³`. This calculator will convert from imperial units if they are provided.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="pi-vs-bmi">
            <AccordionTrigger>Ponderal Index vs. BMI</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>Both Ponderal Index (PI) and Body Mass Index (BMI) are measures of corpulence, but they use different formulas and have different applications.</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><strong>Formula:</strong> BMI uses height squared (m²), while PI uses height cubed (m³).</li>
                  <li><strong>Sensitivity to Height:</strong> Because PI cubes height, it is more sensitive to differences in height than BMI. This is why some researchers prefer it for assessing leanness in very tall or very short individuals, where BMI can sometimes be misleading.</li>
                  <li><strong>Common Usage:</strong> BMI is the most widely used metric for general population health assessment. PI is used more often in pediatric medicine (especially for infants) and in research contexts.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
