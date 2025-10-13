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
  chains: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const CHAINS_TO_METERS = 20.1168;

export default function ChainsToMetersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chains: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.chains * CHAINS_TO_METERS);
  };

  const conversionTable = [
    { chains: 1, meters: 1 * CHAINS_TO_METERS },
    { chains: 2, meters: 2 * CHAINS_TO_METERS },
    { chains: 5, meters: 5 * CHAINS_TO_METERS },
    { chains: 10, meters: 10 * CHAINS_TO_METERS },
  ];

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="chains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chains</FormLabel>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} m</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Meters = Chains × 20.1168</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Step-by-step explanation</h4>
              <p>One chain is an old surveying unit equal to 66 feet. To convert chains to meters, you multiply the number of chains by the conversion factor of 20.1168. For example, a property line of 10 chains is 10 × 20.1168 = 201.168 meters long.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conversion Table</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chains</TableHead>
                <TableHead className="text-right">Meters (m)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionTable.map((item) => (
                <TableRow key={item.chains}>
                  <TableCell>{item.chains}</TableCell>
                  <TableCell className="text-right">{item.meters.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What is a chain?</h4>
              <p>A chain is a unit of length used in surveying, equal to 66 feet or 22 yards. It was historically significant in measuring land in the British Empire and the United States.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Why do some old land deeds use chains?</h4>
              <p>The chain was a convenient unit for land measurement because 10 square chains equals one acre, making area calculations straightforward for surveyors using a physical chain.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/rods-to-feet-converter" className="text-primary underline">Rods to Feet Converter</Link></p>
            <p><Link href="/category/conversions/yards-to-meters-converter" className="text-primary underline">Yards to Meters Converter</Link></p>
            <p><Link href="/category/conversions/feet-to-meters-converter" className="text-primary underline">Feet to Meters Converter</Link></p>
          </div>
        </div>
        <section
          className="space-y-4 text-muted-foreground leading-relaxed"
          itemScope
          itemType="https://schema.org/Article"
        >
          <meta itemProp="headline" content="Chains to Meters – Land Surveying Guide" />
          <meta itemProp="author" content="MegaCalc Hub Team" />
          <meta itemProp="about" content="Convert historical surveying units to SI for deeds, maps, and GIS layers with clarity." />

          <h3 itemProp="name" className="text-lg font-semibold text-foreground">Modernize legacy measurements</h3>
          <p itemProp="description">Older deeds and maps may list distances in chains. Convert to meters for modern GIS systems, but preserve the original unit in metadata.</p>

          <ul className="list-disc ml-6 space-y-1">
            <li>Note that 10 square chains = 1 acre; keep area units consistent.</li>
            <li>Digitize with sufficient precision to prevent area drift after conversion.</li>
            <li>Store projection and datum alongside converted values.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
