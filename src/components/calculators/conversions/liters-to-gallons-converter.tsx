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
  liters: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const LITERS_TO_US_GALLONS = 0.264172;
const LITERS_TO_IMPERIAL_GALLONS = 0.219969;

export default function LitersToGallonsConverter() {
  const [result, setResult] = useState<{ usGallons: number; imperialGallons: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liters: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult({
        usGallons: values.liters * LITERS_TO_US_GALLONS,
        imperialGallons: values.liters * LITERS_TO_IMPERIAL_GALLONS,
    });
  };

  const conversionTable = [
    { liters: 1, usGallons: 1 * LITERS_TO_US_GALLONS, imperialGallons: 1 * LITERS_TO_IMPERIAL_GALLONS },
    { liters: 3.785, usGallons: 1, imperialGallons: 3.785 * LITERS_TO_IMPERIAL_GALLONS },
    { liters: 10, usGallons: 10 * LITERS_TO_US_GALLONS, imperialGallons: 10 * LITERS_TO_IMPERIAL_GALLONS },
    { liters: 20, usGallons: 20 * LITERS_TO_US_GALLONS, imperialGallons: 20 * LITERS_TO_IMPERIAL_GALLONS },
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
                    <p className="text-2xl font-bold">{result.usGallons.toFixed(3)} gal</p>
                </div>
                <div>
                    <p className="font-semibold">Imperial Gallons</p>
                    <p className="text-2xl font-bold">{result.imperialGallons.toFixed(3)} gal</p>
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
              <p className='font-mono p-2 bg-muted rounded-md'>US Gallons = Liters × 0.264172</p>
              <p className='font-mono p-2 bg-muted rounded-md mt-2'>Imperial Gallons = Liters × 0.219969</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A 2-liter soda bottle is equal to 2 × 0.264172 = 0.528 US gallons.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Liters (L)</TableHead>
                <TableHead className="text-right">US Gallons</TableHead>
                <TableHead className="text-right">Imperial Gallons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.liters}>
                  <TableCell>{item.liters}</TableCell>
                  <TableCell className="text-right">{item.usGallons.toFixed(3)}</TableCell>
                  <TableCell className="text-right">{item.imperialGallons.toFixed(3)}</TableCell>
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
                <p>A US liquid gallon is legally defined as 231 cubic inches, which is about 3.785 liters. An Imperial gallon, used in the UK and some Commonwealth countries, is defined as 4.54609 liters. The Imperial gallon is approximately 20% larger than the US gallon.</p>
                </div>
            </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/gallons-to-liters-converter" className="text-primary underline">Gallons to Liters Converter</Link></p>
            <p><Link href="/category/conversions/cups-to-milliliters-converter" className="text-primary underline">Cups to Milliliters Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
