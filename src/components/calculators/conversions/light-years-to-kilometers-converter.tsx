
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
  ly: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const LY_TO_KM = 9.461e+12;

export default function LightYearsToKilometersConverter() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ly: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const km = values.ly * LY_TO_KM;
    setResult(km.toExponential(4));
  };

  const conversionTable = [
    { ly: 1, km: (1 * LY_TO_KM).toExponential(2) },
    { ly: 4.24, km: (4.24 * LY_TO_KM).toExponential(2) }, // Proxima Centauri
    { ly: 25370, km: (25370 * LY_TO_KM).toExponential(2) }, // Andromeda Galaxy
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ly"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Light Years (ly)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result} km</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilometers = Light Years × 9.461e+12</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One light-year is the distance light travels in a vacuum in one Julian year. This distance is approximately 9.461 trillion kilometers. To convert light-years to kilometers, you multiply the number of light-years by this enormous value. For example, Proxima Centauri, the nearest star to our Sun, is about 4.24 light-years away, which is 4.24 × 9.461e+12 ≈ 40.1 trillion km.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Light Years (ly)</TableHead>
                <TableHead className="text-right">Kilometers (km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ly}>
                  <TableCell>{item.ly}</TableCell>
                  <TableCell className="text-right">{item.km}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a light-year?</h4>
              <p>A light-year is a unit of astronomical distance. It's not a unit of time, but the distance that light travels in a vacuum in one Julian year (365.25 days).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/parsecs-to-light-years-converter" className="text-primary underline">Parsecs to Light Years Converter</Link></p>
            <p><Link href="/category/conversions/astronomical-units-to-kilometers-converter" className="text-primary underline">Astronomical Units to Kilometers Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
