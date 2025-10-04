
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  gallons: z.coerce.number().positive('Must be a positive number'),
  gallonType: z.enum(['us', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const US_GALLON_TO_LITERS = 3.78541;
const IMPERIAL_GALLON_TO_LITERS = 4.54609;

export default function GallonsToLitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gallons: undefined,
      gallonType: 'us',
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.gallonType === 'us') {
      setResult(values.gallons * US_GALLON_TO_LITERS);
    } else {
      setResult(values.gallons * IMPERIAL_GALLON_TO_LITERS);
    }
  };

  const gallonType = form.watch('gallonType');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="gallons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gallons</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gallonType"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Gallon Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="us">US Gallon</SelectItem>
                            <SelectItem value="imperial">Imperial Gallon</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
              )}
            />
          </div>
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
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} Liters</p>
            <CardDescription className="mt-2 text-center">
              {form.getValues('gallons')} {gallonType === 'us' ? 'US' : 'Imperial'} gallons is equal to {result.toFixed(2)} liters.
            </CardDescription>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Formula</h4>
              <p className='font-mono p-2 bg-muted rounded-md'>Liters = Gallons × Conversion Factor</p>
              <ul className="list-disc list-inside pl-4 mt-2">
                <li>US Gallon to Liters factor: 3.78541</li>
                <li>Imperial Gallon to Liters factor: 4.54609</li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">FAQ</h3>
          <div className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">What's the difference between a US gallon and an Imperial gallon?</h4>
              <p>The US gallon is smaller than the Imperial gallon. One Imperial gallon is equal to about 1.2 US gallons. This is a common source of confusion when dealing with international volume measurements.</p>
            </div>
             <div>
              <h4 className="font-semibold text-foreground mb-1">Example</h4>
              <p>A 10 US gallon tank holds approximately 37.85 liters.</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/liters-to-gallons-converter" className="text-primary underline">Liters to Gallons Converter</Link></p>
            <p><Link href="/category/conversions/cubic-feet-to-gallons-converter" className="text-primary underline">Cubic Feet to Gallons Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
