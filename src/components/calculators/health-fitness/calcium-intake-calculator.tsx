
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  age: z.coerce.number(),
  diet: z.enum(['normal', 'vegan', 'vegetarian']),
  calciumIntake: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CalciumIntakeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 1000, // Default to 19-50 years
      diet: 'normal',
      calciumIntake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, diet, calciumIntake } = values;
    let recommended = age;

    if (diet === 'vegan') {
      recommended += 200;
    } else if (diet === 'vegetarian') {
      recommended += 100;
    }

    if (isNaN(calciumIntake) || calciumIntake < 0) {
      setResult("Please enter a valid calcium intake value.");
      return;
    }

    const difference = recommended - calciumIntake;
    let message = "";

    if (difference > 0) {
      message = `You may need ~${difference.toFixed(0)} mg more calcium to meet your daily requirement of ${recommended} mg.`;
    } else if (difference < 0) {
      message = `You are consuming ~${Math.abs(difference).toFixed(0)} mg more than the recommended ${recommended} mg per day.`;
    } else {
      message = `You are meeting your daily calcium requirement of ${recommended} mg.`;
    }

    setResult(message);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="700">1-3 years</SelectItem>
                      <SelectItem value="1000">4-8 years</SelectItem>
                      <SelectItem value="1300">9-18 years</SelectItem>
                      <SelectItem value="1000">19-50 years</SelectItem>
                      <SelectItem value="1200">51-70 years</SelectItem>
                      <SelectItem value="1200">71+ years</SelectItem>
                      <SelectItem value="1000">Pregnant/Lactating</SelectItem>
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
                  <FormLabel>Diet Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Regular Diet</SelectItem>
                      <SelectItem value="vegan">Vegan Diet</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian Diet</SelectItem>
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
                  <FormLabel>Average Daily Calcium Intake (mg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter your current calcium intake"
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Bone className="h-8 w-8 text-primary" />
              <CardTitle>Calcium Intake Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-center">{result}</p>
            <CardDescription className="mt-4 text-center text-xs">
              This is an estimate. Dietary needs vary. Consult a healthcare provider for personalized advice.
            </CardDescription>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Age Group</h4>
                  <p>Different age groups have different Recommended Dietary Allowances (RDA) for calcium as set by health authorities like the NIH.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Diet Type</h4>
                  <p>Calcium from plant-based sources can be less bioavailable due to compounds like oxalates and phytates. This calculator adds a small buffer for vegan and vegetarian diets to account for this.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Daily Calcium Intake (mg)</h4>
                  <p>Your best estimate of the total calcium you consume daily from all sources, including food and supplements.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines your estimated daily calcium requirement based on standard RDA values for your age group. It then makes a slight upward adjustment for vegan or vegetarian diets and compares this recommendation to your stated current intake, providing feedback on the difference.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
