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

const LITERS_TO_US_PINTS = 2.11338;
const LITERS_TO_IMPERIAL_PINTS = 1.75975;

export default function LitersToPintsConverter() {
  const [result, setResult] = useState<{ usPints: number; imperialPints: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
      usPints: values.liters * LITERS_TO_US_PINTS,
      imperialPints: values.liters * LITERS_TO_IMPERIAL_PINTS,
    });
  };
  
  const conversionTable = [
    { liters: 1, usPints: 1 * LITERS_TO_US_PINTS, imperialPints: 1 * LITERS_TO_IMPERIAL_PINTS },
    { liters: 2, usPints: 2 * LITERS_TO_US_PINTS, imperialPints: 2 * LITERS_TO_IMPERIAL_PINTS },
    { liters: 5, usPints: 5 * LITERS_TO_US_PINTS, imperialPints: 5 * LITERS_TO_IMPERIAL_PINTS },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-semibold">US Pints</p>
                <p className="text-2xl font-bold">{result.usPints.toFixed(2)} pt</p>
              </div>
              <div>
                <p className="font-semibold">Imperial Pints</p>
                <p className="text-2xl font-bold">{result.imperialPints.toFixed(2)} pt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
            <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Liters (L)</TableHead>
                    <TableHead className="text-right">US Pints</TableHead>
                    <TableHead className="text-right">Imperial Pints</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {conversionTable.map((item) => (
                    <TableRow key={item.liters}>
                    <TableCell>{item.liters}</TableCell>
                    <TableCell className="text-right">{item.usPints.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.imperialPints.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What’s the difference between US and Imperial pints?</h4>
              <p>A US liquid pint is 16 US fluid ounces (about 473 ml). An Imperial pint is 20 Imperial fluid ounces (about 568 ml), so it is about 20% larger.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pints-to-liters-converter" className="text-primary underline">Pints to Liters Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
