
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  riderWeight: z.number().positive(),
  bikeWeight: z.number().positive(),
  speed: z.number().positive(),
  gradient: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CyclingPowerOutputCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riderWeight: undefined,
      bikeWeight: undefined,
      speed: undefined,
      gradient: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { riderWeight, bikeWeight, speed, gradient } = values;
    const speedMps = speed / 3.6;
    const totalWeight = riderWeight + bikeWeight;
    const crr = 0.005; // Coefficient of rolling resistance
    const cdA = 0.388; // Drag area
    const airDensity = 1.225;

    const pRoll = 9.81 * totalWeight * crr * speedMps;
    const pGrav = 9.81 * totalWeight * (gradient / 100) * speedMps;
    const pDrag = 0.5 * cdA * airDensity * Math.pow(speedMps, 3);
    
    const totalPower = pRoll + pGrav + pDrag;
    setResult(totalPower);
  };

  return (
    <div className="space-y-8">
      <Alert variant="destructive">
        <AlertTitle>For Estimation Only</AlertTitle>
        <AlertDescription>This is a rough estimation. Factors like wind, road surface, and riding position significantly affect real-world power. For accurate measurement, a power meter is required.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riderWeight" render={({ field }) => (<FormItem><FormLabel>Rider Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bikeWeight" render={({ field }) => (<FormItem><FormLabel>Bike Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="speed" render={({ field }) => (<FormItem><FormLabel>Cycling Speed (km/h)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gradient" render={({ field }) => (<FormItem><FormLabel>Road Gradient (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Estimate Power</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated Power Output</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(0)} Watts</p></CardContent>
        </Card>
      )}
    </div>
  );
}
