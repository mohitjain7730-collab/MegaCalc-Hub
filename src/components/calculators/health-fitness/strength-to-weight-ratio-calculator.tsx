
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  maxWeight: z.number().positive(),
  bodyWeight: z.number().positive(),
  unit: z.enum(['kg', 'lbs']),
});

type FormValues = z.infer<typeof formSchema>;

export default function StrengthToWeightRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maxWeight: undefined,
      bodyWeight: undefined,
      unit: 'lbs',
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.maxWeight / values.bodyWeight);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="maxWeight" render={({ field }) => (<FormItem><FormLabel>Max Weight Lifted ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (<FormItem><FormLabel>Body Weight ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}/></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="unit" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="kg">kg</SelectItem><SelectItem value="lbs">lbs</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Scale className="h-8 w-8 text-primary" /><CardTitle>Strength-to-Weight Ratio</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
                <CardDescription className='mt-2 text-center'>You can lift {result.toFixed(2)} times your body weight.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
