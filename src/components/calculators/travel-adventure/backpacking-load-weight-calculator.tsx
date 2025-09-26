
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Backpack } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  bodyWeight: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
});

type FormValues = z.infer<typeof formSchema>;

const weightRecommendations = {
    ultralight: { name: 'Ultralight', percent: 0.10, description: 'For experienced minimalists on well-established trails.' },
    lightweight: { name: 'Lightweight', percent: 0.15, description: 'A good target for most weekend to multi-day backpackers.' },
    conventional: { name: 'Conventional', percent: 0.20, description: 'A common and manageable weight for most hikers, especially for longer trips.' },
    heavy: { name: 'Heavy', percent: 0.25, description: 'Often required for winter trips or carrying specialized gear. Can be strenuous.' },
};

export default function BackpackingLoadWeightCalculator() {
  const [result, setResult] = useState<{[key: string]: number} | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculatedResult: {[key: string]: number} = {};
    for (const key in weightRecommendations) {
        calculatedResult[key] = values.bodyWeight * weightRecommendations[key as keyof typeof weightRecommendations].percent;
    }
    setResult(calculatedResult);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (
                <FormItem><FormLabel>Your Body Weight</FormLabel><FormControl><Input type="number" placeholder="e.g., 150" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="lbs">Pounds (lbs)</SelectItem><SelectItem value="kg">Kilograms (kg)</SelectItem></SelectContent></Select></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Pack Weight</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Backpack className="h-8 w-8 text-primary" /><CardTitle>Recommended Pack Weight</CardTitle></div></CardHeader>
            <CardContent>
                <CardDescription>Based on a percentage of your body weight, here are some common targets:</CardDescription>
                <div className="mt-4 space-y-4">
                    {Object.entries(result).map(([key, value]) => {
                        const rec = weightRecommendations[key as keyof typeof weightRecommendations];
                        return (
                            <div key={key} className="p-4 border rounded-lg">
                                <p className="text-lg font-bold">{rec.name}: <span className="text-primary">{value.toFixed(1)} {unit}</span></p>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Your Body Weight</h4>
                  <p>Your current body weight is the primary factor in determining a safe and comfortable pack weight. A heavier person can generally carry a heavier load.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses common rules of thumb from the backpacking community to provide target weights. The core idea is to limit your total pack weight to a percentage of your body weight to reduce strain and increase comfort and safety on the trail.</p>
                <p className="mt-2">The result shows several targets, from ultralight (10%) for minimalists to a more conventional pack weight (20%), which is a widely accepted maximum for long-term comfort. These are not strict rules but guidelines to help you plan your gear.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
