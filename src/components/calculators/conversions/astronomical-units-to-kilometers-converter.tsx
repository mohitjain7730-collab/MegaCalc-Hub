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
  au: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const AU_TO_KM = 149597870.7;

export default function AstronomicalUnitsToKilometersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      au: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.au * AU_TO_KM);
  };

  const conversionTable = [
    { au: 1, km: 1 * AU_TO_KM },
    { au: 2, km: 2 * AU_TO_KM },
    { au: 5, km: 5 * AU_TO_KM },
    { au: 10, km: 10 * AU_TO_KM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="au"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Astronomical Units (AU)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} km</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilometers = Astronomical Units × 149,597,870.7</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The calculation is based on the internationally defined value of an Astronomical Unit (AU). To convert a distance from AU to kilometers, you simply multiply the number of AU by the conversion factor of 149,597,870.7. For example, the distance to Mars is about 1.5 AU, which equals 1.5 × 149,597,870.7 ≈ 224.4 million km.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Astronomical Units (AU)</TableHead>
                <TableHead className="text-right">Kilometers (km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.au}>
                  <TableCell>{item.au}</TableCell>
                  <TableCell className="text-right">{item.km.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is an Astronomical Unit (AU)?</h4>
              <p>An Astronomical Unit is a unit of length, roughly the distance from Earth to the Sun. It's used for measuring distances within our solar system because the vast numbers involved in kilometers or miles become unwieldy.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why is this unit used instead of light-years?</h4>
              <p>While light-years are used for interstellar distances, AU is more practical for distances within our solar system. For instance, Jupiter is about 5.2 AU from the Sun, a much more manageable number than its distance in light-years (which is about 0.00008 light-years).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/light-years-to-kilometers-converter" className="text-primary underline">Light Years to Kilometers Converter</Link></p>
            <p><Link href="/category/conversions/parsecs-to-light-years-converter" className="text-primary underline">Parsecs to Light Years Converter</Link></p>
            <p><Link href="/category/conversions/kilometers-to-miles-converter" className="text-primary underline">Kilometers to Miles Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
