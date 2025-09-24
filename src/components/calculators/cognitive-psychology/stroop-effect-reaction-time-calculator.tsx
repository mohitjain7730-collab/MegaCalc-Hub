
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription as UiCardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  congruentTime: z.number().positive(),
  incongruentTime: z.number().positive(),
}).refine(data => data.incongruentTime >= data.congruentTime, {
    message: 'Incongruent time must be greater than or equal to congruent time.',
    path: ['incongruentTime'],
});

type FormValues = z.infer<typeof formSchema>;

export default function StroopEffectReactionTimeCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      congruentTime: undefined,
      incongruentTime: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.incongruentTime - values.congruentTime);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="congruentTime" render={({ field }) => (
                <FormItem>
                    <FormLabel>Congruent Reaction Time (ms)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl>
                    <FormDescription className="text-xs">Time to name the color of a word when the word and color match (e.g., the word "BLUE" in blue ink).</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="incongruentTime" render={({ field }) => (
                <FormItem>
                    <FormLabel>Incongruent Reaction Time (ms)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 850" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl>
                     <FormDescription className="text-xs">Time to name the color of a word when they don't match (e.g., the word "BLUE" in red ink).</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Interference</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Stroop Interference Score</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result} ms</p>
                <UiCardDescription className='mt-4 text-center'>A higher score indicates greater cognitive interference, meaning your brain worked harder to ignore the conflicting word and name the color.</UiCardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Stroop effect demonstrates the interference in the reaction time of a task. When the name of a color (e.g., "blue," "green," or "red") is printed in a color which is not denoted by the name (e.g., the word "red" printed in blue ink instead of red ink), naming the color of the word takes longer and is more prone to errors than when the color of the ink matches the name of the color.</p>
                <p>This calculator simply subtracts the average reaction time for congruent pairs from the average reaction time for incongruent pairs. The difference is the "interference score."</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    
