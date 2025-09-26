
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const ingredientSchema = z.object({
  name: z.string().min(1, "Name required"),
  quantity: z.number().positive("Must be > 0"),
  unit: z.string().min(1, "Unit required"),
});

const formSchema = z.object({
  originalServings: z.number().int().positive(),
  desiredServings: z.number().int().positive(),
  ingredients: z.array(ingredientSchema).min(1, "At least one ingredient is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  name: string;
  newQuantity: number;
  unit: string;
}

export default function RecipeIngredientConverter() {
  const [result, setResult] = useState<Result[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originalServings: undefined,
      desiredServings: undefined,
      ingredients: [{ name: '', quantity: undefined, unit: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients"
  });

  const onSubmit = (values: FormValues) => {
    const { originalServings, desiredServings, ingredients } = values;
    const conversionFactor = desiredServings / originalServings;
    const newQuantities = ingredients.map(ing => ({
      name: ing.name,
      newQuantity: ing.quantity * conversionFactor,
      unit: ing.unit,
    }));
    setResult(newQuantities);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="originalServings" render={({ field }) => (
                <FormItem><FormLabel>Original Servings</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="desiredServings" render={({ field }) => (
                <FormItem><FormLabel>Desired Servings</FormLabel><FormControl><Input type="number" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <Card>
            <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr,100px,80px,auto] gap-2 items-start mb-2">
                  <FormField control={form.control} name={`ingredients.${index}.name`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Ingredient Name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`ingredients.${index}.quantity`} render={({ field }) => ( <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`ingredients.${index}.unit`} render={({ field }) => ( <FormItem><FormControl><Input placeholder="Unit" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', quantity: undefined, unit: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient</Button>
            </CardContent>
          </Card>
          <Button type="submit">Convert Recipe</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Adjusted Recipe</CardTitle></div></CardHeader>
            <CardContent>
                <CardDescription>For {form.getValues('desiredServings')} servings:</CardDescription>
                <ul className="mt-4 space-y-2">
                    {result.map((item, index) => (
                        <li key={index} className="flex justify-between border-b pb-2">
                            <span>{item.name}</span>
                            <span className="font-medium">{item.newQuantity.toFixed(2)} {item.unit}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Original Servings</h4><p>The number of servings the recipe was originally written for.</p></div>
              <div><h4 className="font-semibold text-foreground">Desired Servings</h4><p>The number of servings you want to make.</p></div>
              <div><h4 className="font-semibold text-foreground">Ingredients</h4><p>List each ingredient, its original quantity, and its unit (e.g., cups, grams, tsp). This allows the calculator to scale each one correctly.</p></div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines a conversion factor by dividing the desired servings by the original servings. It then multiplies the quantity of each ingredient by this factor to find the new, adjusted quantity needed for your desired serving size.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    