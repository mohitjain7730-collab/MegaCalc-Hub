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
  cubicInches: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CUBIC_INCHES_TO_ML = 16.3871;

export default function CubicInchesToMillilitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cubicInches: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.cubicInches * CUBIC_INCHES_TO_ML);
  };

  const conversionTable = [
    { cubicInches: 1, ml: 1 * CUBIC_INCHES_TO_ML },
    { cubicInches: 10, ml: 10 * CUBIC_INCHES_TO_ML },
    { cubicInches: 61.024, ml: 61.024 * CUBIC_INCHES_TO_ML }, // 1 Liter
    { cubicInches: 100, ml: 100 * CUBIC_INCHES_TO_ML },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cubicInches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cubic Inches (in³)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 2})} ml</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Milliliters = Cubic Inches × 16.3871</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One cubic inch is defined as approximately 16.3871 cubic centimeters, and one cubic centimeter is equal to one milliliter. Therefore, to convert cubic inches to milliliters, you multiply the volume by 16.3871. This conversion is often used in engineering, especially for engine displacement.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cubic Inches (in³)</TableHead>
                <TableHead className="text-right">Milliliters (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.cubicInches}>
                  <TableCell>{item.cubicInches}</TableCell>
                  <TableCell className="text-right">{item.ml.toLocaleString(undefined, {maximumFractionDigits: 2})}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many cubic inches are in a liter?</h4>
              <p>There are approximately 61.024 cubic inches in one liter (1000 milliliters).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milliliters-to-cubic-inches-converter" className="text-primary underline">Milliliters to Cubic Inches Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
