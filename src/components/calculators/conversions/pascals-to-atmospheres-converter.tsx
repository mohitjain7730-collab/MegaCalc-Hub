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
  pascals: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PA_TO_ATM = 1 / 101325;

export default function PascalsToAtmospheresConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { pascals: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.pascals * PA_TO_ATM);
  };

  const conversionTable = [
    { pa: 1, atm: 1 * PA_TO_ATM },
    { pa: 1000, atm: 1000 * PA_TO_ATM },
    { pa: 101325, atm: 1 },
    { pa: 200000, atm: 200000 * PA_TO_ATM },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="pascals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pascals (Pa)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toExponential(4)} atm</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>atm = Pa / 101325</p>
          <p>One standard atmosphere (atm) is internationally defined as 101,325 Pascals (Pa). To convert Pascals to atmospheres, you divide by this constant.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>A typical atmospheric pressure reading might be 100,000 Pa. This is equal to `100000 / 101325 ≈ 0.987 atm`.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
        <p className="text-muted-foreground">This conversion is fundamental in physics, chemistry, meteorology, and engineering, especially when dealing with gas laws and atmospheric data.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Pascals (Pa)</TableHead><TableHead className="text-right">Atmospheres (atm)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.pa}>
                <TableCell>{item.pa.toLocaleString()}</TableCell>
                <TableCell className="text-right">{item.atm.toExponential(3)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">FAQ</h3>
        <div className="text-muted-foreground space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">What’s the formula to convert Pa to atm?</h4>
            <p>Divide the pressure in Pascals by 101,325 to get the pressure in standard atmospheres.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">How many Pascals are in an atmosphere?</h4>
            <p>There are exactly 101,325 Pascals in one standard atmosphere.</p>
          </div>
        </div>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/atmospheres-to-pascals-converter" className="text-primary underline">Atmospheres to Pascals Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
