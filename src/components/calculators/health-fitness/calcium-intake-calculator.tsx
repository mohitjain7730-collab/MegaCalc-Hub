
'use client';

import { useState } from 'react';
import { useForm } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const rdaOptions = [
    { value: "700", label: "1-3 years" },
    { value: "1000", label: "4-8 years" },
    { value: "1300", label: "9-18 years" },
    { value: "1000", label: "19-50 years" },
    { value: "1200", label: "51-70 years (Men)" },
    { value: "1200", label: "51-70 years (Women)" },
    { value: "1200", label: "71+ years" },
    { value: "1000", label: "Pregnant or Lactating Women" }, 
];

const dietOptions = [
    { value: "normal", label: "Regular Diet" },
    { value: "vegan", label: "Vegan Diet" },
    { value: "vegetarian", label: "Vegetarian Diet" },
];

const formSchema = z.object({
  ageGroupRda: z.coerce.number(),
  diet: z.enum(['normal', 'vegan', 'vegetarian']),
  calciumIntake: z.number().nonnegative("Intake cannot be negative."),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
  message: string;
  difference: number;
  recommended: number;
}

export default function CalciumIntakeCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ageGroupRda: 1000,
      diet: 'normal',
      calciumIntake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (values.calciumIntake === undefined) {
        form.setError("calciumIntake", { message: "Please enter your estimated calcium intake." });
        return;
    }
    
    let recommended = values.ageGroupRda;

    if (values.diet === "vegan") {
      recommended += 200; // Vegans may need more due to lower absorption from plant sources.
    } else if (values.diet === "vegetarian") {
      recommended += 100;
    }

    const difference = values.calciumIntake - recommended;
    let message = "";

    if (difference < 0) {
      message = `You need ${Math.abs(difference)} mg more calcium to meet your daily requirement of ${recommended} mg.`;
    } else if (difference > 0) {
      message = `You are consuming ${difference} mg more than the recommended ${recommended} mg.`;
    } else {
      message = `Perfect! You are meeting your daily calcium requirement of ${recommended} mg.`;
    }

    setResult({ message, difference, recommended });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ageGroupRda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group:</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {rdaOptions.map(opt => <SelectItem key={opt.label} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Type:</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {dietOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="calciumIntake"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Average Daily Calcium Intake (mg):</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter your current calcium intake" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Calculate Recommended Calcium</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Bone className="h-8 w-8 text-primary" />
              <CardTitle>Calcium Intake Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
             <p className={`text-lg font-semibold ${result.difference < 0 ? 'text-red-500' : 'text-green-500'}`}>{result.message}</p>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Age Group & Diet</h4>
              <p>Your age and diet are the primary factors determining your recommended daily allowance (RDA) for calcium.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Average Daily Calcium Intake</h4>
              <p>An estimate of the total calcium you consume from all sources (food and supplements) in a typical day.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The calculator uses standard RDA values for different age groups and applies an adjustment based on diet type, as plant-based diets can sometimes require higher intake due to lower absorption rates of calcium from plant sources. It then compares this recommendation to your current intake.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
