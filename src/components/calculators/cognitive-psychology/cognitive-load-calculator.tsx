'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  taskComplexity: z.number().min(1).max(10),
  timeMinutes: z.number().positive(),
  experienceLevel: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function CognitiveLoadCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskComplexity: 5,
      timeMinutes: undefined,
      experienceLevel: 5,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { taskComplexity, timeMinutes, experienceLevel } = values;
    const cognitiveLoad = (taskComplexity * timeMinutes) / experienceLevel;
    setResult(cognitiveLoad);
  };
  
  const complexity = form.watch('taskComplexity');
  const experience = form.watch('experienceLevel');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            <FormField control={form.control} name="taskComplexity" render={({ field }) => (
                <FormItem>
                    <FormLabel>Task Complexity: {complexity}</FormLabel>
                    <CardDescription>How mentally challenging is the task? (1=Easy, 10=Very Hard)</CardDescription>
                    <FormControl><Slider defaultValue={[5]} min={1} max={10} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
             <FormField control={form.control} name="experienceLevel" render={({ field }) => (
                <FormItem>
                    <FormLabel>Experience Level: {experience}</FormLabel>
                    <CardDescription>How experienced is the user with this task? (1=Novice, 10=Expert)</CardDescription>
                    <FormControl><Slider defaultValue={[5]} min={1} max={10} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                </FormItem>
            )} />
            <FormField control={form.control} name="timeMinutes" render={({ field }) => (
                <FormItem><FormLabel>Time to Complete (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Cognitive Load</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Activity className="h-8 w-8 text-primary" /><CardTitle>Cognitive Load Score</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>A higher score indicates greater mental effort is required. Use this to compare the relative difficulty of different tasks.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a simple, abstract score to represent the mental effort a task might require.</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>It multiplies the perceived complexity of a task by the time it takes.</li>
                    <li>It then divides this by the user's experience level, reflecting that experts can handle more complex tasks with less perceived effort.</li>
                    <li>The resulting score is a relative measure, useful for comparing different tasks or user experiences, not an absolute psychometric value.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
