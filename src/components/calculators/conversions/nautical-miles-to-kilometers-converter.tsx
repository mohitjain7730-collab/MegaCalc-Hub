
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
  nmi: z.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const NAUTICAL_MILES_TO_KM = 1.852;

export default function NauticalMilesToKilometersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nmi: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.nmi * NAUTICAL_MILES_TO_KM);
  };

  const conversionTable = [
    { nmi: 1, km: 1 * NAUTICAL_MILES_TO_KM },
    { nmi: 10, km: 10 * NAUTICAL_MILES_TO_KM },
    { nmi: 100, km: 100 * NAUTICAL_MILES_TO_KM },
    { nmi: 500, km: 500 * NAUTICAL_MILES_TO_KM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nmi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nautical Miles (nmi)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} km</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilometers = Nautical Miles × 1.852</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One nautical mile is internationally defined as exactly 1,852 meters, or 1.852 kilometers. To convert from nautical miles to kilometers, you simply multiply the nautical mile value by 1.852. For example, a 200 nautical mile journey is 200 × 1.852 = 370.4 kilometers.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nautical Miles (nmi)</TableHead>
                <TableHead className="text-right">Kilometers (km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.nmi}>
                  <TableCell>{item.nmi}</TableCell>
                  <TableCell className="text-right">{item.km.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a nautical mile?</h4>
              <p>A nautical mile is a unit of measurement used in air and marine navigation. It is based on the circumference of the Earth and is equal to one minute of latitude.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Is a nautical mile the same as a regular mile?</h4>
              <p>No. A nautical mile is approximately 1.15 statute (regular) miles.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kilometers-to-nautical-miles-converter" className="text-primary underline">Kilometers to Nautical Miles Converter</Link></p>
            <p><Link href="/category/conversions/miles-to-kilometers-converter" className="text-primary underline">Miles to Kilometers Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
