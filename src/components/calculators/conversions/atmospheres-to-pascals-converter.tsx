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
  atm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const ATM_TO_PA = 101325;

export default function AtmospheresToPascalsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { atm: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.atm * ATM_TO_PA);
  };

  const conversionTable = [
    { atm: 1, pa: 1 * ATM_TO_PA },
    { atm: 0.5, pa: 0.5 * ATM_TO_PA },
    { atm: 2, pa: 2 * ATM_TO_PA },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="atm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atmospheres (atm)</FormLabel>
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
        <Card>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} Pa</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>Pa = atm × 101325</p>
          <p>Multiply the pressure in standard atmospheres (atm) by 101,325 to get the equivalent pressure in Pascals (Pa).</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>The atmospheric pressure at sea level is exactly 1 atm, which equals 101,325 Pa.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
        <p className="text-muted-foreground">Used in scientific research and engineering to convert from the standard atmosphere unit to the SI unit of pressure, Pascals.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Atmospheres (atm)</TableHead><TableHead className="text-right">Pascals (Pa)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.atm}>
                <TableCell>{item.atm}</TableCell>
                <TableCell className="text-right">{item.pa.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">FAQ</h3>
        <div className="text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">What’s the formula to convert atm to Pa?</h4>
            <p>Multiply atmospheres by 101,325 to get Pascals.</p>
          </div>
        </div>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pascals-to-atmospheres-converter" className="text-primary underline">Pascals to Atmospheres Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
