
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
  ft_lbs_s: z.coerce.number().positive('Must be a positive number'),
});

type FormValues = z.infer<typeof formSchema>;

const FTLBS_S_TO_WATTS = 1.35582;

export default function FootPoundsPerSecondToWattsConverter() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { ft_lbs_s: undefined },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.ft_lbs_s * FTLBS_S_TO_WATTS);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="ft_lbs_s" render={({ field }) => (
            <FormItem>
              <FormLabel>Foot-Pounds per Second (ft·lb/s)</FormLabel>
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
          <CardContent><p className="text-3xl font-bold text-center">{result.toFixed(4)} W</p></CardContent>
        </Card>
      )}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula & Explanation</h3>
          <div className="text-muted-foreground space-y-4">
            <p className='font-mono p-2 bg-muted rounded-md'>Watts = ft·lb/s × 1.35582</p>
          </div>
        </div>
         <div>
          <h3 className="text-lg font-semibold mb-2">Related Converters</h3>
          <div className="space-y-2">
            <p><Link href="/category/conversions/watts-to-foot-pounds-per-second-converter" className="text-primary underline">Watts to ft·lb/s Converter</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
