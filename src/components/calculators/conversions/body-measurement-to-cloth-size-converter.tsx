
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
import { Shirt } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  gender: z.enum(['men', 'women']),
  unit: z.enum(['cm', 'inch']),
  chest: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  bust: z.number().positive().optional(),
  hips: z.number().positive().optional(),
}).refine(data => {
    if (data.gender === 'men') {
        return data.chest !== undefined && data.waist !== undefined;
    }
    return data.bust !== undefined && data.waist !== undefined && data.hips !== undefined;
}, {
    message: "Please fill in all required measurements for the selected gender.",
    path: ['chest'], // Arbitrary path to display the message
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  shirtSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
  pantsSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
} | {
  topSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
  bottomSizes: { US: number, UK: number, EU: number, India: number, Japan: number },
}

export default function BodyMeasurementToClothSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: 'men',
      unit: 'cm',
    },
  });

  const gender = form.watch('gender');

  const onSubmit = (values: FormValues) => {
    const { unit, gender } = values;

    const toInches = (value?: number) => {
        if (!value) return 0;
        return unit === 'cm' ? value / 2.54 : value;
    };

    if (gender === 'men') {
        let chest = toInches(values.chest);
        let waist = toInches(values.waist);

        let usShirt = Math.round(chest);
        usShirt = usShirt % 2 !== 0 ? usShirt + 1 : usShirt; // Round to nearest even number
        
        const pantsWaist = Math.round(waist);

        setResult({
            shirtSizes: { US: usShirt, UK: usShirt, EU: usShirt + 10, India: usShirt - 2, Japan: usShirt + 8 },
            pantsSizes: { US: pantsWaist, UK: pantsWaist, EU: Math.round(waist * 2.54 + 10), India: Math.round(waist * 2.54 - 2), Japan: Math.round(waist * 2.54 + 4) }
        });
    } else {
        let bust = toInches(values.bust);
        let waist = toInches(values.waist);

        let usTop = Math.round((bust - 32) * 1.5);
        usTop = usTop % 2 !== 0 ? usTop + 1 : usTop;

        let usBottom = Math.round(waist - 24);
        usBottom = usBottom % 2 !== 0 ? usBottom + 1 : usBottom;
        
        setResult({
            topSizes: { US: usTop, UK: usTop - 2, EU: usTop + 30, India: usTop + 26, Japan: usTop + 6 },
            bottomSizes: { US: usBottom, UK: usBottom - 2, EU: usBottom + 30, India: usBottom + 26, Japan: usBottom + 6 }
        });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Measurements</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="men">Men</SelectItem><SelectItem value="women">Women</SelectItem></SelectContent></Select></FormItem>
                    )} />
                    <FormField control={form.control} name="unit" render={({ field }) => (
                        <FormItem><FormLabel>Unit</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">Centimeters</SelectItem><SelectItem value="inch">Inches</SelectItem></SelectContent></Select></FormItem>
                    )} />
                </div>
                 {gender === 'men' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="chest" render={({ field }) => (<FormItem><FormLabel>Chest</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>)} />
                    </div>
                ) : (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="bust" render={({ field }) => (<FormItem><FormLabel>Bust</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="hips" render={({ field }) => (<FormItem><FormLabel>Hips</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl></FormItem>)} />
                    </div>
                )}
                 {form.formState.errors.chest && <FormMessage>{form.formState.errors.chest.message}</FormMessage>}
            </CardContent>
          </Card>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result && 'shirtSizes' in result && (
          <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Shirt className="h-8 w-8 text-primary" /><CardTitle>Men's Estimated Sizes</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold">Shirt Sizes</h3>
                    <p>US: {result.shirtSizes.US}, UK: {result.shirtSizes.UK}, EU: {result.shirtSizes.EU}, India: {result.shirtSizes.India}, Japan: {result.shirtSizes.Japan}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold">Pants Sizes</h3>
                    <p>US: {result.pantsSizes.US}, UK: {result.pantsSizes.UK}, EU: {result.pantsSizes.EU}, India: {result.pantsSizes.India}, Japan: {result.pantsSizes.Japan}</p>
                 </div>
                 <CardDescription className='pt-2'>Note: These are approximations. Sizes vary greatly by brand and fit.</CardDescription>
            </CardContent>
          </Card>
      )}
       {result && 'topSizes' in result && (
          <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Shirt className="h-8 w-8 text-primary" /><CardTitle>Women's Estimated Sizes</CardTitle></div></CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold">Top / Dress Sizes</h3>
                    <p>US: {result.topSizes.US}, UK: {result.topSizes.UK}, EU: {result.topSizes.EU}, India: {result.topSizes.India}, Japan: {result.topSizes.Japan}</p>
                 </div>
                 <div>
                    <h3 className="font-semibold">Bottom / Skirt Sizes</h3>
                    <p>US: {result.bottomSizes.US}, UK: {result.bottomSizes.UK}, EU: {result.bottomSizes.EU}, India: {result.bottomSizes.India}, Japan: {result.bottomSizes.Japan}</p>
                 </div>
                 <CardDescription className='pt-2'>Note: These are approximations. Sizes vary greatly by brand and fit.</CardDescription>
            </CardContent>
          </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">This calculator uses simplified formulas to estimate clothing sizes based on body measurements. It converts all measurements to a base unit (inches) and then applies different calculations for men's and women's clothing to approximate sizes in various international systems. These are rough estimates, as brand sizing can vary significantly.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    