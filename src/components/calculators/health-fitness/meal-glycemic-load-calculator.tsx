
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const foodItemSchema = z.object({
  name: z.string().optional(),
  gi: z.number().min(0).max(100),
  carbs: z.number().positive(),
});

const formSchema = z.object({
  items: z.array(foodItemSchema).min(1, "Add at least one food item."),
});

type FormValues = z.infer<typeof formSchema>;

const getGlCategory = (gl: number) => {
    if (gl <= 10) return { name: 'Low', color: 'text-green-500' };
    if (gl <= 19) return { name: 'Medium', color: 'text-yellow-500' };
    return { name: 'High', color: 'text-red-500' };
};

export default function MealGlycemicLoadCalculator() {
  const [result, setResult] = useState<{ gl: number; category: { name: string, color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: '', gi: undefined, carbs: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalGl = values.items.reduce((sum, item) => {
        const itemGl = ((item.gi || 0) * (item.carbs || 0)) / 100;
        return sum + itemGl;
    }, 0);
    setResult({ gl: totalGl, category: getGlCategory(totalGl) });
  };

  return (
    <div className="space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Meal Components</CardTitle>
              <CardDescription>Add each food item in your meal with its Glycemic Index (GI) and net carbs to calculate the total GL.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <div className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-center font-medium text-sm mb-2">
                            <FormLabel>Food Item</FormLabel>
                            <FormLabel className="text-center">GI (0-100)</FormLabel>
                            <FormLabel className="text-center">Net Carbs (g)</FormLabel>
                            <span></span>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,100px,100px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="e.g., Apple" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`items.${index}.gi`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`items.${index}.carbs`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', gi: undefined, carbs: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                    </div>
                    <Button type="submit">Calculate Total GL</Button>
                </form>
            </Form>
          </CardContent>
      </Card>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader>
                <div className='flex items-center gap-4'>
                    <Leaf className="h-8 w-8 text-primary" />
                    <CardTitle>Total Meal Glycemic Load</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-4xl font-bold">{result.gl.toFixed(1)}</p>
                 <p className={`mt-2 text-xl font-semibold ${result.category.color}`}>{result.category.name} Glycemic Load</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines the total Glycemic Load (GL) of a meal by first calculating the GL for each individual food item and then summing them up. This gives a more accurate picture of a meal's overall impact on blood sugar levels than looking at single ingredients in isolation.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
