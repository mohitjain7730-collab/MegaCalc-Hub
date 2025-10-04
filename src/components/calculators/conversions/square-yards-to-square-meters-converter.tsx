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
  sqYards: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_YARDS_TO_SQ_METERS = 0.836127;

export default function SquareYardsToSquareMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqYards: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqYards * SQ_YARDS_TO_SQ_METERS);
  };

  const conversionTable = [
    { sqYards: 1, sqMeters: 1 * SQ_YARDS_TO_SQ_METERS },
    { sqYards: 10, sqMeters: 10 * SQ_YARDS_TO_SQ_METERS },
    { sqYards: 100, sqMeters: 100 * SQ_YARDS_TO_SQ_METERS },
    { sqYards: 1000, sqMeters: 1000 * SQ_YARDS_TO_SQ_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqYards"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Yards (yd²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} m²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Meters = Square Yards × 0.836127</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One square yard is equal to 0.83612736 square meters. To convert from square yards to square meters, you multiply the area in square yards by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Yards (yd²)</TableHead>
                <TableHead className="text-right">Square Meters (m²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqYards}>
                  <TableCell>{item.sqYards}</TableCell>
                  <TableCell className="text-right">{item.sqMeters.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-meters-to-square-yards-converter" className="text-primary underline">Square Meters to Square Yards Converter</Link></p>
            <p><Link href="/category/conversions/square-yards-to-square-feet-converter" className="text-primary underline">Square Yards to Square Feet Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
