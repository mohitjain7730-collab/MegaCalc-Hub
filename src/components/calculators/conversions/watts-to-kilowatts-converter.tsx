
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
  watts: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const WATTS_TO_KILOWATTS = 0.001;

export default function WattsToKilowattsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      watts: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.watts * WATTS_TO_KILOWATTS);
  };

  const conversionTable = [
    { watts: 1, kilowatts: 1 * WATTS_TO_KILOWATTS },
    { watts: 1000, kilowatts: 1 },
    { watts: 5000, kilowatts: 5 },
    { watts: 10000, kilowatts: 10 },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="watts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Watts (W)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, { maximumFractionDigits: 3 })} kW</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilowatts = Watts / 1000</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Useful for converting the power consumption of household appliances to the units used for electricity billing (kilowatt-hours).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Watts (W)</TableHead>
                <TableHead className="text-right">Kilowatts (kW)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.watts}>
                  <TableCell>{item.watts.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{item.kilowatts.toLocaleString(undefined, { maximumFractionDigits: 3 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kilowatts-to-watts-converter" className="text-primary underline">Kilowatts to Watts Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

