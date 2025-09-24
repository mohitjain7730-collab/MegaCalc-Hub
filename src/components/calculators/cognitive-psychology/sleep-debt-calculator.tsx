
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  nights: z.array(z.object({ hours: z.number().min(0).max(24).optional() })),
  recommendedHours: z.number().min(1).max(12),
});

type FormValues = z.infer<typeof formSchema>;

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SleepDebtCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nights: Array(7).fill({ hours: undefined }),
      recommendedHours: 8,
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "nights",
  });

  const onSubmit = (values: FormValues) => {
    const totalRecommended = values.recommendedHours * 7;
    const totalActual = values.nights.reduce((sum, night) => sum + (night.hours || 0), 0);
    const sleepDebt = totalRecommended - totalActual;
    setResult(sleepDebt);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormLabel>Enter your actual hours of sleep for each night of the past week.</FormLabel>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`nights.${index}.hours`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{dayNames[index]}</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
            <FormField control={form.control} name="recommendedHours" render={({ field }) => (
                <FormItem>
                    <FormLabel>Your Recommended Nightly Sleep (hours)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Sleep Debt</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Bed className="h-8 w-8 text-primary" /><CardTitle>Weekly Sleep Debt</CardTitle></div></CardHeader>
            <CardContent>
                {result > 0 ? (
                    <>
                        <p className="text-3xl font-bold text-center">{result.toFixed(1)} hours</p>
                        <CardDescription className='mt-4 text-center'>You have accumulated {result.toFixed(1)} hours of sleep debt this week. This can negatively impact cognitive performance, mood, and reaction time.</CardDescription>
                    </>
                ) : (
                    <>
                        <p className="text-3xl font-bold text-center">Sleep Surplus of {Math.abs(result).toFixed(1)} hours</p>
                        <CardDescription className='mt-4 text-center'>Congratulations! You are getting more than your recommended sleep.</CardDescription>
                    </>
                )}
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator quantifies the difference between the amount of sleep you should be getting and the amount you actually get.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It calculates your total recommended sleep for the week by multiplying your recommended nightly hours by 7.</li>
                    <li>It sums the actual sleep hours you entered for all seven nights.</li>
                    <li>It subtracts your total actual sleep from your total recommended sleep to determine your weekly sleep debt. A positive number indicates a deficit.</li>
                </ol>
                <p className="mt-2">While you can't truly "catch up" on lost sleep, addressing a sleep debt is crucial for long-term health.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    