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
import { Calculator, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  wallLength: z.number().positive(),
  studSpacing: z.number().positive().default(16),
  unit: z.enum(['feet', 'meters']),
});

type FormValues = z.infer<typeof formSchema>;

export default function LumberFramingCalculator() {
  const [result, setResult] = useState<{ studs: number; plates: number; } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'feet',
      studSpacing: 16,
      wallLength: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    let { wallLength, studSpacing, unit } = values;

    if (unit === 'meters') {
        wallLength *= 3.28084;
        studSpacing /= 2.54; // cm to inches
    }

    const studs = Math.ceil((wallLength * 12 / studSpacing)) + 1;
    // For each wall section, you need a top plate and a bottom plate. We assume a single wall length.
    // And double top plate for strength.
    const plates = Math.ceil(wallLength / 8) * 3; // Assuming 8ft plates, and 3 total (double top, single bottom)

    setResult({ studs: Math.ceil(studs * 1.1), plates: plates });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="feet">Feet / Inches</SelectItem><SelectItem value="meters">Meters / CM</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="wallLength" render={({ field }) => (
                <FormItem><FormLabel>Total Wall Length ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="studSpacing" render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        Stud Spacing (on center, {unit === 'feet' ? 'in' : 'cm'})
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><button type="button" className='p-0 m-0'><HelpCircle className="h-4 w-4 text-muted-foreground" /></button></TooltipTrigger>
                                <TooltipContent><p className="max-w-xs">The center-to-center distance between vertical studs. Common spacing is 16 inches for residential construction.</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Calculator className="h-8 w-8 text-primary" /><CardTitle>Estimated Materials</CardTitle></div></CardHeader>
            <CardContent>
                <ul className="list-disc pl-5 text-lg space-y-2">
                    <li><strong>{result.studs} vertical studs</strong></li>
                    <li><strong>{result.plates} plate boards</strong> (for top and bottom plates, assuming 8ft boards)</li>
                </ul>
                <CardDescription className='mt-4'>Includes 10% wastage on studs. Does not account for headers, corners, or cripple studs for windows/doors.</CardDescription>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
