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

const PSI_TO_ATM = 1 / 14.6959;

export default function PsiToAtmospheresConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { psi: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.psi * PSI_TO_ATM);
  };

  const conversionTable = [
    { psi: 14.696, atm: 1 },
    { psi: 30, atm: 30 * PSI_TO_ATM },
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
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} />
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} atm</p>
          </CardContent>
        </Card>
      )}
      <div>
        <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
        <div className="text-muted-foreground space-y-4">
          <p className='font-mono p-2 bg-muted rounded-md'>atm = psi / 14.6959</p>
          <p>Divide the pressure in psi by 14.6959 to get the pressure in standard atmospheres.</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Example Conversions</h3>
        <p>A scuba tank filled to 3000 psi contains a pressure of `3000 / 14.6959 ≈ 204 atm`.</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
        <Table>
          <TableHeader><TableRow><TableHead>PSI</TableHead><TableHead className="text-right">Atmospheres (atm)</TableHead></TableRow></TableHeader>
          <TableBody>
            {conversionTable.map((item) => (
              <TableRow key={item.psi}>
                <TableCell>{item.psi}</TableCell>
                <TableCell className="text-right">{item.atm.toFixed(4)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/atmospheres-to-psi-converter" className="text-primary underline">Atmospheres to PSI Converter</Link></p>
          </div>
        </div>
    </div>
  );
}
