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
  parsecs: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const PARSECS_TO_LIGHT_YEARS = 3.26156;

export default function ParsecsToLightYearsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parsecs: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.parsecs * PARSECS_TO_LIGHT_YEARS);
  };

  const conversionTable = [
    { parsecs: 1, ly: 1 * PARSECS_TO_LIGHT_YEARS },
    { parsecs: 1.3, ly: 1.3 * PARSECS_TO_LIGHT_YEARS }, // Proxima Centauri
    { parsecs: 8, ly: 8 * PARSECS_TO_LIGHT_YEARS }, // Sirius
    { parsecs: 1000, ly: 1000 * PARSECS_TO_LIGHT_YEARS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="parsecs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parsecs (pc)</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(4)} light-years</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Light Years = Parsecs × 3.26156</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One parsec is defined as the distance at which one astronomical unit subtends an angle of one arcsecond. This distance is approximately equal to 3.26156 light-years. To convert parsecs to light-years, you multiply the number of parsecs by this factor. For example, Sirius, one of the brightest stars, is about 8 parsecs away, which is 8 × 3.26156 ≈ 26.1 light-years.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parsecs (pc)</TableHead>
                <TableHead className="text-right">Light Years (ly)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.parsecs}>
                  <TableCell>{item.parsecs}</TableCell>
                  <TableCell className="text-right">{item.ly.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a parsec?</h4>
              <p>A parsec (parallax of one arcsecond) is a unit of length used to measure the large distances to astronomical objects outside the Solar System. It's based on trigonometric parallax, a method for determining distance.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/light-years-to-kilometers-converter" className="text-primary underline">Light Years to Kilometers Converter</Link></p>
            <p><Link href="/category/conversions/astronomical-units-to-kilometers-converter" className="text-primary underline">Astronomical Units to Kilometers Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Parsecs to Light-Years – Astrophysics Reference Guide" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Explain parsec vs light-year, when to prefer each unit, and how to report values in outreach and research settings." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Parsec vs Light‑Year</h3>
          <p itemProp="description">Use <strong>parsecs</strong> in professional astronomy (tied to parallax) and <strong>light‑years</strong> for general audiences. Include both to maximize clarity.</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>Write: 8 pc (≈ 26.1 ly) to serve both expert and lay readers.</li>
            <li>For catalogs, be consistent with the unit convention of the dataset.</li>
            <li>Provide the cosmology parameters if distances depend on them.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
