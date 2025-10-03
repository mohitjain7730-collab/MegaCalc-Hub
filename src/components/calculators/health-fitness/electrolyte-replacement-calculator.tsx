'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sweatRates = {
    low: 0.5,
    moderate: 1.0,
    high: 1.5,
};

const saltinessLevels = {
    low: 500,
    average: 900,
    salty: 1500,
};

const formSchema = z.object({
  duration: z.number().positive(),
  sweatRate: z.string(),
  sweatType: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ElectrolyteReplacementCalculator() {
  const [result, setResult] = useState<{ sodium: number; potassium: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      duration: undefined,
      sweatRate: 'moderate',
      sweatType: 'average',
    },
  });

  const onSubmit = (values: FormValues) => {
    const sweatRateMultiplier = sweatRates[values.sweatRate as keyof typeof sweatRates];
    const totalSweatLoss = values.duration * sweatRateMultiplier;
    
    const sodiumConcentration = saltinessLevels[values.sweatType as keyof typeof saltinessLevels];
    const totalSodiumLoss = totalSweatLoss * sodiumConcentration;
    
    const totalPotassiumLoss = totalSweatLoss * 200;

    setResult({ sodium: totalSodiumLoss, potassium: totalPotassiumLoss });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem><FormLabel>Duration of Exercise (hours)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sweatRate" render={({ field }) => (
                <FormItem><FormLabel>Sweat Rate Intensity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                </Select>
                </FormItem>
            )} />
             <FormField control={form.control} name="sweatType" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Sweat Saltiness</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="low">Low (Rarely see salt stains)</SelectItem><SelectItem value="average">Average (Sometimes see salt stains)</SelectItem><SelectItem value="salty">Salty (Often see salt stains)</SelectItem></SelectContent>
                </Select>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Loss</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Estimated Electrolyte Loss</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="font-semibold">Sodium</p>
                        <p className="text-2xl font-bold">{result.sodium.toLocaleString()} mg</p>
                    </div>
                     <div>
                        <p className="font-semibold">Potassium</p>
                        <p className="text-2xl font-bold">{result.potassium.toLocaleString()} mg</p>
                    </div>
                </div>
                <CardDescription className='mt-4 text-center'>Replenish gradually through a balanced diet and properly formulated sports drinks during and after your activity.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a personalized estimate by combining the duration of exercise with user perceptions of their sweat rate and saltiness. This model simplifies a complex physiological process into an actionable calculation.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
