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

const LITERS_TO_US_QUARTS = 1.05669;
const LITERS_TO_IMPERIAL_QUARTS = 0.879877;

export default function LitersToQuartsConverter() {
  const [result, setResult] = useState<{ usQuarts: number; imperialQuarts: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
      usQuarts: values.liters * LITERS_TO_US_QUARTS,
      imperialQuarts: values.liters * LITERS_TO_IMPERIAL_QUARTS,
    });
  };
  
  const conversionTable = [
    { liters: 1, usQuarts: 1 * LITERS_TO_US_QUARTS, imperialQuarts: 1 * LITERS_TO_IMPERIAL_QUARTS },
    { liters: 5, usQuarts: 5 * LITERS_TO_US_QUARTS, imperialQuarts: 5 * LITERS_TO_IMPERIAL_QUARTS },
    { liters: 10, usQuarts: 10 * LITERS_TO_US_QUARTS, imperialQuarts: 10 * LITERS_TO_IMPERIAL_QUARTS },
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
                <p className="font-semibold">US Quarts</p>
                <p className="text-2xl font-bold">{result.usQuarts.toFixed(3)} qt</p>
              </div>
              <div>
                <p className="font-semibold">Imperial Quarts</p>
                <p className="text-2xl font-bold">{result.imperialQuarts.toFixed(3)} qt</p>
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
                <TableHead>Liters</TableHead>
                <TableHead className="text-right">US Quarts</TableHead>
                <TableHead className="text-right">Imperial Quarts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.liters}>
                  <TableCell>{item.liters}</TableCell>
                  <TableCell className="text-right">{item.usQuarts.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{item.imperialQuarts.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What’s the difference between US and Imperial quarts?</h4>
              <p>A US quart is smaller than an Imperial quart. There are 4 US quarts in a US gallon, and 4 Imperial quarts in an Imperial gallon, and the Imperial gallon is larger.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/quarts-to-liters-converter" className="text-primary underline">Quarts to Liters Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
