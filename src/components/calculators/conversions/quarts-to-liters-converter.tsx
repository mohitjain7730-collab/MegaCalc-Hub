
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
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  quarts: z.coerce.number().positive('Must be a positive number'),
  quartType: z.enum(['us', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

const US_QUART_TO_LITERS = 0.946353;
const IMPERIAL_QUART_TO_LITERS = 1.13652;

export default function QuartsToLitersConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quarts: undefined,
      quartType: 'us',
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.quartType === 'us') {
      setResult(values.quarts * US_QUART_TO_LITERS);
    } else {
      setResult(values.quarts * IMPERIAL_QUART_TO_LITERS);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="quarts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quarts (qt)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quartType"
              render={({ field }) => (
                <FormItem>
                    <FormLabel>Quart Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="us">US Quart</SelectItem>
                            <SelectItem value="imperial">Imperial Quart</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <ArrowRightLeft className="h-8 w-8 text-primary" />
              <CardTitle>Conversion Result</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(3)} Liters</p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/liters-to-quarts-converter" className="text-primary underline">Liters to Quarts Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
