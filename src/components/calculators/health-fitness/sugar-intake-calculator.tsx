'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, PlusCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const itemSchema = z.object({
  name: z.string().optional(),
  sugar: z.number().nonnegative(),
  servings: z.number().int().positive(),
});

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  items: z.array(itemSchema).min(1, "Please add at least one item."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SugarIntakeCalculator() {
  const [result, setResult] = useState<{ total: number; limit: number; percent: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'female',
      items: [{ name: '', sugar: undefined, servings: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = (values: FormValues) => {
    const totalSugar = values.items.reduce((sum, item) => sum + (item.sugar || 0) * item.servings, 0);
    const limit = values.sex === 'male' ? 36 : 25;
    const percent = (totalSugar / limit) * 100;
    setResult({ total: totalSugar, limit, percent });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="sex" render={({ field }) => (
            <FormItem><FormLabel>Sex</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
              </Select>
            </FormItem>
          )} />

          <Card>
            <CardHeader><CardTitle>Food & Drink Log</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,100px,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`items.${index}.name`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Product</FormLabel><FormControl><Input placeholder="Product Name" {...field} /></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.sugar`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Sugar</FormLabel><FormControl><Input type="number" placeholder="Sugar (g)" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)}/></FormControl></FormItem>)} />
                  <FormField control={form.control} name={`items.${index}.servings`} render={({ field }) => (<FormItem><FormLabel className="sr-only">Servings</FormLabel><FormControl><Input type="number" placeholder="Servings" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)}/></FormControl></FormItem>)} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', sugar: undefined, servings: 1 })}><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
            </CardContent>
          </Card>
          <Button type="submit">Calculate Sugar Intake</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Cookie className="h-8 w-8 text-primary" /><CardTitle>Daily Added Sugar Intake</CardTitle></div></CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result.total.toFixed(1)}g / {result.limit}g</p>
            <CardDescription className="mt-2">You have consumed {result.percent.toFixed(0)}% of the recommended daily limit.</CardDescription>
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
                <p>The calculator sums the grams of added sugar from all logged items and compares the total against the American Heart Association (AHA) guidelines (36g for men, 25g for women), which are pre-set based on your sex.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
