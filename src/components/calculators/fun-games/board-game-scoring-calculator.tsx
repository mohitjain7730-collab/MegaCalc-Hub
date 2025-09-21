'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const scoreSchema = z.object({
  name: z.string().min(1, "Name is required"),
  points: z.number(),
});

const formSchema = z.object({
  scores: z.array(scoreSchema).min(1, "Add at least one score category."),
});

type FormValues = z.infer<typeof formSchema>;

export default function BoardGameScoringCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scores: [
        { name: 'Victory Points', points: 0 },
        { name: 'Longest Road Bonus', points: 0 },
        { name: 'Largest Army Bonus', points: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scores"
  });

  const onSubmit = (values: FormValues) => {
    const totalScore = values.scores.reduce((sum, score) => sum + score.points, 0);
    setResult(totalScore);
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <CardDescription>Add scoring categories and enter the points for each to calculate the total score.</CardDescription>
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start mb-2">
                        <FormField control={form.control} name={`scores.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Category Name</FormLabel><FormControl><Input placeholder="Category Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`scores.${index}.points`} render={({ field }) => (
                             <FormItem><FormLabel className="sr-only">Points</FormLabel><FormControl><Input type="number" placeholder="Points" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', points: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                </div>
                <Button type="submit">Calculate Total Score</Button>
            </form>
        </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Trophy className="h-8 w-8 text-primary" /><CardTitle>Total Score</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This is a generic scoring tool. It simply sums the points from all the categories you define, making it flexible for a wide variety of board games.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
