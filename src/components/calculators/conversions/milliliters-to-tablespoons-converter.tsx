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
  ml: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ML_TO_US_TBSP = 0.067628;

export default function MillilitersToTablespoonsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ml: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ml * ML_TO_US_TBSP);
  };
  
  const conversionTable = [
    { ml: 15, tbsp: 15 * ML_TO_US_TBSP },
    { ml: 50, tbsp: 50 * ML_TO_US_TBSP },
    { ml: 100, tbsp: 100 * ML_TO_US_TBSP },
    { ml: 250, tbsp: 250 * ML_TO_US_TBSP },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ml"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Milliliters (ml)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} US Tablespoons</p>
          </CardContent>
        </Card>
      )}
       <div className="space-y-8">
         <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Milliliters (ml)</TableHead>
                <TableHead className="text-right">US Tablespoons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ml}>
                  <TableCell>{item.ml}</TableCell>
                  <TableCell className="text-right">{item.tbsp.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/tablespoons-to-milliliters-converter" className="text-primary underline">Tablespoons to Milliliters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
