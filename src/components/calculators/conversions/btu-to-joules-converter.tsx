
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
  btu: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const BTU_TO_JOULES = 1055.06;

export default function BtuToJoulesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      btu: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.btu * BTU_TO_JOULES);
  };

  const conversionTable = [
    { btu: 1, joules: 1 * BTU_TO_JOULES },
    { btu: 10, joules: 10 * BTU_TO_JOULES },
    { btu: 1000, joules: 1000 * BTU_TO_JOULES },
    { btu: 3412, joules: 3412 * BTU_TO_JOULES }, // 1 kWh
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="btu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>British Thermal Units (BTU)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toLocaleString()} J</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Joules = BTU × 1055.06</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>An air conditioner with a cooling capacity of 10,000 BTU is equivalent to `10,000 * 1055.06 = 10,550,600 Joules` of energy removal.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">This conversion is essential in HVAC and engineering to translate the imperial unit of heat energy (BTU) to the standard SI unit (Joules).</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BTU</TableHead>
                <TableHead className="text-right">Joules (J)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.btu}>
                  <TableCell>{item.btu}</TableCell>
                  <TableCell className="text-right">{item.joules.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a BTU?</h4>
              <p>A British Thermal Unit is the amount of heat energy required to raise the temperature of one pound of water by one degree Fahrenheit.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/joules-to-btu-converter" className="text-primary underline">Joules to BTU Converter</Link></p>
            <p><Link href="/category/conversions/kwh-to-btu-converter" className="text-primary underline">kWh to BTU Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
