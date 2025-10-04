
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
  ounces: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const OUNCES_TO_KG = 0.0283495;

export default function OuncesToKilogramsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ounces: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ounces * OUNCES_TO_KG);
  };

  const conversionTable = [
    { ounces: 1, kg: 1 * OUNCES_TO_KG },
    { ounces: 16, kg: 16 * OUNCES_TO_KG },
    { ounces: 35.274, kg: 35.274 * OUNCES_TO_KG },
    { ounces: 100, kg: 100 * OUNCES_TO_KG },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="ounces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ounces (oz)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} kg</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Kilograms = Ounces × 0.0283495</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>Since one ounce is approximately 28.3495 grams and there are 1,000 grams in a kilogram, one ounce is 0.0283495 kilograms. To convert from ounces to kilograms, you multiply the mass in ounces by this factor.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ounces (oz)</TableHead>
                <TableHead className="text-right">Kilograms (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.ounces}>
                  <TableCell>{item.ounces}</TableCell>
                  <TableCell className="text-right">{item.kg.toFixed(4)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/kilograms-to-ounces-converter" className="text-primary underline">Kilograms to Ounces Converter</Link></p>
            <p><Link href="/category/conversions/ounces-to-grams-converter" className="text-primary underline">Ounces to Grams Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
