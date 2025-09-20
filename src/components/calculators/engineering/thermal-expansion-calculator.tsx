'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';

const expansionCoefficients = {
  steel: 12e-6, // per °C
  aluminum: 23e-6,
  copper: 17e-6,
  concrete: 12e-6,
};

const formSchema = z.object({
  material: z.nativeEnum(expansionCoefficients),
  initialLength: z.number().positive(),
  tempChange: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ThermalExpansionCalculator() {
  const [result, setResult] = useState<{ changeInLength: number, finalLength: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      material: expansionCoefficients.steel,
      initialLength: undefined,
      tempChange: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { material, initialLength, tempChange } = values;
    
    const changeInLength = material * initialLength * tempChange;
    const finalLength = initialLength + changeInLength;
    
    setResult({ changeInLength, finalLength });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="material" render={({ field }) => (
                <FormItem><FormLabel>Material</FormLabel><Form, FormControl, FormField, FormItem, FormLabel, FormMessage onValueChange={(v) => field.onChange(parseFloat(v))} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    {Object.entries(expansionCoefficients).map(([key, value]) => (
                        <SelectItem key={key} value={String(value)}>{key.charAt(0).toUpperCase() + key.slice(1)}</SelectItem>
                    ))}
                </SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="initialLength" render={({ field }) => (
                <FormItem><FormLabel>Initial Length</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tempChange" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Change in Temperature (°C or °F)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Thermometer className="h-8 w-8 text-primary" /><CardTitle>Expansion Results</CardTitle></div></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-lg space-y-2">
                <li><strong>Change in Length:</strong> {result.changeInLength.toExponential(4)}</li>
                <li><strong>Final Length:</strong> {result.finalLength.toFixed(6)}</li>
            </ul>
            <CardDescription className='mt-4'>Units for length and expansion will be the same as the initial length unit. Ensure temperature unit matches the coefficient's basis (coefficients here are per °C, but work for °F change).</CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
