
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.number().int().positive(),
  restingHR: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Vo2MaxCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      restingHR: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, restingHR } = values;
    const mhr = 220 - age;
    const vo2max = 15.3 * (mhr / restingHR);
    setResult(vo2max);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <CardDescription>Estimate your VO₂ max based on your age and resting heart rate. This is a non-exercise based estimation.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restingHR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Estimate VO₂ Max</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated VO₂ Max</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)}</p>
                    <CardDescription>ml/kg/min</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses a formula that estimates VO₂ max based on the ratio of your Maximum Heart Rate (MHR) to your Resting Heart Rate (RHR).</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>MHR Estimation:</strong> It first estimates your MHR using the common formula `220 - Age`.</li>
                    <li><strong>VO₂ Max Calculation:</strong> It then uses the formula `VO₂ max = 15.3 × (MHR / RHR)`. The ratio of MHR to RHR serves as a proxy for the heart's pumping efficiency and overall cardiovascular capacity.</li>
                </ul>
                <p className="mt-2 text-sm">Note: This is a simplified, non-exercise-based estimation and may not be as accurate as laboratory tests or performance-based tests (like the Cooper run test).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
