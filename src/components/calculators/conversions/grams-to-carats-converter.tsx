
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
  grams: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const GRAMS_TO_CARATS = 5;

export default function GramsToCaratsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.grams * GRAMS_TO_CARATS);
  };

  const conversionTable = [
    { grams: 1, carats: 1 * GRAMS_TO_CARATS },
    { grams: 0.2, carats: 0.2 * GRAMS_TO_CARATS },
    { grams: 5, carats: 5 * GRAMS_TO_CARATS },
    { grams: 10, carats: 10 * GRAMS_TO_CARATS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="grams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grams (g)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} ct</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Carats = Grams × 5</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since one carat is exactly 0.2 grams, there are exactly 5 carats in one gram. To convert from grams to carats, you simply multiply the number of grams by 5.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grams (g)</TableHead>
                <TableHead className="text-right">Carats (ct)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.grams}>
                  <TableCell>{item.grams}</TableCell>
                  <TableCell className="text-right">{item.carats.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is this the same as a "karat" for gold?</h4>
              <p>No. "Carat" is a unit of mass for gemstones. "Karat" is a measure of the purity of gold, where 24 karat is pure gold.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/carats-to-grams-converter" className="text-primary underline">Carats to Grams Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
