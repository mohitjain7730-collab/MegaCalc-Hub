
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
  mph: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MPH_TO_KMH = 1.60934;

export default function MphToKmhConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mph: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.mph * MPH_TO_KMH);
  };

  const conversionTable = [
    { mph: 10, kmh: 10 * MPH_TO_KMH },
    { mph: 50, kmh: 50 * MPH_TO_KMH },
    { mph: 60, kmh: 60 * MPH_TO_KMH },
    { mph: 75, kmh: 75 * MPH_TO_KMH },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mph"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Miles per Hour (mph)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} km/h</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilometers per Hour = Miles per Hour × 1.60934</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A typical US highway speed limit is 60 mph. To convert this to km/h, you multiply: `60 mph * 1.60934 = 96.56 km/h`.</p>
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">This conversion is vital for American drivers traveling abroad, for understanding vehicle specifications from different markets, and for anyone working with international transportation data.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miles per Hour (mph)</TableHead>
                <TableHead className="text-right">Kilometers per Hour (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.mph}>
                  <TableCell>{item.mph}</TableCell>
                  <TableCell className="text-right">{item.kmh.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What's the formula to convert mph to km/h?</h4>
              <p>The formula is to multiply the speed in mph by 1.60934 to get the speed in km/h.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kilometers-per-hour-to-miles-per-hour-converter" className="text-primary underline">km/h to MPH Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
