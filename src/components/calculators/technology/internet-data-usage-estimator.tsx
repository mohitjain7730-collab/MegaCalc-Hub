
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const activitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  hours: z.number().nonnegative(),
  dataRate: z.number().positive('Rate must be positive'),
});

const formSchema = z.object({
  activities: z.array(activitySchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function InternetDataUsageEstimator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activities: [
        { name: '4K Video Streaming', hours: undefined, dataRate: 7 }, // GB/hour
        { name: 'HD Video Streaming', hours: undefined, dataRate: 3 }, // GB/hour
        { name: 'Online Gaming', hours: undefined, dataRate: 0.1 }, // GB/hour
        { name: 'Web Browsing', hours: undefined, dataRate: 0.15 }, // GB/hour
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activities"
  });

  const onSubmit = (values: FormValues) => {
    const totalGB = values.activities.reduce((sum, act) => sum + (act.hours || 0) * act.dataRate * 30, 0);
    setResult(totalGB);
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <CardDescription>Estimate your monthly data usage based on your daily online activities. Enter hours per day for each activity.</CardDescription>
                <div>
                    <div className="grid grid-cols-[1fr,80px,120px,auto] gap-2 items-center font-medium text-sm mb-2">
                        <FormLabel>Activity</FormLabel>
                        <FormLabel className="text-center">Hours/Day</FormLabel>
                        <FormLabel className="text-center">Data Rate (GB/hr)</FormLabel>
                        <span></span>
                    </div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,80px,120px,auto] gap-2 items-start mb-2">
                        <FormField control={form.control} name={`activities.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Activity</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`activities.${index}.hours`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Hours</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`activities.${index}.dataRate`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Data Rate</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', hours: 0, dataRate: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                    </Button>
                </div>
                <Button type="submit">Estimate Usage</Button>
            </form>
        </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Wifi className="h-8 w-8 text-primary" /><CardTitle>Estimated Monthly Data Usage</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(1)} GB</p>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Activity</h4>
                    <p>The type of online activity. Different activities consume data at very different rates.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Hours/Day</h4>
                    <p>The average number of hours you spend on this activity each day.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Data Rate (GB/hr)</h4>
                    <p>The estimated amount of data the activity uses per hour, in Gigabytes. The default values are common estimates.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                For each activity, the calculator multiplies the daily hours by the data rate to get the daily data usage. This is then multiplied by 30 to estimate the total monthly usage in Gigabytes (GB). It sums the usage from all activities to provide a total monthly estimate.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
