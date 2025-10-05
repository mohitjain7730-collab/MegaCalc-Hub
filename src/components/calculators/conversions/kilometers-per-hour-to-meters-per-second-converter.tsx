
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
  kmh: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const KMH_TO_MS = 1 / 3.6;

export default function KmhToMsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kmh: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kmh * KMH_TO_MS);
  };

  const conversionTable = [
    { kmh: 1, ms: 1 * KMH_TO_MS },
    { kmh: 36, ms: 36 * KMH_TO_MS },
    { kmh: 100, ms: 100 * KMH_TO_MS },
    { kmh: 120, ms: 120 * KMH_TO_MS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="kmh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilometers per Hour (km/h)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} m/s</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>m/s = km/h / 3.6</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A car traveling at 100 km/h is moving at: `100 km/h / 3.6 = 27.78 m/s`.</p>
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">This is a standard conversion in physics, engineering, and sports science, useful for converting vehicle speeds or athletic performance into SI units (m/s) for calculations.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kilometers per Hour (km/h)</TableHead>
                <TableHead className="text-right">Meters per Second (m/s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kmh}>
                  <TableCell>{item.kmh}</TableCell>
                  <TableCell className="text-right">{item.ms.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why divide by 3.6?</h4>
              <p>To convert km/h to m/s, you multiply by 1000 (meters in a km) and divide by 3600 (seconds in an hour). This simplifies to dividing by 3.6.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/meters-per-second-to-kilometers-per-hour-converter" className="text-primary underline">m/s to km/h Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
