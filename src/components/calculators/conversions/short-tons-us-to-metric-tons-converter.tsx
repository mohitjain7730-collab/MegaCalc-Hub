'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  shortTons: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SHORT_TONS_TO_METRIC_TONS = 0.907185;

export default function ShortTonsToMetricTonsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shortTons: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.shortTons * SHORT_TONS_TO_METRIC_TONS);
  };

  const conversionTable = [
    { shortTons: 1, metricTons: 1 * SHORT_TONS_TO_METRIC_TONS },
    { shortTons: 10, metricTons: 10 * SHORT_TONS_TO_METRIC_TONS },
    { shortTons: 100, metricTons: 100 * SHORT_TONS_TO_METRIC_TONS },
    { shortTons: 1000, metricTons: 1000 * SHORT_TONS_TO_METRIC_TONS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="shortTons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Tons (US)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} t</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Metric Tons = Short Tons × 0.907185</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A short ton (or US ton) is 2,000 pounds. A metric ton (or tonne) is 1,000 kilograms. Since one pound is about 0.453592 kilograms, one short ton is approximately 0.907185 metric tons.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Short Tons (US)</TableHead>
                <TableHead className="text-right">Metric Tons (t)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.shortTons}>
                  <TableCell>{item.shortTons.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.metricTons.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/metric-tons-to-short-tons-us-converter" className="text-primary underline">Metric Tons to Short Tons Converter</Link></p>
            <p><Link href="/category/conversions/pounds-to-tons-metric-converter" className="text-primary underline">Pounds to Metric Tons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
