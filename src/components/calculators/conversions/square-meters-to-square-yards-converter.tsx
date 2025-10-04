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
  sqMeters: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const SQ_METERS_TO_SQ_YARDS = 1.19599;

export default function SquareMetersToSquareYardsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sqMeters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.sqMeters * SQ_METERS_TO_SQ_YARDS);
  };

  const conversionTable = [
    { sqMeters: 1, sqYards: 1 * SQ_METERS_TO_SQ_YARDS },
    { sqMeters: 10, sqYards: 10 * SQ_METERS_TO_SQ_YARDS },
    { sqMeters: 50, sqYards: 50 * SQ_METERS_TO_SQ_YARDS },
    { sqMeters: 100, sqYards: 100 * SQ_METERS_TO_SQ_YARDS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="sqMeters"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Meters (m²)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} yd²</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Square Yards = Square Meters × 1.19599</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One square meter is equal to approximately 1.19599 square yards. To convert from square meters to square yards, you multiply the area in square meters by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Square Meters (m²)</TableHead>
                <TableHead className="text-right">Square Yards (yd²)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.sqMeters}>
                  <TableCell>{item.sqMeters}</TableCell>
                  <TableCell className="text-right">{item.sqYards.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/square-yards-to-square-meters-converter" className="text-primary underline">Square Yards to Square Meters Converter</Link></p>
            <p><Link href="/category/conversions/square-meters-to-square-feet-converter" className="text-primary underline">Square Meters to Square Feet Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
