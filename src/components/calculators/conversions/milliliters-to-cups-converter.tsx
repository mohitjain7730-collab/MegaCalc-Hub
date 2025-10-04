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

const ML_TO_US_CUP = 0.00422675;
const ML_TO_IMPERIAL_CUP = 0.00351951;

export default function MillilitersToCupsConverter() {
  const [result, setResult] = useState<{ usCups: number; imperialCups: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ml: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
      usCups: values.ml * ML_TO_US_CUP,
      imperialCups: values.ml * ML_TO_IMPERIAL_CUP,
    });
  };
  
  const conversionTable = [
    { ml: 100, usCups: 100 * ML_TO_US_CUP, imperialCups: 100 * ML_TO_IMPERIAL_CUP },
    { ml: 236.59, usCups: 1, imperialCups: 236.59 * ML_TO_IMPERIAL_CUP },
    { ml: 500, usCups: 500 * ML_TO_US_CUP, imperialCups: 500 * ML_TO_IMPERIAL_CUP },
    { ml: 1000, usCups: 1000 * ML_TO_US_CUP, imperialCups: 1000 * ML_TO_IMPERIAL_CUP },
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
                <p className="font-semibold">US Cups</p>
                <p className="text-2xl font-bold">{result.usCups.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-semibold">Imperial Cups</p>
                <p className="text-2xl font-bold">{result.imperialCups.toFixed(2)}</p>
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
                <TableHead className="text-right">US Cups</TableHead>
                <TableHead className="text-right">Imperial Cups</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ml}>
                  <TableCell>{item.ml.toFixed(0)}</TableCell>
                  <TableCell className="text-right">{item.usCups.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.imperialCups.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">FAQ</h3>
            <div className="text-muted-foreground space-y-4">
                <div>
                <h4 className="font-semibold text-foreground mb-1">What's the difference between US and Imperial cups?</h4>
                <p>A US customary cup is about 236.59 ml, while an Imperial cup is larger at about 284.13 ml. This is important for recipes from different regions.</p>
                </div>
            </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/cups-to-milliliters-converter" className="text-primary underline">Cups to Milliliters Converter</Link></p>
             <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
