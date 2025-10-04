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
  tbsp: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const US_TBSP_TO_ML = 14.7868;

export default function TablespoonsToMillilitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tbsp: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.tbsp * US_TBSP_TO_ML);
  };
  
  const conversionTable = [
    { tbsp: 1, ml: 1 * US_TBSP_TO_ML },
    { tbsp: 2, ml: 2 * US_TBSP_TO_ML },
    { tbsp: 4, ml: 4 * US_TBSP_TO_ML },
    { tbsp: 16, ml: 16 * US_TBSP_TO_ML }, // 1 cup
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="tbsp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>US Tablespoons</FormLabel>
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
                <TableHead>US Tablespoons</TableHead>
                <TableHead className="text-right">Milliliters (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.tbsp}>
                  <TableCell>{item.tbsp}</TableCell>
                  <TableCell className="text-right">{item.ml.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milliliters-to-tablespoons-converter" className="text-primary underline">Milliliters to Tablespoons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
