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
  inches: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const INCHES_TO_MM = 25.4;

export default function InchesToMillimetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inches: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.inches * INCHES_TO_MM);
  };

  const conversionTable = [
    { inches: 1, mm: 1 * INCHES_TO_MM },
    { inches: 2, mm: 2 * INCHES_TO_MM },
    { inches: 5, mm: 5 * INCHES_TO_MM },
    { inches: 10, mm: 10 * INCHES_TO_MM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="inches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inches (in)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} mm</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Millimeters = Inches × 25.4</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since one inch is defined as exactly 2.54 centimeters, and there are 10 millimeters in every centimeter, it follows that one inch is equal to 25.4 millimeters. To convert inches to millimeters, simply multiply the inch value by 25.4. For example, 3 inches is 3 × 25.4 = 76.2 mm.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inches (in)</TableHead>
                <TableHead className="text-right">Millimeters (mm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.inches}>
                  <TableCell>{item.inches}</TableCell>
                  <TableCell className="text-right">{item.mm.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is this conversion based on?</h4>
              <p>The international definition of an inch is exactly 2.54 centimeters, and a centimeter contains 10 millimeters.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/millimeters-to-inches-converter" className="text-primary underline">Millimeters to Inches Converter</Link></p>
            <p><Link href="/category/conversions/inches-to-centimeters-converter" className="text-primary underline">Inches to Centimeters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
