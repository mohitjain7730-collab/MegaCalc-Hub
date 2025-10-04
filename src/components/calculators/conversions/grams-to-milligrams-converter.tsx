
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

const GRAMS_TO_MILLIGRAMS = 1000;

export default function GramsToMilligramsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grams: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.grams * GRAMS_TO_MILLIGRAMS);
  };

  const conversionTable = [
    { grams: 1, milligrams: 1 * GRAMS_TO_MILLIGRAMS },
    { grams: 0.5, milligrams: 0.5 * GRAMS_TO_MILLIGRAMS },
    { grams: 5, milligrams: 5 * GRAMS_TO_MILLIGRAMS },
    { grams: 10, milligrams: 10 * GRAMS_TO_MILLIGRAMS },
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} mg</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Milligrams = Grams × 1000</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>There are exactly 1,000 milligrams in one gram. To convert from grams to milligrams, you simply multiply the mass in grams by 1,000.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grams (g)</TableHead>
                <TableHead className="text-right">Milligrams (mg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.grams}>
                  <TableCell>{item.grams}</TableCell>
                  <TableCell className="text-right">{item.milligrams.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milligrams-to-grams-converter" className="text-primary underline">Milligrams to Grams Converter</Link></p>
            <p><Link href="/category/conversions/micrograms-to-milligrams-converter" className="text-primary underline">Micrograms to Milligrams Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
