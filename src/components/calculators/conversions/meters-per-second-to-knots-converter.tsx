
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  ms: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MS_TO_KNOTS = 1.94384;

export default function MsToKnotsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ms: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ms * MS_TO_KNOTS);
  };

  const conversionTable = [
    { ms: 1, knots: 1 * MS_TO_KNOTS },
    { ms: 10, knots: 10 * MS_TO_KNOTS },
    { ms: 25, knots: 25 * MS_TO_KNOTS },
    { ms: 50, knots: 50 * MS_TO_KNOTS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meters per Second (m/s)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} knots</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Knots = m/s × 1.94384</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A current of 2 m/s is equivalent to `2 * 1.94384 = 3.89 knots`.</p>
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">Used in meteorology, maritime navigation, and aviation to convert scientific speed measurements (m/s) into the standard operational unit (knots).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meters per Second (m/s)</TableHead>
                <TableHead className="text-right">Knots</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ms}>
                  <TableCell>{item.ms}</TableCell>
                  <TableCell className="text-right">{item.knots.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/knots-to-meters-per-second-converter" className="text-primary underline">Knots to m/s Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
