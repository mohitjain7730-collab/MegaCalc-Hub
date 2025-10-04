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
  sqIn: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_IN_TO_SQ_CM = 6.4516;

export default function SquareInchesToSquareCentimetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqIn: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqIn * SQ_IN_TO_SQ_CM);
  };

  const conversionTable = [
    { sqIn: 1, sqCm: 1 * SQ_IN_TO_SQ_CM },
    { sqIn: 10, sqCm: 10 * SQ_IN_TO_SQ_CM },
    { sqIn: 50, sqCm: 50 * SQ_IN_TO_SQ_CM },
    { sqIn: 100, sqCm: 100 * SQ_IN_TO_SQ_CM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Inches (in²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} cm²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Centimeters = Square Inches × 6.4516</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since 1 inch is exactly 2.54 centimeters, 1 square inch is equal to 2.54 cm × 2.54 cm = 6.4516 square centimeters. To convert from square inches to square centimeters, you multiply the area in square inches by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Inches (in²)</TableHead>
                <TableHead className="text-right">Square Centimeters (cm²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqIn}>
                  <TableCell>{item.sqIn}</TableCell>
                  <TableCell className="text-right">{item.sqCm.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many square centimeters are in one square inch?</h4>
              <p>There are exactly 6.4516 square centimeters in one square inch.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-centimeters-to-square-inches-converter" className="text-primary underline">Square Centimeters to Square Inches Converter</Link></p>
            <p><Link href="/category/conversions/square-feet-to-square-meters-converter" className="text-primary underline">Square Feet to Square Meters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
