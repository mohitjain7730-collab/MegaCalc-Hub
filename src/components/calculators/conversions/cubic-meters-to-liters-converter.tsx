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
  cubicMeters: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CUBIC_METERS_TO_LITERS = 1000;

export default function CubicMetersToLitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cubicMeters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.cubicMeters * CUBIC_METERS_TO_LITERS);
  };

  const conversionTable = [
    { cubicMeters: 1, liters: 1 * CUBIC_METERS_TO_LITERS },
    { cubicMeters: 2, liters: 2 * CUBIC_METERS_TO_LITERS },
    { cubicMeters: 5, liters: 5 * CUBIC_METERS_TO_LITERS },
    { cubicMeters: 10, liters: 10 * CUBIC_METERS_TO_LITERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cubicMeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cubic Meters (m³)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} liters</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Liters = Cubic Meters × 1000</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One cubic meter is defined as a volume of 1,000 liters. To convert from cubic meters to liters, you simply multiply the volume in cubic meters by 1,000. For example, a 2 cubic meter tank holds 2 × 1000 = 2,000 liters of water.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cubic Meters (m³)</TableHead>
                <TableHead className="text-right">Liters (L)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.cubicMeters}>
                  <TableCell>{item.cubicMeters}</TableCell>
                  <TableCell className="text-right">{item.liters.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many liters in a cubic meter?</h4>
              <p>There are exactly 1,000 liters in one cubic meter.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/liters-to-cubic-meters-converter" className="text-primary underline">Liters to Cubic Meters Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
