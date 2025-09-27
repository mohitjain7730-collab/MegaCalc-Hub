
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  noi: z.number().positive(),
  debtService: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DscrCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noi: undefined,
      debtService: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.noi / values.debtService);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="noi" render={({ field }) => (
                <FormItem>
                  <FormLabel>Net Operating Income (NOI)</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="debtService" render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Debt Service</FormLabel>
                  <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                  <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate DSCR</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Banknote className="h-8 w-8 text-primary" /><CardTitle>Debt Service Coverage Ratio (DSCR)</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}x</p>
            <CardDescription className='mt-4 text-center'>A ratio above 1.25 is generally considered healthy by lenders, indicating the company has sufficient income to cover its debt obligations.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The DSCR is a measure of a company's ability to service its debt. It's calculated by dividing the Net Operating Income (the cash flow available to pay debt) by the Total Debt Service (the required principal and interest payments). Lenders use this ratio to assess risk before approving a loan.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
