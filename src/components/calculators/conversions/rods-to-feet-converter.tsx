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
  rods: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const RODS_TO_FEET = 16.5;

export default function RodsToFeetConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rods: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.rods * RODS_TO_FEET);
  };

  const conversionTable = [
    { rods: 1, feet: 1 * RODS_TO_FEET },
    { rods: 4, feet: 4 * RODS_TO_FEET }, // 1 chain
    { rods: 10, feet: 10 * RODS_TO_FEET },
    { rods: 40, feet: 40 * RODS_TO_FEET }, // 1 furlong
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="rods"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rods (or Poles/Perches)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} feet</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Feet = Rods × 16.5</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One rod is defined as exactly 16.5 feet. To convert from rods to feet, you simply multiply the number of rods by 16.5. For example, a distance of 4 rods is 4 × 16.5 = 66 feet (which is also one chain).</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rods</TableHead>
                <TableHead className="text-right">Feet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.rods}>
                  <TableCell>{item.rods}</TableCell>
                  <TableCell className="text-right">{item.feet.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a rod?</h4>
              <p>A rod, also known as a pole or a perch, is a historical surveying unit of length equal to 16.5 feet. It was commonly used in England and its colonies for land measurement.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/chains-to-meters-converter" className="text-primary underline">Chains to Meters Converter</Link></p>
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Rods to Feet – Historical Survey Units Guide" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Handling rods, poles, perches in modern documents and converting to feet with proper context." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Preserve provenance</h3>
          <p itemProp="description">When transcribing historic surveys, retain the original text and show converted feet in parentheses to maintain authenticity and legal clarity.</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>1 rod = 16.5 ft; 4 rods = 1 chain; 40 rods = 1 furlong.</li>
            <li>For property disputes, cite both original and converted measurements.</li>
            <li>Record measurement date and source to aid future audits.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
