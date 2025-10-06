
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  footLength: z.number().positive(),
  unit: z.enum(['cm', 'inch']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    usMen: number;
    usWomen: number;
    uk: number;
    eu: number;
    jp: number;
    india: number;
}

export default function FootLengthToShoeSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      footLength: undefined,
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    let length = values.footLength;
    if (values.unit === 'inch') {
      length *= 2.54; // Convert inches to cm
    }

    // Shoe size calculations (approximate formulas based on common conventions)
    const usMen = Math.round((length * 0.3937 * 3) - 22 + 0.5);
    const usWomen = usMen + 1.5;
    const uk = usMen - 1;
    const eu = Math.round(length * 1.5 + 2); // Simplified EU calculation
    const jp = Math.round(length);
    const india = uk;

    setResult({ usMen, usWomen, uk, eu, jp, india });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>
              Enter your foot length to get an estimation of your shoe size in various international systems.
            </CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="footLength"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Foot Length ({unit})</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} placeholder="e.g., 25" step="0.1" value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                <SelectItem value="inch">Inches</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Ruler className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Shoe Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className='mb-4'>Based on a foot length of {form.getValues('unit') === 'cm' ? form.getValues('footLength') : (form.getValues('footLength') * 2.54).toFixed(1)} cm</CardDescription>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 border rounded-lg"><p className="font-semibold">US Men</p><p className="text-xl font-bold">{result.usMen}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">US Women</p><p className="text-xl font-bold">{result.usWomen}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">UK</p><p className="text-xl font-bold">{result.uk}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">EU</p><p className="text-xl font-bold">{result.eu}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">Japan</p><p className="text-xl font-bold">{result.jp}</p></div>
              <div className="p-3 border rounded-lg"><p className="font-semibold">India</p><p className="text-xl font-bold">{result.india}</p></div>
            </div>
             <CardDescription className="mt-4 text-xs">Note: These are estimations. Shoe sizes can vary significantly by brand and style. Always refer to a brand's specific sizing chart when possible.</CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator converts your foot length into various international shoe sizes using approximate, commonly-used formulas. It first ensures the foot length is in centimeters, then applies different linear conversions to estimate the size for each region's system (US, UK, EU, etc.).</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
