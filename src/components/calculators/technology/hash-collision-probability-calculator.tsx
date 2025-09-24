
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Asterisk } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  bits: z.number().int().min(1, 'Must be at least 1 bit'),
  items: z.number().int().min(1, 'Must be at least 1 item'),
});

type FormValues = z.infer<typeof formSchema>;

export default function HashCollisionProbabilityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        bits: undefined,
        items: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { bits, items } = values;
    const d = Math.pow(2, bits);
    const k = items;
    
    // Approximation for birthday problem: p ≈ 1 - e^(-k^2 / 2d)
    const probability = 1 - Math.exp(-Math.pow(k, 2) / (2 * d));
    
    setResult(probability * 100);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the probability of at least one hash collision occurring, based on the birthday problem approximation.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bits" render={({ field }) => (
                <FormItem><FormLabel>Hash Length (bits)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="items" render={({ field }) => (
                <FormItem><FormLabel>Number of Hashed Items</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Probability</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Asterisk className="h-8 w-8 text-primary" /><CardTitle>Collision Probability</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result < 0.0001 ? '< 0.0001' : result.toFixed(4)}%</p>
                <CardDescription className='mt-4 text-center'>This is the chance that at least two items will have the same hash value.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses a common approximation for the "birthday problem" to estimate the probability of a hash collision. A hash collision occurs when two different inputs produce the same hash output. The number of possible unique hashes is 2 raised to the power of the number of bits. The probability of collision increases surprisingly quickly as you add more items.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
