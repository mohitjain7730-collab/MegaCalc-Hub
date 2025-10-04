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
  tsp: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const US_TSP_TO_ML = 4.92892;

export default function TeaspoonsToMillilitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tsp: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.tsp * US_TSP_TO_ML);
  };
  
  const conversionTable = [
    { tsp: 1, ml: 1 * US_TSP_TO_ML },
    { tsp: 3, ml: 3 * US_TSP_TO_ML }, // 1 Tablespoon
    { tsp: 5, ml: 5 * US_TSP_TO_ML },
    { tsp: 10, ml: 10 * US_TSP_TO_ML },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tsp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>US Teaspoons</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} ml</p>
          </CardContent>
        </Card>
      )}
       <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>US Teaspoons</TableHead>
                <TableHead className="text-right">Milliliters (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.tsp}>
                  <TableCell>{item.tsp}</TableCell>
                  <TableCell className="text-right">{item.ml.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milliliters-to-teaspoons-converter" className="text-primary underline">Milliliters to Teaspoons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
