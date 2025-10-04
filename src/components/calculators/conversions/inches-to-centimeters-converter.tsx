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

const INCHES_TO_CM = 2.54;

export default function InchesToCentimetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inches: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.inches * INCHES_TO_CM);
  };

  const conversionTable = [
    { inches: 1, cm: 1 * INCHES_TO_CM },
    { inches: 5, cm: 5 * INCHES_TO_CM },
    { inches: 10, cm: 10 * INCHES_TO_CM },
    { inches: 12, cm: 12 * INCHES_TO_CM },
    { inches: 25, cm: 25 * INCHES_TO_CM },
    { inches: 50, cm: 50 * INCHES_TO_CM },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} cm</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Centimeters = Inches × 2.54</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The conversion is based on the international definition that 1 inch is exactly 2.54 centimeters. To convert inches to centimeters, you simply multiply the number of inches by 2.54. For example, a 12-inch ruler is 12 × 2.54 = 30.48 cm long.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inches (in)</TableHead>
                <TableHead className="text-right">Centimeters (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.inches}>
                  <TableCell>{item.inches}</TableCell>
                  <TableCell className="text-right">{item.cm.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many inches are in a centimeter?</h4>
              <p>There are approximately 0.3937 inches in one centimeter.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why do the US and UK use different units?</h4>
              <p>The US primarily uses the imperial system (inches, feet, pounds), a system inherited from the British Empire. While the UK has officially adopted the metric system (meters, grams), imperial units are still commonly used in everyday life. Most of the world uses the metric system for its simplicity and base-ten structure.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/centimeters-to-inches-converter" className="text-primary underline">Centimeters to Inches Converter</Link></p>
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
            <p><Link href="/category/conversions/inches-to-millimeters-converter" className="text-primary underline">Inches to Millimeters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
