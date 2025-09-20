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
  modulusOfElasticity: z.number().positive(),
  momentOfInertia: z.number().positive(),
  length: z.number().positive(),
  endCondition: z.enum(['pinned-pinned', 'fixed-fixed', 'fixed-pinned', 'fixed-free']),
});

type FormValues = z.infer<typeof formSchema>;

export default function ColumnBucklingCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modulusOfElasticity: 29000,
      momentOfInertia: undefined,
      length: undefined,
      endCondition: 'pinned-pinned',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { modulusOfElasticity, momentOfInertia, length, endCondition } = values;

    const K_values = {
      'pinned-pinned': 1.0,
      'fixed-fixed': 0.5,
      'fixed-pinned': 0.7,
      'fixed-free': 2.0,
    };
    const K = K_values[endCondition];

    const criticalLoad = (Math.pow(Math.PI, 2) * modulusOfElasticity * momentOfInertia) / Math.pow(K * length, 2);
    setResult(criticalLoad);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="endCondition" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>End Condition</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="pinned-pinned">Pinned-Pinned (K=1.0)</SelectItem>
                    <SelectItem value="fixed-fixed">Fixed-Fixed (K=0.5)</SelectItem>
                    <SelectItem value="fixed-pinned">Fixed-Pinned (K=0.7)</SelectItem>
                    <SelectItem value="fixed-free">Fixed-Free (K=2.0)</SelectItem>
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="modulusOfElasticity" render={({ field }) => (
                <FormItem><FormLabel>Modulus of Elasticity (E)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="momentOfInertia" render={({ field }) => (
                <FormItem><FormLabel>Moment of Inertia (I)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="length" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Column Length (L)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Critical Buckling Load (Pcr)</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The critical load is <strong>{result.toFixed(2)}</strong>.</p>
            <CardDescription className='mt-4'>Ensure all units are consistent (e.g., E in psi, I in in^4, L in inches results in Pcr in lbs).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
