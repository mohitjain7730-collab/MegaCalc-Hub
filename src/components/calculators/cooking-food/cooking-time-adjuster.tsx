
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  originalTime: z.number().positive(),
  originalTemp: z.number().positive(),
  newTemp: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CookingTimeAdjuster() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalTime: undefined,
      originalTemp: undefined,
      newTemp: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { originalTime, originalTemp, newTemp } = values;
    // New Time = Original Time × (Original Temp / New Temp)^0.75
    const newTime = originalTime * Math.pow(originalTemp / newTemp, 0.75);
    setResult(newTime);
  };
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`;
    }
    return `${mins} minutes`;
  }

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
          <AlertTitle>For Estimation Only</AlertTitle>
          <AlertDescription>This provides a rough guideline. Always cook food to a safe internal temperature, especially meat. Use a food thermometer for accuracy.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="originalTime" render={({ field }) => (
                <FormItem><FormLabel>Original Time (minutes)</FormLabel><FormControl><Input type="number" placeholder="e.g., 60" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="originalTemp" render={({ field }) => (
                <FormItem><FormLabel>Original Temperature (°F)</FormLabel><FormControl><Input type="number" placeholder="e.g., 350" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="newTemp" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>New Temperature (°F)</FormLabel><FormControl><Input type="number" placeholder="e.g., 375" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Adjust Time</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Estimated New Cooking Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{formatTime(result)}</p>
                <CardDescription className="mt-2 text-center">At {form.getValues('newTemp')}°F</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Original Cooking Time &amp; Temperature</h4><p>The time (in minutes) and temperature (in Fahrenheit) specified in the original recipe.</p></div>
              <div><h4 className="font-semibold text-foreground">New Oven Temperature</h4><p>The new temperature you plan to use for cooking.</p></div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses an empirical formula to provide a rough estimate for adjusting cooking times. The relationship between temperature and time isn't linear. This formula, using an exponent of 0.75, attempts to model the more complex physics of heat transfer in an oven. It's a useful starting point, but you should always monitor your food and check for doneness.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    