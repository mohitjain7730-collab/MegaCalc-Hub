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
  psi: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PSI_TO_PA = 6894.76;

export default function PsiToPascalsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { psi: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.psi * PSI_TO_PA);
  };

  const conversionTable = [
    { psi: 1, pa: 1 * PSI_TO_PA },
    { psi: 14.7, pa: 14.7 * PSI_TO_PA },
    { psi: 30, pa: 30 * PSI_TO_PA },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="psi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pounds per Square Inch (psi)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>Pa = psi × 6894.76</p>
          <p>Multiply the pressure in psi by 6,894.76 to get the pressure in Pascals.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>A standard car tire pressure of 32 psi is equal to `32 * 6894.76 ≈ 220,632 Pa`.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>PSI</TableHead><TableHead className="text-right">Pascals (Pa)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.psi}>
                <TableCell>{item.psi}</TableCell>
                <TableCell className="text-right">{item.pa.toLocaleString(undefined, {maximumFractionDigits: 0})}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/pascals-to-psi-converter" className="text-primary underline">Pascals to PSI Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
