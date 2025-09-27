
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const itemSchema = z.object({
  name: z.string().optional(),
  cost: z.number().nonnegative("Cannot be negative").optional(),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one cost item."),
  people: z.number().int().positive("Must be at least 1 person"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PartyBudgetPerPersonCalculator() {
  const [result, setResult] = useState<{ perPerson: number; total: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: [{ name: '', cost: undefined }],
      people: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalCost = values.items.reduce((sum, item) => sum + (item.cost || 0), 0);
    const perPersonCost = totalCost / values.people;
    setResult({ perPerson: perPersonCost, total: totalCost });
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="people" render={({ field }) => (
                    <FormItem><FormLabel>Number of People</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />

                <CardDescription>Enter all the costs associated with the party.</CardDescription>
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start mb-2">
                        <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Item</FormLabel><FormControl><Input placeholder="e.g., Decorations" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`items.${index}.cost`} render={({ field }) => (
                             <FormItem><FormLabel className="sr-only">Cost</FormLabel><FormControl><Input type="number" placeholder="Cost" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', cost: undefined })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                <Button type="submit">Calculate</Button>
            </form>
        </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Users className="h-8 w-8 text-primary" /><CardTitle>Party Cost Breakdown</CardTitle></div></CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <CardDescription>Total Party Cost</CardDescription>
                    <p className="text-2xl font-bold">${result.total.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </div>
                 <div className="pt-4 border-t">
                    <CardDescription>Cost Per Person</CardDescription>
                    <p className="text-3xl font-bold">${result.perPerson.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
