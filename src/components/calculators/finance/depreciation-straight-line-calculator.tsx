
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  assetCost: z.number().positive(),
  salvageValue: z.number().nonnegative(),
  usefulLife: z.number().int().positive(),
}).refine(data => data.assetCost > data.salvageValue, {
  message: "Asset cost must be greater than salvage value.",
  path: ['salvageValue'],
});

type FormValues = z.infer<typeof formSchema>;

export default function DepreciationStraightLineCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCost: undefined,
      salvageValue: undefined,
      usefulLife: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const annualDepreciation = (values.assetCost - values.salvageValue) / values.usefulLife;
    setResult(annualDepreciation);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="assetCost" render={({ field }) => (
              <FormItem><FormLabel>Asset Cost ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="salvageValue" render={({ field }) => (
              <FormItem><FormLabel>Salvage Value ($)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="usefulLife" render={({ field }) => (
              <FormItem className='md:col-span-2'><FormLabel>Useful Life (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Depreciation</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Annual Depreciation Expense</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
            <CardDescription className='mt-4 text-center'>This is the amount of depreciation expense to record each year.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Asset Cost</h4>
                    <p>The original purchase price of the asset plus any costs required to get it ready for its intended use (e.g., shipping, installation).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Salvage Value</h4>
                    <p>The estimated residual value of an asset at the end of its useful life. It's what the company expects to sell it for.</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-foreground mb-1">Useful Life</h4>
                    <p>The estimated period over which the asset is expected to be used by the company.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How Straight-Line Depreciation Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>This method spreads the cost of an asset evenly over its useful life. It's the simplest and most widely used depreciation method for financial accounting.</p>
            <p className='mt-2 font-mono p-2 bg-muted rounded-md text-center'>(Asset Cost - Salvage Value) / Useful Life</p>
            <p className='mt-2'>The calculator determines the total amount that can be depreciated (the "depreciable base") and divides it by the number of years the asset will be in service to find the constant annual depreciation expense.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
