
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().positive().int(),
  restingHR: z.number().positive().int().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
    maxHR: number;
    moderateZone: { min: number, max: number };
    vigorousZone: { min: number, max: number };
    method: 'Basic' | 'Karvonen';
}

export default function TargetHeartRateCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      restingHR: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, restingHR } = values;
    const maxHR = 220 - age;
    
    if (restingHR) {
        // Karvonen Method
        const hrr = maxHR - restingHR;
        setResult({
            maxHR,
            moderateZone: {
                min: Math.round(hrr * 0.50) + restingHR,
                max: Math.round(hrr * 0.70) + restingHR,
            },
            vigorousZone: {
                min: Math.round(hrr * 0.70) + restingHR,
                max: Math.round(hrr * 0.85) + restingHR,
            },
            method: 'Karvonen',
        });
    } else {
        // Basic Method
        setResult({
            maxHR,
            moderateZone: {
                min: Math.round(maxHR * 0.50),
                max: Math.round(maxHR * 0.70),
            },
            vigorousZone: {
                min: Math.round(maxHR * 0.70),
                max: Math.round(maxHR * 0.85),
            },
            method: 'Basic',
        });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="restingHR" render={({ field }) => (
                <FormItem><FormLabel>Resting Heart Rate (optional)</FormLabel><FormControl><Input type="number" placeholder='e.g., 65' {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Zones</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Your Target Heart Rate Zones</CardTitle></div>
            <CardDescription className='px-6'>Based on the {result.method} method. Max heart rate is {result.maxHR} bpm.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle>Moderate Intensity</CardTitle>
                            <CardDescription>50-70% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.moderateZone.min} - {result.moderateZone.max} bpm</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-muted">
                        <CardHeader>
                            <CardTitle>Vigorous Intensity</CardTitle>
                            <CardDescription>70-85% of max HR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{result.vigorousZone.min} - {result.vigorousZone.max} bpm</p>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator estimates your target heart rate zones for exercise. It uses two different methods:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Basic Method:</strong> This uses the simple formula `220 - age` to estimate your maximum heart rate (MHR) and then calculates a percentage of that MHR.</li>
                    <li><strong>Karvonen Method:</strong> If you provide your resting heart rate, this more personalized method is used. It calculates your Heart Rate Reserve (HRR = MHR - Resting HR) and then applies the intensity percentages to this reserve, adding your resting HR back at the end. This can be more accurate for individuals with different fitness levels.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more detailed information on heart rate zones and exercise, consult these authoritative sources:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.heart.org/en/healthy-living/fitness/fitness-basics/target-heart-rates" target="_blank" rel="noopener noreferrer" className="text-primary underline">American Heart Association – Target Heart Rates</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
