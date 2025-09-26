
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IceCream2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  weight: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MeatThawingTimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    // USDA guideline: ~24 hours per 5 lbs in refrigerator
    const thawingTime = 24 * (values.weight / 5);
    setResult(thawingTime);
  };
  
  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0) {
        return `${h} hour${h > 1 ? 's' : ''}${m > 0 ? ` and ${m} minute${m > 1 ? 's' : ''}` : ''}`;
    }
    return `${m} minutes`;
  }

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
          <AlertTitle>Safety First</AlertTitle>
          <AlertDescription>This is a guideline for thawing in a refrigerator at or below 40°F (4°C). Never thaw meat at room temperature. Time can vary based on meat shape and fridge temperature.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight of Meat (pounds)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          <Button type="submit">Estimate Thawing Time</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><IceCream2 className="h-8 w-8 text-primary" /><CardTitle>Estimated Refrigerator Thawing Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{formatTime(result)}</p>
                <CardDescription className="mt-2 text-center">For a {form.getValues('weight')} lb piece of meat.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <h4 className="font-semibold text-foreground">Weight of Meat (pounds)</h4><p>The total weight of the frozen meat you intend to thaw.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses a standard food safety guideline from the USDA, which recommends allowing approximately 24 hours of refrigerator thawing time for every 5 pounds of meat. The calculator scales this recommendation based on the weight you provide to give a total estimated time in hours.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    