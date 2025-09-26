
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const costSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cost: z.number().nonnegative(),
});

const formSchema = z.object({
  costs: z.array(costSchema),
  days: z.number().int().positive(),
  people: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TravelBudgetEstimator() {
  const [result, setResult] = useState<{ total: number; perPersonPerDay: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costs: [
        { name: 'Flights', cost: undefined },
        { name: 'Accommodation (Total)', cost: undefined },
        { name: 'Food (Per Day)', cost: undefined },
        { name: 'Activities (Total)', cost: undefined },
      ],
      days: undefined,
      people: 1
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costs"
  });

  const onSubmit = (values: FormValues) => {
    const totalCost = values.costs.reduce((sum, item) => {
        if (item.name.toLowerCase().includes('per day')) {
            return sum + (item.cost || 0) * values.days * values.people;
        }
        return sum + (item.cost || 0);
    }, 0);
    const perPersonPerDay = totalCost / values.people / values.days;
    setResult({ total: totalCost, perPersonPerDay });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="days" render={({ field }) => (
                <FormItem><FormLabel>Number of Days</FormLabel><FormControl><Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="people" render={({ field }) => (
                <FormItem><FormLabel>Number of People</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <Card>
              <CardHeader>
                  <CardTitle>Estimated Costs</CardTitle>
                  <CardDescription>Enter your estimated costs. For daily costs like food, add '(Per Day)' to the name.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`costs.${index}.name`} render={({ field }) => (
                                <FormItem><FormLabel className="sr-only">Cost Name</FormLabel><FormControl><Input placeholder="e.g., Flights" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name={`costs.${index}.cost`} render={({ field }) => (
                                <FormItem><FormLabel className="sr-only">Cost Value</FormLabel><FormControl><Input type="number" placeholder="Cost" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <XCircle className="h-5 w-5 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', cost: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Cost Item
                    </Button>
                  </div>
              </CardContent>
          </Card>
          
          <Button type="submit">Estimate Budget</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Plane className="h-8 w-8 text-primary" /><CardTitle>Trip Budget Estimate</CardTitle></div></CardHeader>
            <CardContent className="text-center space-y-4">
                <div>
                    <CardDescription>Total Estimated Cost</CardDescription>
                    <p className="text-3xl font-bold">${result.total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                 <div className="pt-4 border-t">
                    <CardDescription>Cost Per Person, Per Day</CardDescription>
                    <p className="text-2xl font-bold">${result.perPersonPerDay.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Number of Days & People</h4>
                  <p>The total duration of your trip and the number of people sharing the budget. These are used to calculate daily and per-person costs.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Estimated Costs</h4>
                  <p>List all your anticipated expenses. For costs that occur daily (like food or local transport), include "(Per Day)" in the name. The calculator will automatically multiply these by the number of days and people. For one-time costs (like flights or total accommodation), just enter the total amount.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This flexible budget estimator categorizes your costs to provide a comprehensive trip total.</p>
                 <ul className="list-disc list-inside space-y-2 mt-2">
                    <li><strong>Daily Costs:</strong> If an item name contains "(Per Day)", its cost is multiplied by the number of days and the number of people.</li>
                    <li><strong>Total Costs:</strong> Any other cost is treated as a one-time, fixed expense for the entire group.</li>
                    <li><strong>Total Budget:</strong> The calculator sums up all fixed costs and all calculated daily costs to give you a grand total for the trip. It also breaks this down into a useful "per person, per day" figure to help you gauge daily spending.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
