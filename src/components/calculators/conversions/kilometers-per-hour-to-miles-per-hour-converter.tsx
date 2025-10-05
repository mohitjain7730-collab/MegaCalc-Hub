
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
  kmh: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const KMH_TO_MPH = 0.621371;

export default function KmhToMphConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kmh: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kmh * KMH_TO_MPH);
  };

  const conversionTable = [
    { kmh: 10, mph: 10 * KMH_TO_MPH },
    { kmh: 50, mph: 50 * KMH_TO_MPH },
    { kmh: 100, mph: 100 * KMH_TO_MPH },
    { kmh: 120, mph: 120 * KMH_TO_MPH },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="kmh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometers per Hour (km/h)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} mph</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Miles per Hour = Kilometers per Hour × 0.621371</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A common European highway speed limit is 120 km/h. To convert this to mph, you multiply: `120 km/h * 0.621371 = 74.56 mph`.</p>
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">This conversion is essential for travelers, pilots, and anyone needing to interpret vehicle speeds, weather reports, or navigation information between regions that use metric and imperial systems.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kilometers per Hour (km/h)</TableHead>
                <TableHead className="text-right">Miles per Hour (mph)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kmh}>
                  <TableCell>{item.kmh}</TableCell>
                  <TableCell className="text-right">{item.mph.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What's faster, 100 km/h or 60 mph?</h4>
              <p>60 mph is slightly slower. 100 km/h is approximately 62.1 mph, so it is the faster speed.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/miles-per-hour-to-kilometers-per-hour-converter" className="text-primary underline">MPH to km/h Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
