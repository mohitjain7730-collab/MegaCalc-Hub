
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
  milligrams: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MILLIGRAMS_TO_MICROGRAMS = 1000;

export default function MilligramsToMicrogramsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      milligrams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.milligrams * MILLIGRAMS_TO_MICROGRAMS);
  };

  const conversionTable = [
    { milligrams: 1, micrograms: 1 * MILLIGRAMS_TO_MICROGRAMS },
    { milligrams: 0.5, micrograms: 0.5 * MILLIGRAMS_TO_MICROGRAMS },
    { milligrams: 5, micrograms: 5 * MILLIGRAMS_TO_MICROGRAMS },
    { milligrams: 10, micrograms: 10 * MILLIGRAMS_TO_MICROGRAMS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="milligrams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Milligrams (mg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} µg</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Micrograms = Milligrams × 1000</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>There are exactly 1,000 micrograms (µg) in one milligram (mg). To convert from milligrams to micrograms, you simply multiply the mass in milligrams by 1,000.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milligrams (mg)</TableHead>
                <TableHead className="text-right">Micrograms (µg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.milligrams}>
                  <TableCell>{item.milligrams}</TableCell>
                  <TableCell className="text-right">{item.micrograms.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/micrograms-to-milligrams-converter" className="text-primary underline">Micrograms to Milligrams Converter</Link></p>
            <p><Link href="/category/conversions/milligrams-to-grams-converter" className="text-primary underline">Milligrams to Grams Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
