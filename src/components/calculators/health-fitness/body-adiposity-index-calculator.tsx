
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  hip: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BodyAdiposityIndexCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    let heightInM = values.height;
    let hipInCm = values.hip;

    if (values.unit === 'in') {
      heightInM = values.height * 0.0254;
      hipInCm = values.hip * 2.54;
    } else {
      // User entered height in cm, convert to meters for the formula
      heightInM = values.height / 100;
    }

    const bai = (hipInCm / Math.pow(heightInM, 1.5)) - 18;
    setResult(bai);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="in">Inches (in)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip Circumference ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Body Adiposity Index (BAI)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
                    <CardDescription>This is your estimated body fat percentage based on the BAI formula.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The Body Adiposity Index (BAI) provides an alternative to BMI for estimating body fat. It uses the ratio of your hip circumference to your height, raised to the power of 1.5. The formula is `BAI = (Hip Circumference in cm / (Height in m)^1.5) - 18`.</p>
            </AccordionContent>
        </AccordionItem>
         <AccordionItem value="bai-vs-navy">
            <AccordionTrigger>BAI vs. U.S. Navy Method</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator and the other Body Fat Percentage calculator on this site use different methods, which may produce different results.</p>
                <ul className="list-disc list-inside pl-4">
                  <li><strong>BAI Method:</strong> Relies only on height and hip circumference. It was developed to be a simpler alternative to other methods and does not require weight.</li>
                  <li><strong>U.S. Navy Method:</strong> Uses height, neck, and waist measurements (and hips for females). It is a more complex formula but is widely used for its relative accuracy without specialized equipment.</li>
                </ul>
                <p>Neither method is as accurate as clinical methods like DEXA scans, but they can be useful for tracking changes in body composition over time.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
