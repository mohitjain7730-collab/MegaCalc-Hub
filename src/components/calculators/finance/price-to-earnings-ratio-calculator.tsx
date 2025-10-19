
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
  pricePerShare: z.number().positive(),
  eps: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PriceToEarningsRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pricePerShare: undefined,
      eps: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.pricePerShare / values.eps);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              control={form.control} 
              name="pricePerShare" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Price per Share ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            <FormField 
              control={form.control} 
              name="eps" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Earnings per Share (EPS, $)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
          <Button type="submit">Calculate P/E Ratio</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Landmark className="h-8 w-8 text-primary" />
              <CardTitle>Price-to-Earnings (P/E) Ratio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
            <CardDescription className="mt-4 text-center">
              This means investors are willing to pay ${result.toFixed(2)} for every $1 of the company's earnings.
            </CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>
              The Price-to-Earnings (P/E) ratio is a valuation metric that compares a company's current share price to its per-share earnings. A high P/E could mean that a stock's price is high relative to earnings and possibly overvalued. Conversely, a low P/E might indicate that the current stock price is low relative to earnings and possibly undervalued.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <a 
              href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_pe-ratio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary underline"
            >
              U.S. SEC – Key Metrics: P/E
            </a>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    