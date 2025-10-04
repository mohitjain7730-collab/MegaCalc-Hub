
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

const METRIC_TONS_TO_LBS = 2204.62;

export default function MetricTonsToPoundsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metricTons: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.metricTons * METRIC_TONS_TO_LBS);
  };

  const conversionTable = [
    { metricTons: 1, lbs: 1 * METRIC_TONS_TO_LBS },
    { metricTons: 0.45, lbs: 0.45 * METRIC_TONS_TO_LBS },
    { metricTons: 5, lbs: 5 * METRIC_TONS_TO_LBS },
    { metricTons: 10, lbs: 10 * METRIC_TONS_TO_LBS },
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
                  <Input type="number" {...field} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 2})} lbs</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Pounds = Metric Tons × 2204.62</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>A metric ton (or tonne) is defined as 1,000 kilograms. Since one kilogram is approximately 2.20462 pounds, one metric ton is equal to 1,000 × 2.20462 = 2204.62 pounds.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric Tons (t)</TableHead>
                <TableHead className="text-right">Pounds (lbs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.metricTons}>
                  <TableCell>{item.metricTons}</TableCell>
                  <TableCell className="text-right">{item.lbs.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pounds-to-tons-metric-converter" className="text-primary underline">Pounds to Metric Tons Converter</Link></p>
            <p><Link href="/category/conversions/metric-tons-to-short-tons-us-converter" className="text-primary underline">Metric Tons to Short Tons (US) Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
