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

const KG_TO_LBS = 2.20462;

export default function KilogramsToPoundsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kg: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.kg * KG_TO_LBS);
  };

  const conversionTable = [
    { kg: 1, lbs: 1 * KG_TO_LBS },
    { kg: 5, lbs: 5 * KG_TO_LBS },
    { kg: 10, lbs: 10 * KG_TO_LBS },
    { kg: 50, lbs: 50 * KG_TO_LBS },
    { kg: 100, lbs: 100 * KG_TO_LBS },
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} lbs</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Pounds = Kilograms × 2.20462</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One kilogram is internationally defined as approximately 2.20462 pounds. To convert kilograms to pounds, you simply multiply the mass in kilograms by this conversion factor. For example, a person weighing 70 kg is 70 × 2.20462 ≈ 154.3 lbs.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kilograms (kg)</TableHead>
                <TableHead className="text-right">Pounds (lbs)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.kg}>
                  <TableCell>{item.kg}</TableCell>
                  <TableCell className="text-right">{item.lbs.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Which is heavier, a pound or a kilogram?</h4>
              <p>A kilogram is heavier. One kilogram is equal to about 2.2 pounds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why does the US use pounds?</h4>
              <p>The United States is one of the few countries that primarily uses the imperial system (including pounds), a system inherited from the British Empire. Most of the world has adopted the metric system (including kilograms) for its simplicity and standardization.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pounds-to-kilograms-converter" className="text-primary underline">Pounds to Kilograms Converter</Link></p>
            <p><Link href="/category/conversions/kilograms-to-stones-converter" className="text-primary underline">Kilograms to Stones Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
