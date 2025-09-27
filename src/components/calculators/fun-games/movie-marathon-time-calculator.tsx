
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clapperboard, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const movieSchema = z.object({
  name: z.string().optional(),
  minutes: z.number().nonnegative("Cannot be negative").optional(),
});

const formSchema = z.object({
  movies: z.array(movieSchema).min(1, "Add at least one item."),
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

export default function MovieMarathonTimeCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movies: [ { name: '', minutes: undefined } ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "movies"
  });

  const onSubmit = (values: FormValues) => {
    const totalMinutes = values.movies.reduce((sum, movie) => sum + (movie.minutes || 0), 0);
    setResult(formatDuration(totalMinutes));
  };

  return (
    <div className="space-y-8">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <CardDescription>Add movies or TV show episodes and their runtimes in minutes to calculate the total duration.</CardDescription>
                <div>
                    {fields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-[1fr,120px,auto] gap-2 items-start mb-2">
                        <FormField control={form.control} name={`movies.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel className="sr-only">Title</FormLabel><FormControl><Input placeholder="Movie Title (Optional)" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`movies.${index}.minutes`} render={({ field }) => (
                             <FormItem><FormLabel className="sr-only">Minutes</FormLabel><FormControl><Input type="number" placeholder="Minutes" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ name: '', minutes: undefined })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
                <Button type="submit">Calculate Total Time</Button>
            </form>
        </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clapperboard className="h-8 w-8 text-primary" /><CardTitle>Total Marathon Time</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
