
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
  cubicFeet: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CUBIC_FEET_TO_US_GALLONS = 7.48052;
const CUBIC_FEET_TO_IMPERIAL_GALLONS = 6.22884;

export default function CubicFeetToGallonsConverter() {
  const [result, setResult] = useState<{ usGallons: number; imperialGallons: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cubicFeet: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
        usGallons: values.cubicFeet * CUBIC_FEET_TO_US_GALLONS,
        imperialGallons: values.cubicFeet * CUBIC_FEET_TO_IMPERIAL_GALLONS,
    });
  };

  const conversionTable = [
    { cubicFeet: 1, usGallons: 1 * CUBIC_FEET_TO_US_GALLONS, imperialGallons: 1 * CUBIC_FEET_TO_IMPERIAL_GALLONS },
    { cubicFeet: 10, usGallons: 10 * CUBIC_FEET_TO_US_GALLONS, imperialGallons: 10 * CUBIC_FEET_TO_IMPERIAL_GALLONS },
    { cubicFeet: 50, usGallons: 50 * CUBIC_FEET_TO_US_GALLONS, imperialGallons: 50 * CUBIC_FEET_TO_IMPERIAL_GALLONS },
    { cubicFeet: 100, usGallons: 100 * CUBIC_FEET_TO_US_GALLONS, imperialGallons: 100 * CUBIC_FEET_TO_IMPERIAL_GALLONS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cubicFeet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cubic Feet (ft³)</FormLabel>
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
                    <p className="font-semibold">US Gallons</p>
                    <p className="text-2xl font-bold">{result.usGallons.toFixed(2)} gal</p>
                </div>
                <div>
                    <p className="font-semibold">Imperial Gallons</p>
                    <p className="text-2xl font-bold">{result.imperialGallons.toFixed(2)} gal</p>
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
              <p className='font-mono p-2 bg-muted rounded-md'>US Gallons = Cubic Feet × 7.48052</p>
              <p className='font-mono p-2 bg-muted rounded-md mt-2'>Imperial Gallons = Cubic Feet × 6.22884</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The calculation is based on the standard definitions of a cubic foot and the respective gallons. To convert, you simply multiply the volume in cubic feet by the appropriate conversion factor for either US or Imperial gallons.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cubic Feet (ft³)</TableHead>
                <TableHead className="text-right">US Gallons</TableHead>
                <TableHead className="text-right">Imperial Gallons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.cubicFeet}>
                  <TableCell>{item.cubicFeet}</TableCell>
                  <TableCell className="text-right">{item.usGallons.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.imperialGallons.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What's the difference between a US gallon and an Imperial gallon?</h4>
              <p>The US gallon is smaller than the Imperial gallon. One Imperial gallon is equal to about 1.2 US gallons. This is a common source of confusion when dealing with international volume measurements.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example: How many gallons in a standard bathtub?</h4>
              <p>A standard bathtub holds about 10 cubic feet of water. This would be approximately 10 × 7.48 = 74.8 US gallons.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/gallons-to-cubic-feet-converter" className="text-primary underline">Gallons to Cubic Feet Converter</Link></p>
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
