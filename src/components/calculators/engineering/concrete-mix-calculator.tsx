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
import { Calculator } from 'lucide-react';

const formSchema = z.object({
  volume: z.number().positive(),
  mixRatio: z.enum(['1:2:3', '1:2:4', '1:3:6']),
  unit: z.enum(['cubic_yards', 'cubic_meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConcreteMixCalculator() {
  const [result, setResult] = useState<{ cement: number, sand: number, aggregate: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      volume: undefined,
      mixRatio: '1:2:4',
      unit: 'cubic_yards',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { volume, mixRatio, unit } = values;
    const [c, s, a] = mixRatio.split(':').map(Number);
    const ratioSum = c + s + a;

    // Dry volume is ~1.54 times wet volume
    const dryVolume = volume * 1.54;

    const cementVolume = (dryVolume * c) / ratioSum;
    const sandVolume = (dryVolume * s) / ratioSum;
    const aggregateVolume = (dryVolume * a) / ratioSum;
    
    setResult({ cement: cementVolume, sand: sandVolume, aggregate: aggregateVolume });
  };
  
  const currentUnit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cubic_yards">Cubic Yards</SelectItem><SelectItem value="cubic_meters">Cubic Meters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="mixRatio" render={({ field }) => (
                <FormItem><FormLabel>Mix Ratio (Cement:Sand:Aggregate)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="1:2:3">1:2:3 (High Strength)</SelectItem><SelectItem value="1:2:4">1:2:4 (Standard)</SelectItem><SelectItem value="1:3:6">1:3:6 (Foundation)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="volume" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Required Concrete Volume ({currentUnit.replace('_', ' ')})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Required Materials (by volume)</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Cement:</strong> {result.cement.toFixed(2)} {currentUnit}</li>
                <li><strong>Sand:</strong> {result.sand.toFixed(2)} {currentUnit}</li>
                <li><strong>Aggregate (Gravel):</strong> {result.aggregate.toFixed(2)} {currentUnit}</li>
            </ul>
            <CardDescription className='mt-4'>This calculation provides material volume. To get weight, multiply by material density.</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
