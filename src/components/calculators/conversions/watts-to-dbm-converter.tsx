
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

const formSchema = z.object({
  watts: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

export default function WattsToDbmConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { watts: undefined },
  });

  const onSubmit = (values: FormValues) => {
    const milliwatts = values.watts * 1000;
    setResult(10 * Math.log10(milliwatts));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="watts" render={({ field }) => (
            <FormItem>
              <FormLabel>Watts (W)</FormLabel>
              <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={field.onChange} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit">Convert</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><ArrowRightLeft className="h-8 w-8 text-primary" /><CardTitle>Conversion Result</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(2)} dBm</p></CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <p className='font-mono p-2 bg-muted rounded-md'>dBm = 10 * log₁₀(Power in milliwatts)</p>
          </div>
        </div>
         <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/dbm-to-watts-converter" className="text-primary underline">dBm to Watts Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
