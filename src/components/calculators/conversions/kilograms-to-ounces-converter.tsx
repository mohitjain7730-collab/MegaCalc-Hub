
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
  kg: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const KG_TO_OUNCES = 35.274;

export default function KilogramsToOuncesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kg: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kg * KG_TO_OUNCES);
  };

  const conversionTable = [
    { kg: 1, ounces: 1 * KG_TO_OUNCES },
    { kg: 5, ounces: 5 * KG_TO_OUNCES },
    { kg: 10, ounces: 10 * KG_TO_OUNCES },
    { kg: 50, ounces: 50 * KG_TO_OUNCES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kilograms (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={field.onChange} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} oz</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Ounces = Kilograms × 35.274</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One kilogram is equal to approximately 35.274 avoirdupois ounces. To convert kilograms to ounces, you simply multiply the mass in kilograms by this conversion factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kilograms (kg)</TableHead>
                <TableHead className="text-right">Ounces (oz)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kg}>
                  <TableCell>{item.kg}</TableCell>
                  <TableCell className="text-right">{item.ounces.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many ounces are in a kilogram?</h4>
              <p>There are approximately 35.274 ounces in one kilogram.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/ounces-to-kilograms-converter" className="text-primary underline">Ounces to Kilograms Converter</Link></p>
            <p><Link href="/category/conversions/kilograms-to-pounds-converter" className="text-primary underline">Kilograms to Pounds Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
