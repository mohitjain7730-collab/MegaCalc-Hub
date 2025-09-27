
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  pricePerUnit: z.number().positive(),
  variableCost: z.number().nonnegative(),
}).refine(data => data.pricePerUnit > data.variableCost, {
    message: "Price must be greater than variable cost.",
    path: ["pricePerUnit"],
});

type FormValues = z.infer<typeof formSchema>;

export default function ContributionMarginCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pricePerUnit: undefined,
      variableCost: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.pricePerUnit - values.variableCost);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="pricePerUnit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Selling Price per Unit ($)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="variableCost" render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Cost per Unit ($)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Contribution Margin</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Plus className="h-8 w-8 text-primary" /><CardTitle>Contribution Margin per Unit</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            <CardDescription className='mt-4 text-center'>Each unit sold contributes this amount towards covering fixed costs and generating profit.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The contribution margin is the revenue left over to cover fixed costs after considering variable costs. It's a foundational concept in cost-volume-profit analysis and helps businesses make decisions about pricing and which products to sell.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
