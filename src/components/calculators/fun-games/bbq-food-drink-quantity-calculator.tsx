
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  adults: z.number().int().nonnegative().optional(),
  children: z.number().int().nonnegative().optional(),
}).refine(data => (data.adults || 0) + (data.children || 0) > 0, {
    message: "You must have at least one guest.",
    path: ["adults"],
});

type FormValues = z.infer<typeof formSchema>;

// Per person estimates
const estimates = {
    meat_lbs: { adult: 0.5, child: 0.25 },
    buns: { adult: 1.5, child: 1 },
    sides_cups: { adult: 1.5, child: 0.75 },
    drinks_oz: { adult: 32, child: 16 }
};

interface Result {
    meat: number;
    buns: number;
    sides: number;
    drinks: number;
}

export default function BbqFoodDrinkQuantityCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adults: undefined,
      children: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const adults = values.adults || 0;
    const children = values.children || 0;
    
    setResult({
        meat: adults * estimates.meat_lbs.adult + children * estimates.meat_lbs.child,
        buns: adults * estimates.buns.adult + children * estimates.buns.child,
        sides: adults * estimates.sides_cups.adult + children * estimates.sides_cups.child,
        drinks: adults * estimates.drinks_oz.adult + children * estimates.drinks_oz.child,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate how much food and drink you'll need for your BBQ based on the number of guests.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="adults" render={({ field }) => (
                <FormItem><FormLabel>Number of Adults</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="children" render={({ field }) => (
                <FormItem><FormLabel>Number of Children</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Quantities</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><UtensilsCrossed className="h-8 w-8 text-primary" /><CardTitle>Shopping List Estimate</CardTitle></div></CardHeader>
            <CardContent>
                <CardDescription>These are general guidelines. Adjust based on your crowd's appetite!</CardDescription>
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="font-bold text-lg">Meat</p>
                        <p className="text-xl font-bold">{result.meat.toFixed(1)} lbs</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="font-bold text-lg">Buns</p>
                        <p className="text-xl font-bold">{Math.ceil(result.buns)}</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="font-bold text-lg">Sides</p>
                        <p className="text-xl font-bold">{result.sides.toFixed(1)} cups</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="font-bold text-lg">Drinks</p>
                        <p className="text-xl font-bold">{(result.drinks / 128).toFixed(1)} gallons</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator uses standard catering estimates to approximate quantities. It assumes adults will consume more than children and provides totals for common BBQ items. For example, it typically budgets for about 1/2 pound of meat per adult and 1.5 buns.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
