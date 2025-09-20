'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  trials: z.array(z.object({
    digits: z.number().min(0, 'Cannot be negative'),
  })).min(1, "Please add at least one trial."),
});

type FormValues = z.infer<typeof formSchema>;

export default function MemorySpanCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trials: [{ digits: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "trials"
  });

  const onSubmit = (values: FormValues) => {
    const totalDigits = values.trials.reduce((sum, trial) => sum + trial.digits, 0);
    const memorySpan = totalDigits / values.trials.length;
    setResult(memorySpan);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <FormLabel>Trial Scores</FormLabel>
            <CardDescription className='mb-4'>Enter the number of digits recalled for each trial.</CardDescription>
            <div className='space-y-4'>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <FormField
                            control={form.control}
                            name={`trials.${index}.digits`}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                    <FormControl>
                                        <Input type="number" placeholder={`Trial ${index + 1} score`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <XCircle className="h-5 w-5 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ digits: undefined })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Trial
            </Button>
          </div>
          <Button type="submit">Calculate Memory Span</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Brain className="h-8 w-8 text-primary" /><CardTitle>Memory Span</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>This is your average memory span across the provided trials. Most adults have a digit span of around 7 items.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                 <p>This calculator measures short-term memory capacity by averaging performance across multiple trials.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>You input the number of items (e.g., digits) you correctly remembered in sequence for each attempt (trial).</li>
                    <li>The calculator sums up all the scores from each trial.</li>
                    <li>It then divides this sum by the total number of trials to find the average, which is your estimated memory span.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
