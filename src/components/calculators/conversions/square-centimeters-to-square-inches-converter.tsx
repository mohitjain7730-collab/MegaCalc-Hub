
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
  sqCm: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_CM_TO_SQ_IN = 0.155;

export default function SquareCentimetersToSquareInchesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqCm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqCm * SQ_CM_TO_SQ_IN);
  };

  const conversionTable = [
    { sqCm: 1, sqIn: 1 * SQ_CM_TO_SQ_IN },
    { sqCm: 10, sqIn: 10 * SQ_CM_TO_SQ_IN },
    { sqCm: 50, sqIn: 50 * SQ_CM_TO_SQ_IN },
    { sqCm: 100, sqIn: 100 * SQ_CM_TO_SQ_IN },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Centimeters (cm²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} in²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Inches = Square Centimeters × 0.155</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since 1 inch is equal to 2.54 centimeters, 1 square inch is 2.54 × 2.54 = 6.4516 square centimeters. To convert from square centimeters to square inches, you divide by 6.4516, which is the same as multiplying by approximately 0.155. For example, an area of 100 cm² is 100 × 0.155 = 15.5 square inches.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Centimeters (cm²)</TableHead>
                <TableHead className="text-right">Square Inches (in²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqCm}>
                  <TableCell>{item.sqCm}</TableCell>
                  <TableCell className="text-right">{item.sqIn.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many square centimeters in a square inch?</h4>
              <p>There are 6.4516 square centimeters in one square inch.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-inches-to-square-centimeters-converter" className="text-primary underline">Square Inches to Square Centimeters Converter</Link></p>
            <p><Link href="/category/conversions/square-meters-to-square-feet-converter" className="text-primary underline">Square Meters to Square Feet Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
