
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  weight: z.number().positive(),
  reps: z.number().int().positive().max(12, 'Use a weight you can lift for 12 or fewer reps for accuracy.'),
  unit: z.enum(['lbs', 'kg']),
});

type FormValues = z.infer<typeof formSchema>;

export default function OneRepMaxCalculator() {
  const [result, setResult] = useState<{ oneRepMax: number; percentages: { [key: string]: number } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      reps: undefined,
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { weight, reps } = values;
    // Epley Formula
    const oneRepMax = weight * (1 + 0.0333 * reps);
    const percentages = {
      '95%': oneRepMax * 0.95,
      '90%': oneRepMax * 0.90,
      '85%': oneRepMax * 0.85,
      '80%': oneRepMax * 0.80,
      '75%': oneRepMax * 0.75,
      '70%': oneRepMax * 0.70,
    };
    setResult({ oneRepMax, percentages });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lbs">Pounds (lbs)</SelectItem><SelectItem value="kg">Kilograms (kg)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight Lifted ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="reps" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Repetitions Performed</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate 1RM</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Estimated One-Rep Max (1RM)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.oneRepMax.toFixed(1)} {unit}</p>
                    <CardDescription>This is your estimated maximum weight for a single repetition.</CardDescription>
                </div>
                 <div className="mt-8">
                    <h3 className="text-lg font-semibold text-center mb-4">Training Percentages</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                        {Object.entries(result.percentages).map(([percent, weight]) => (
                            <div key={percent} className="p-2 border rounded-lg">
                                <p className="font-bold text-primary">{percent}</p>
                                <p>{weight.toFixed(1)} {unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Weight Lifted</h4>
                  <p>The amount of weight you lifted in a single set.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Repetitions Performed</h4>
                  <p>The number of repetitions you successfully completed with that weight before failure. For best results, this number should be between 2 and 12.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the Epley formula, one of the most common formulas for estimating your one-repetition maximum (1RM) without having to perform a dangerous, maximal lift.</p>
                <p>The formula `1RM = W × (1 + 0.0333 × R)` assumes a linear relationship between the number of reps you can do with a certain weight and your maximum strength. The training percentages are then calculated based on this estimated 1RM, which is useful for structuring workouts (e.g., training for strength with 85-95% of 1RM, or for hypertrophy with 70-80%).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more details on strength training principles, consult these resources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.nsca.com/education/articles/kinetic-select/a-brief-review-on-the-one-repetition-maximum/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Strength and Conditioning Association (NSCA) – 1RM Review</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
