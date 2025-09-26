
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
  time: z.number().positive('Time must be positive'),
});

type FormValues = z.infer<typeof formSchema>;

export default function Vo2MaxEstimationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Cooper 1.5 Mile Run Test formula
    const vo2max = 483 / values.time + 3.5;
    setResult(vo2max);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time to complete 1.5 mile run (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Time to complete 1.5 mile run</h4>
                  <p>The total time in minutes it took you to run 1.5 miles (2.41 km) at your best effort.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses the Cooper 1.5 Mile Run Test formula to provide an estimation of your VO₂ max. VO₂ max is the maximum rate of oxygen your body is able to use during exercise, and it is a key indicator of cardiovascular fitness and aerobic endurance.</p>
                <p>The formula `VO₂ max = (483 / time) + 3.5` is an empirical formula derived from studies correlating running performance with laboratory-measured VO₂ max values. It is a simple and accessible way to estimate your fitness level without expensive equipment.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more information on VO₂ max and fitness testing:</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.army.mil/acft/" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. Army Public Health Center – Fitness Testing</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
