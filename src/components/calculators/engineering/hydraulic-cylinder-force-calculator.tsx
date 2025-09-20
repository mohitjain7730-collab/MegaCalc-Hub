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
  pressure: z.number().positive(),
  boreDiameter: z.number().positive(),
  rodDiameter: z.number().positive().optional(),
  calculationType: z.enum(['push', 'pull']),
});

type FormValues = z.infer<typeof formSchema>;

export default function HydraulicCylinderForceCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pressure: undefined,
      boreDiameter: undefined,
      rodDiameter: undefined,
      calculationType: 'push',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { pressure, boreDiameter, rodDiameter, calculationType } = values;

    let area;
    if (calculationType === 'push') {
      area = Math.PI * Math.pow(boreDiameter / 2, 2);
    } else {
      if (!rodDiameter) {
        form.setError("rodDiameter", { type: "manual", message: "Rod diameter is required for pull force." });
        return;
      }
      const boreArea = Math.PI * Math.pow(boreDiameter / 2, 2);
      const rodArea = Math.PI * Math.pow(rodDiameter / 2, 2);
      area = boreArea - rodArea;
    }
    
    const force = pressure * area;
    setResult(force);
  };
  
  const calculationType = form.watch('calculationType');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="calculationType" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Force Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="push">Push (Extend)</SelectItem>
                    <SelectItem value="pull">Pull (Retract)</SelectItem>
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="pressure" render={({ field }) => (
                <FormItem><FormLabel>Pressure (e.g., PSI)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="boreDiameter" render={({ field }) => (
                <FormItem><FormLabel>Cylinder Bore Diameter</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            {calculationType === 'pull' && (
              <FormField control={form.control} name="rodDiameter" render={({ field }) => (
                  <FormItem><FormLabel>Rod Diameter</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
              )} />
            )}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Cylinder Force</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-xl">The cylinder can generate a {calculationType} force of <strong>{result.toFixed(2)}</strong>.</p>
            <CardDescription className='mt-4'>Ensure units are consistent (e.g., pressure in PSI, diameter in inches results in force in lbs).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
