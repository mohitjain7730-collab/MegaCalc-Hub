
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
  sqMiles: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_MILES_TO_SQ_KM = 2.58999;

export default function SquareMilesToSquareKilometersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqMiles: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqMiles * SQ_MILES_TO_SQ_KM);
  };

  const conversionTable = [
    { sqMiles: 1, sqKm: 1 * SQ_MILES_TO_SQ_KM },
    { sqMiles: 10, sqKm: 10 * SQ_MILES_TO_SQ_KM },
    { sqMiles: 100, sqKm: 100 * SQ_MILES_TO_SQ_KM },
    { sqMiles: 58000, sqKm: 58000 * SQ_MILES_TO_SQ_KM }, // Approx. area of Michigan
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqMiles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Miles (mi²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} km²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Kilometers = Square Miles × 2.58999</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One square mile is defined as approximately 2.58999 square kilometers. To convert from square miles to square kilometers, you multiply the area in square miles by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Miles (mi²)</TableHead>
                <TableHead className="text-right">Square Kilometers (km²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqMiles}>
                  <TableCell>{item.sqMiles.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.sqKm.toLocaleString(undefined, {maximumFractionDigits:2})}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-kilometers-to-square-miles-converter" className="text-primary underline">Square Kilometers to Square Miles Converter</Link></p>
            <p><Link href="/category/conversions/hectares-to-square-kilometers-converter" className="text-primary underline">Hectares to Square Kilometers Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
