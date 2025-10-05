
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

const WATTS_TO_HP = 1 / 745.7;

export default function WattsToHorsepowerConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { watts: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.watts * WATTS_TO_HP);
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
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(3)} hp</p></CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <p className='font-mono p-2 bg-muted rounded-md'>Horsepower = Watts / 745.7</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
          <p className="text-muted-foreground">Primarily used in automotive and mechanical engineering to convert from the standard SI unit of power (watts) to the more traditional unit of horsepower.</p>
        </div>
         <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/horsepower-to-watts-converter" className="text-primary underline">Horsepower to Watts Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
