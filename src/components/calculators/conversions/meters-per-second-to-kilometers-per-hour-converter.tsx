
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
  ms: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const MS_TO_KMH = 3.6;

export default function MsToKmhConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ms: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ms * MS_TO_KMH);
  };

  const conversionTable = [
    { ms: 1, kmh: 1 * MS_TO_KMH },
    { ms: 10, kmh: 10 * MS_TO_KMH },
    { ms: 27.78, kmh: 27.78 * MS_TO_KMH },
    { ms: 50, kmh: 50 * MS_TO_KMH },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meters per Second (m/s)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} km/h</p>
          </CardContent>
        </Card>
      )}
      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>km/h = m/s × 3.6</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>An elite sprinter might run at 10 m/s. To convert this to km/h, you multiply: `10 m/s * 3.6 = 36 km/h`.</p>
            </div>
          </div>
        </div>
        <div>
            <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
            <p className="text-muted-foreground">This is a fundamental conversion in physics and engineering, often used to switch between scientific units (m/s) and everyday units for speed (km/h) like in vehicle dynamics or meteorology.</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meters per Second (m/s)</TableHead>
                <TableHead className="text-right">Kilometers per Hour (km/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ms}>
                  <TableCell>{item.ms}</TableCell>
                  <TableCell className="text-right">{item.kmh.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why multiply by 3.6?</h4>
              <p>There are 3600 seconds in an hour and 1000 meters in a kilometer. So, to convert m/s to km/h, you multiply by 3600/1000, which simplifies to 3.6.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kilometers-per-hour-to-meters-per-second-converter" className="text-primary underline">km/h to m/s Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
