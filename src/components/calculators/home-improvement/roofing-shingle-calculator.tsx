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
import { Calculator, Home } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  area: z.number().positive(),
  pitch: z.number().min(1).max(12),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoofingShingleCalculator() {
  const [result, setResult] = useState<{ bundles: number; underlayment: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      pitch: 4,
      area: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { area, pitch, unit } = values;

    if (unit === 'meters') {
        area *= 10.7639; // convert sq meters to sq feet
    }

    const pitchMultipliers: { [key: number]: number } = {
        1: 1.02, 2: 1.04, 3: 1.06, 4: 1.08, 5: 1.12, 6: 1.16, 7: 1.2, 8: 1.25, 9: 1.3, 10: 1.36, 11: 1.42, 12: 1.48
    };

    const actualRoofArea = area * (pitchMultipliers[pitch] || 1);
    
    // 1 bundle of shingles covers approx 33.3 sq ft. 1 square = 100 sq ft.
    const squares = actualRoofArea / 100;
    const bundles = Math.ceil(squares * 3);
    
    // 1 roll of underlayment covers approx 200 or 400 sq ft (2 or 4 squares)
    const underlaymentRolls = Math.ceil(squares / 4);

    setResult({ bundles: Math.ceil(bundles * 1.1), underlayment: Math.ceil(underlaymentRolls * 1.1) });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Square Feet</SelectItem><SelectItem value="meters">Square Meters</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="area" render={({ field }) => (
                <FormItem><FormLabel>Roof Footprint Area ({unit === 'feet' ? 'sq ft' : 'sq m'})</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="pitch" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Roof Pitch (e.g., 4/12)</FormLabel><FormControl><Input type="number" min="1" max="12" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Home className="h-8 w-8 text-primary" /><CardTitle>Estimated Materials</CardTitle></div></CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-lg space-y-2">
                    <li><strong>{result.bundles} bundles</strong> of shingles.</li>
                    <li><strong>{result.underlayment} rolls</strong> of underlayment.</li>
                </ul>
                <CardDescription className='mt-4'>Includes ~10% for wastage, starter strips, and ridge caps. Always buy extra.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Footprint Area:</strong> This is the flat area the roof covers, not the actual surface area.</li>
                    <li><strong>Pitch Adjustment:</strong> The roof's slope (pitch) increases its surface area. The calculator uses a standard multiplier based on the pitch to find the true roof area.</li>
                    <li><strong>Bundles:</strong> It's standard for 3 bundles of shingles to cover 1 "square" (100 sq. ft.) of roof area.</li>
                    <li><strong>Underlayment:</strong> A standard roll of synthetic underlayment covers about 4 squares.</li>
                    <li>A 10% wastage factor is added.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
