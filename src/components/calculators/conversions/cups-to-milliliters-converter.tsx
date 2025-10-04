'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  cups: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const US_CUP_TO_ML = 236.588;
const IMPERIAL_CUP_TO_ML = 284.131;

export default function CupsToMillilitersConverter() {
  const [result, setResult] = useState<{ usMl: number; imperialMl: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cups: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
        usMl: values.cups * US_CUP_TO_ML,
        imperialMl: values.cups * IMPERIAL_CUP_TO_ML,
    });
  };

  const conversionTable = [
    { cups: 1, usMl: 1 * US_CUP_TO_ML, imperialMl: 1 * IMPERIAL_CUP_TO_ML },
    { cups: 2, usMl: 2 * US_CUP_TO_ML, imperialMl: 2 * IMPERIAL_CUP_TO_ML },
    { cups: 4, usMl: 4 * US_CUP_TO_ML, imperialMl: 4 * IMPERIAL_CUP_TO_ML },
    { cups: 8, usMl: 8 * US_CUP_TO_ML, imperialMl: 8 * IMPERIAL_CUP_TO_ML },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cups"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cups</FormLabel>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div>
                    <p className="font-semibold">US Milliliters</p>
                    <p className="text-2xl font-bold">{result.usMl.toFixed(1)} ml</p>
                </div>
                <div>
                    <p className="font-semibold">Imperial Milliliters</p>
                    <p className="text-2xl font-bold">{result.imperialMl.toFixed(1)} ml</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>US Milliliters = US Cups × 236.588</p>
              <p className='font-mono p-2 bg-muted rounded-md mt-2'>Imperial Milliliters = Imperial Cups × 284.131</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The calculation is based on the standard definitions for US customary and Imperial cups. To convert, multiply the number of cups by the appropriate conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cups</TableHead>
                <TableHead className="text-right">US Milliliters (ml)</TableHead>
                <TableHead className="text-right">Imperial Milliliters (ml)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.cups}>
                  <TableCell>{item.cups}</TableCell>
                  <TableCell className="text-right">{item.usMl.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{item.imperialMl.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many ml in a cup?</h4>
              <p>A US customary cup contains approximately 236.59 ml. An Imperial cup, used in the UK and other Commonwealth countries, is larger, containing about 284.13 ml.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/milliliters-to-cups-converter" className="text-primary underline">Milliliters to Cups Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
