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
  cm: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CM_TO_INCHES = 0.393701;

export default function CentimetersToInchesConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cm: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.cm * CM_TO_INCHES);
  };

  const conversionTable = [
    { cm: 1, inches: 1 * CM_TO_INCHES },
    { cm: 5, inches: 5 * CM_TO_INCHES },
    { cm: 10, inches: 10 * CM_TO_INCHES },
    { cm: 25, inches: 25 * CM_TO_INCHES },
    { cm: 50, inches: 50 * CM_TO_INCHES },
    { cm: 100, inches: 100 * CM_TO_INCHES },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Centimeters (cm)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} inches</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Inches = Centimeters × 0.393701</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>The conversion is based on the international definition where 1 inch is exactly 2.54 centimeters. To convert centimeters to inches, you divide by 2.54, which is the same as multiplying by 1/2.54 (approximately 0.393701). For example, 30 cm is 30 × 0.393701 ≈ 11.81 inches.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Centimeters (cm)</TableHead>
                <TableHead className="text-right">Inches (in)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.cm}>
                  <TableCell>{item.cm}</TableCell>
                  <TableCell className="text-right">{item.inches.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">How many centimeters are in an inch?</h4>
              <p>There are exactly 2.54 centimeters in one inch.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why do the US and UK use different units?</h4>
              <p>The US primarily uses the imperial system (inches, feet, pounds), a system inherited from the British Empire. While the UK has officially adopted the metric system (meters, grams), imperial units are still commonly used in everyday life. Most of the world uses the metric system for its simplicity and base-ten structure.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/inches-to-centimeters-converter" className="text-primary underline">Inches to Centimeters Converter</Link></p>
            <p><Link href="/category/conversions/meters-to-feet-converter" className="text-primary underline">Meters to Feet Converter</Link></p>
            <p><Link href="/category/conversions/millimeters-to-inches-converter" className="text-primary underline">Millimeters to Inches Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
