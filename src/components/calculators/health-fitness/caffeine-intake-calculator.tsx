
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const drinkTypes = {
  brewedCoffee: { name: 'Brewed Coffee (8 oz)', caffeine: 95 },
  espresso: { name: 'Espresso (1 oz)', caffeine: 64 },
  blackTea: { name: 'Black Tea (8 oz)', caffeine: 47 },
  greenTea: { name: 'Green Tea (8 oz)', caffeine: 28 },
  cola: { name: 'Cola (12 oz)', caffeine: 34 },
  energyDrink: { name: 'Energy Drink (8.4 oz)', caffeine: 80 },
};

const drinkSchema = z.object({
  type: z.string(),
  servings: z.number().int().nonnegative("Servings cannot be negative."),
});

const formSchema = z.object({
  drinks: z.array(drinkSchema).min(1, "Please add at least one item."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CaffeineIntakeCalculator() {
  const [result, setResult] = useState<{ total: number; percent: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drinks: [{ type: 'brewedCoffee', servings: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "drinks"
  });

  const onSubmit = (values: FormValues) => {
    const totalCaffeine = values.drinks.reduce((sum, drink) => {
        const caloriesPerServing = drinkTypes[drink.type as keyof typeof drinkTypes].caffeine;
        return sum + ((drink.servings || 0) * caloriesPerServing);
    }, 0);
    const safeLimit = 400;
    const percent = (totalCaffeine / safeLimit) * 100;
    setResult({ total: totalCaffeine, percent });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Caffeinated Drinks</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`drinks.${index}.type`} render={({ field }) => (
                    <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>{Object.entries(drinkTypes).map(([key, val]) => <SelectItem key={key} value={key}>{val.name}</SelectItem>)}</SelectContent>
                    </Select></FormItem>
                  )} />
                   <FormField control={form.control} name={`drinks.${index}.servings`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ type: 'brewedCoffee', servings: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Drink</Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Caffeine</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Coffee className="h-8 w-8 text-primary" /><CardTitle>Daily Caffeine Intake</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.total.toLocaleString()} mg / 400 mg</p>
            <CardDescription className="mt-2">You have consumed {result.percent.toFixed(0)}% of the recommended safe daily limit.</CardDescription>
            <div className="w-full bg-muted rounded-full h-4 mt-4 overflow-hidden">
                <div className="bg-primary h-4" style={{ width: `${Math.min(100, result.percent)}%` }}></div>
            </div>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator multiplies the quantity of each beverage by its average caffeine content (stored in a data table) and sums the totals to provide an estimate of the total caffeine consumed. This total is compared against the generally accepted safe daily limit of 400mg for healthy adults.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
