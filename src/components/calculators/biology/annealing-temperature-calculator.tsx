
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  primer: z.string().regex(/^[ATCG]+$/i, 'Primer sequence can only contain A, T, C, G characters.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AnnealingTemperatureCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primer: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    const primer = values.primer.toUpperCase();
    const len = primer.length;
    let tm = 0;
    
    const nA = (primer.match(/A/g) || []).length;
    const nT = (primer.match(/T/g) || []).length;
    const nC = (primer.match(/C/g) || []).length;
    const nG = (primer.match(/G/g) || []).length;

    // Basic formula for oligos < 20bp
    if (len < 20) {
      tm = (nA + nT) * 2 + (nG + nC) * 4;
    } else {
    // More accurate formula for longer oligos
      tm = 81.5 + 0.41 * ((nG + nC) / len * 100) - (675 / len);
    }
    
    setResult(tm);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="primer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNA Primer Sequence</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ATGCGTACGTAGC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Calculate Tm</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Thermometer className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Melting Temperature (Tm)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(1)} °C</p>
            <CardDescription className='mt-4 text-center'>
              The optimal annealing temperature (Ta) for PCR is typically 3-5 °C below this Tm.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses two common formulas to estimate the melting temperature (Tm) of a DNA primer. For primers shorter than 20 bases, it uses the basic formula (2°C for A/T + 4°C for G/C). For longer primers, it uses a more complex formula that accounts for GC content and primer length.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
