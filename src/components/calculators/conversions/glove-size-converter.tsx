
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
import { Hand } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  handCircumference: z.number().positive(),
  unit: z.enum(['inch', 'cm']),
});

type FormValues = z.infer<typeof formSchema>;

interface Result {
    usUk: number;
    eu: number;
    japan: number;
    india: number;
}

export default function GloveSizeConverter() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      handCircumference: undefined,
      unit: 'inch',
    },
  });

  const onSubmit = (values: FormValues) => {
    let handInInches = values.handCircumference;
    if (values.unit === "cm") {
      handInInches = values.handCircumference / 2.54;
    }

    const usUkSize = Math.round(handInInches * 2) / 2;
    const euSize = Math.round(handInInches);
    const japanSize = Math.round(handInInches * 2.54);
    const indiaSize = Math.round(handInInches * 2.54 -1);

    setResult({
        usUk: usUkSize,
        eu: euSize,
        japan: japanSize,
        india: indiaSize
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>Measure the circumference of your dominant hand just below the knuckles (excluding the thumb) to find your glove size.</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="handCircumference"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hand Circumference ({unit})</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="inch">Inches</SelectItem>
                                <SelectItem value="cm">Centimeters</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
            </div>
          <Button type="submit">Convert Glove Size</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Hand className="h-8 w-8 text-primary" />
              <CardTitle>Recommended Glove Sizes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 border rounded-lg"><p className="font-semibold">US/UK</p><p className="text-xl font-bold">{result.usUk}</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">EU</p><p className="text-xl font-bold">{result.eu}</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">Japan</p><p className="text-xl font-bold">{result.japan} cm</p></div>
                <div className="p-3 border rounded-lg"><p className="font-semibold">India</p><p className="text-xl font-bold">{result.india} cm</p></div>
            </div>
          </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator converts your hand circumference into standard glove sizes. It first converts your measurement into inches if needed. Then, it uses common sizing formulas to estimate the corresponding size in different regional systems. For example, US/UK sizes are typically the hand circumference in inches rounded to the nearest half-size.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
