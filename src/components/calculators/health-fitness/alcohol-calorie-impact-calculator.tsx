'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassWater, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const drinkTypes = {
  standardBeer: { name: 'Standard Beer (12 oz)', calories: 153 },
  lightBeer: { name: 'Light Beer (12 oz)', calories: 103 },
  redWine: { name: 'Red Wine (5 oz)', calories: 125 },
  whiteWine: { name: 'White Wine (5 oz)', calories: 121 },
  spirit: { name: 'Spirit (1.5 oz, 80-proof)', calories: 97 },
};

const drinkSchema = z.object({
  type: z.string(),
  servings: z.number().int().positive(),
});

const formSchema = z.object({
  drinks: z.array(drinkSchema).min(1, "Please add at least one drink."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlcoholCalorieImpactCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      drinks: [{ type: 'standardBeer', servings: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "drinks"
  });

  const onSubmit = (values: FormValues) => {
    const totalCalories = values.drinks.reduce((sum, drink) => {
        const caloriesPerServing = drinkTypes[drink.type as keyof typeof drinkTypes].calories;
        return sum + (drink.servings * caloriesPerServing);
    }, 0);
    setResult(totalCalories);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Your Drinks</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`drinks.${index}.type`} render={({ field }) => (
                    <FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>{Object.entries(drinkTypes).map(([key, val]) => <SelectItem key={key} value={key}>{val.name}</SelectItem>)}</SelectContent>
                    </Select></FormItem>
                  )} />
                   <FormField control={form.control} name={`drinks.${index}.servings`} render={({ field }) => (
                    <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
               <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ type: 'standardBeer', servings: 1 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Drink</Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Calories</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><GlassWater className="h-8 w-8 text-primary" /><CardTitle>Total Calorie Impact</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.toLocaleString()} kcal</p>
            <CardDescription className="mt-2">This represents {(result / 2300 * 100).toFixed(0)}% of a 2,300 calorie daily diet.</CardDescription>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>The calculator multiplies the quantity of each drink type by its stored average calorie value and sums the totals to provide a quick and simple estimate of total calorie consumption from alcohol.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
