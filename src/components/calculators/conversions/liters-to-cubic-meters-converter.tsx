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
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
  liters: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const LITERS_TO_CUBIC_METERS = 0.001;

export default function LitersToCubicMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.liters * LITERS_TO_CUBIC_METERS);
  };
  
  const conversionTable = [
    { liters: 1, cubicMeters: 1 * LITERS_TO_CUBIC_METERS },
    { liters: 100, cubicMeters: 100 * LITERS_TO_CUBIC_METERS },
    { liters: 1000, cubicMeters: 1000 * LITERS_TO_CUBIC_METERS },
    { liters: 5000, cubicMeters: 5000 * LITERS_TO_CUBIC_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="liters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Liters (L)</FormLabel>
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
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 3})} m³</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
         <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Liters</TableHead>
                <TableHead className="text-right">Cubic Meters (m³)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.liters}>
                  <TableCell>{item.liters.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.cubicMeters.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/cubic-meters-to-liters-converter" className="text-primary underline">Cubic Meters to Liters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
