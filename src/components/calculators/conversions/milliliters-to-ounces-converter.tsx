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

const ML_TO_US_OZ = 0.033814;
const ML_TO_IMPERIAL_OZ = 0.0351951;

export default function MillilitersToOuncesConverter() {
  const [result, setResult] = useState<{ usOunces: number; imperialOunces: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ml: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
      usOunces: values.ml * ML_TO_US_OZ,
      imperialOunces: values.ml * ML_TO_IMPERIAL_OZ,
    });
  };

  const conversionTable = [
    { ml: 100, usOunces: 100 * ML_TO_US_OZ, imperialOunces: 100 * ML_TO_IMPERIAL_OZ },
    { ml: 250, usOunces: 250 * ML_TO_US_OZ, imperialOunces: 250 * ML_TO_IMPERIAL_OZ },
    { ml: 500, usOunces: 500 * ML_TO_US_OZ, imperialOunces: 500 * ML_TO_IMPERIAL_OZ },
    { ml: 1000, usOunces: 1000 * ML_TO_US_OZ, imperialOunces: 1000 * ML_TO_IMPERIAL_OZ },
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-semibold">US Fluid Ounces</p>
                <p className="text-2xl font-bold">{result.usOunces.toFixed(2)} fl oz</p>
              </div>
              <div>
                <p className="font-semibold">Imperial Fluid Ounces</p>
                <p className="text-2xl font-bold">{result.imperialOunces.toFixed(2)} fl oz</p>
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
                <TableHead>Milliliters (ml)</TableHead>
                <TableHead className="text-right">US fl oz</TableHead>
                <TableHead className="text-right">Imperial fl oz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ml}>
                  <TableCell>{item.ml}</TableCell>
                  <TableCell className="text-right">{item.usOunces.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.imperialOunces.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/ounces-to-milliliters-converter" className="text-primary underline">Ounces to Milliliters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
