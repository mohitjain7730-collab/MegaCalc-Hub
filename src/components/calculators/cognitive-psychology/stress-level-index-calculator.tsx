
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const pssQuestions = [
  { id: 'q1', text: '...been upset because of something that happened unexpectedly?' },
  { id: 'q2', text: '...felt that you were unable to control the important things in your life?' },
  { id: 'q3', text: '...felt nervous and stressed?' },
  { id: 'q4', text: '...felt confident about your ability to handle your personal problems?', positive: true },
  { id: 'q5', text: '...felt that things were going your way?', positive: true },
  { id: 'q6', text: '...found that you could not cope with all the things that you had to do?' },
  { id: 'q7', text: '...been able to control irritations in your life?', positive: true },
  { id: 'q8', text: '...felt that you were on top of things?', positive: true },
  { id: 'q9', text: '...been angered because of things that were outside of your control?' },
  { id: 'q10', text: '...felt difficulties were piling up so high that you could not overcome them?' },
];

const questionSchema = z.string().nonempty("Please select an answer.");
const formSchemaObject: {[key: string]: z.ZodString} = {};
pssQuestions.forEach(q => {
    formSchemaObject[q.id] = questionSchema;
});

const formSchema = z.object(formSchemaObject);
type FormValues = z.infer<typeof formSchema>;

export default function StressLevelIndexCalculator() {
  const [result, setResult] = useState<{ score: number, level: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormValues) => {
    let totalScore = 0;
    pssQuestions.forEach(q => {
      let score = parseInt(values[q.id as keyof FormValues]);
      if (q.positive) {
        score = 4 - score;
      }
      totalScore += score;
    });

    let level = '';
    if (totalScore <= 13) level = 'Low Stress';
    else if (totalScore <= 26) level = 'Moderate Stress';
    else level = 'High Stress';

    setResult({ score: totalScore, level });
  };
  
  const options = ["Never", "Almost Never", "Sometimes", "Fairly Often", "Very Often"];

  return (
    <div className="space-y-8">
      <CardDescription>In the last month, how often have you...</CardDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {pssQuestions.map((q, index) => (
            <FormField
              key={q.id}
              control={form.control}
              name={q.id as keyof FormValues}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{index + 1}. {q.text}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4 space-y-2 sm:space-y-0"
                    >
                      {options.map((option, i) => (
                         <FormItem key={i} className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value={String(i)} /></FormControl>
                            <FormLabel className="font-normal">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit">Calculate My Score</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Perceived Stress Score</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-4xl font-bold">{result.score}</p>
                    <p className="text-xl font-semibold mt-2">{result.level}</p>
                    <CardDescription className='mt-4'>Score range: 0-13 (Low), 14-26 (Moderate), 27-40 (High). This is not a diagnostic tool. If you are concerned about your stress levels, please consult a healthcare professional.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>About the Perceived Stress Scale (PSS)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Perceived Stress Scale is the most widely used psychological instrument for measuring the perception of stress. It is a measure of the degree to which situations in one's life are appraised as stressful.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Scores are calculated by summing up the responses.</li>
                    <li>For the positively worded questions (4, 5, 7, 8), the scores are reversed (e.g., 0=4, 1=3, 2=2, 3=1, 4=0).</li>
                    <li>The total score provides a global measure of perceived stress over the past month.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    