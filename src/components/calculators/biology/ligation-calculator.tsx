
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  vectorMass: z.number().positive(),
  vectorLength: z.number().positive(),
  insertLength: z.number().positive(),
  molarRatio: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LigationCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { vectorMass: undefined, vectorLength: undefined, insertLength: undefined, molarRatio: 3 },
  });

  const onSubmit = (values: FormValues) => {
    const { vectorMass, vectorLength, insertLength, molarRatio } = values;
    const insertMass = vectorMass * (insertLength / vectorLength) * molarRatio;
    setResult(insertMass);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="vectorMass" render={({ field }) => (
                <FormItem><FormLabel>Vector Mass (ng)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="molarRatio" render={({ field }) => (
                <FormItem><FormLabel>Insert:Vector Molar Ratio</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="vectorLength" render={({ field }) => (
                <FormItem><FormLabel>Vector Length (bp)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="insertLength" render={({ field }) => (
                <FormItem><FormLabel>Insert Length (bp)</FormLabel><FormControl><Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Insert Mass</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Link2 className="h-8 w-8 text-primary" /><CardTitle>Required Insert Mass</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)} ng</p>
                <CardDescription className='mt-4 text-center'>This is the mass of insert DNA required for your ligation reaction.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines the required mass of an insert for a ligation reaction based on a desired molar ratio of insert to vector. The formula used is: `Insert Mass = Vector Mass * (Insert Length / Vector Length) * Molar Ratio`.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
