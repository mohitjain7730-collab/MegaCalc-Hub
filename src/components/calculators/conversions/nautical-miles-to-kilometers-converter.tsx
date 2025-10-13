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
  nmi: z.coerce.number().positive('Must be a positive number'),
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
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Nautical Miles to Kilometers – Marine & Aviation Guide" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="How and when to convert nautical miles to kilometers for maritime and flight planning, including knots and ETA considerations." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">When to use nmi → km</h3>
          <p itemProp="description">Pilots and mariners plan in <strong>nautical miles (nmi)</strong> because 1 nmi corresponds to 1 minute of latitude and integrates cleanly with charts. Convert to <strong>kilometers</strong> for public reports, science communication, or local overland comparisons.</p>

          <h4 className="font-semibold text-foreground">Operational tips</h4>
          <ul className="list-disc ml-6 space-y-1">
            <li>Speed is commonly in <strong>knots</strong> (nmi/hour). For km/h, multiply knots by 1.852.</li>
            <li>For ETA, convert distance and keep speed unit consistent to avoid errors.</li>
            <li>Document the chart datum and route segments that include currents or wind drift.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
