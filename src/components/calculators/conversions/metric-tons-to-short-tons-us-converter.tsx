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
  metricTons: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const METRIC_TONS_TO_SHORT_TONS = 1.10231;

export default function MetricTonsToShortTonsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricTons: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.metricTons * METRIC_TONS_TO_SHORT_TONS);
  };

  const conversionTable = [
    { metricTons: 1, shortTons: 1 * METRIC_TONS_TO_SHORT_TONS },
    { metricTons: 10, shortTons: 10 * METRIC_TONS_TO_SHORT_TONS },
    { metricTons: 100, shortTons: 100 * METRIC_TONS_TO_SHORT_TONS },
    { metricTons: 1000, shortTons: 1000 * METRIC_TONS_TO_SHORT_TONS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="metricTons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metric Tons (t)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} short tons</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Short Tons = Metric Tons × 1.10231</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A metric ton (or tonne) is 1,000 kilograms. A short ton (or US ton) is 2,000 pounds. Since one kilogram is about 2.20462 pounds, one metric ton is approximately 1.10231 short tons.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric Tons (t)</TableHead>
                <TableHead className="text-right">Short Tons (US)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.metricTons}>
                  <TableCell>{item.metricTons.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.shortTons.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/short-tons-us-to-metric-tons-converter" className="text-primary underline">Short Tons to Metric Tons Converter</Link></p>
            <p><Link href="/category/conversions/tons-metric-to-pounds-converter" className="text-primary underline">Metric Tons to Pounds Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
