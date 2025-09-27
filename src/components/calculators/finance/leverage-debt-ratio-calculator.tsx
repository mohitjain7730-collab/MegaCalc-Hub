
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
  totalDebt: z.number().nonnegative(),
  totalAssets: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LeverageDebtRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalDebt: undefined,
      totalAssets: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult((values.totalDebt / values.totalAssets) * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Calculate the percentage of a company's assets that are financed through debt.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalDebt" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Debt</FormLabel>
                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="totalAssets" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Assets</FormLabel>
                <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Debt Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Debt Ratio</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
            <CardDescription className='mt-4 text-center'>{result.toFixed(2)}% of the company's assets are financed by debt. A higher ratio indicates greater financial risk.</CardDescription>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The debt ratio is a leverage ratio that indicates what proportion of a company’s assets are being financed through debt. It is calculated by dividing total debt by total assets. The formula provides a general sense of the company's risk; the higher the ratio, the more leverage a company is using and the greater its financial risk.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
