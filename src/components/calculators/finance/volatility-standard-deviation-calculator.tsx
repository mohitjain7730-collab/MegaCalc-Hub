
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const returnSchema = z.object({
  value: z.number().optional(),
});

const formSchema = z.object({
  returns: z.array(returnSchema).min(2, "At least two data points are required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VolatilityStandardDeviationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returns: [
        { value: undefined },
        { value: undefined },
        { value: undefined },
        { value: undefined },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "returns"
  });

  const onSubmit = (values: FormValues) => {
    const validReturns = values.returns.map(r => r.value).filter(v => v !== undefined) as number[];
    if (validReturns.length < 2) {
      // Should be caught by zod, but as a safeguard
      setResult(null);
      return;
    }
    
    const n = validReturns.length;
    const mean = validReturns.reduce((a, b) => a + b) / n;
    const variance = validReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1); // Use n-1 for sample standard deviation
    const stdDev = Math.sqrt(variance);

    setResult(stdDev);
  };

  return (
    <div className="space-y-8">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Returns (%)</CardTitle>
              <CardDescription>Enter a series of percentage returns (e.g., 5 for 5%, -2 for -2%) to calculate their volatility.</CardDescription>
            </CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-24'>Return {index + 1}:</FormLabel>
                      <FormField control={form.control} name={`returns.${index}.value`} render={({ field }) => (
                          <FormItem className="flex-grow"><FormControl><Input type="number" step="any" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {fields.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                  </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Return</Button>
            </CardContent>
          </Card>

          <Button type="submit">Calculate Volatility</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Volatility (Standard Deviation)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This represents the standard deviation of the investment's returns, a common measure of its risk.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator measures the volatility of an investment by calculating the sample standard deviation of its past returns.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Calculate the Mean:</strong> It finds the average of all the entered returns.</li>
                    <li><strong>Calculate Variance:</strong> For each return, it subtracts the mean and squares the result. It then averages these squared differences, dividing by n-1 for a sample.</li>
                    <li><strong>Calculate Standard Deviation:</strong> It takes the square root of the variance to find the standard deviation. A higher standard deviation indicates higher volatility and risk.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
