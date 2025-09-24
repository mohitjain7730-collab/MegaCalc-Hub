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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  taskComplexity: z.number().min(1).max(10),
  timeMinutes: z.number().positive(),
  experienceLevel: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

const getLoadCategory = (load: number) => {
  if (load < 20) return "Low";
  if (load < 50) return "Medium";
  if (load < 100) return "High";
  return "Very High";
};

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

  const chartData = result !== null ? [
      { name: 'Your Score', load: parseFloat(result.toFixed(2)) },
  ] : [];

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
                <div className='grid md:grid-cols-2 gap-8 items-center'>
                    <div className="text-center">
                        <p className="text-4xl font-bold">{result.toFixed(2)}</p>
                        <p className='text-xl font-semibold mt-2'>{getLoadCategory(result)} Load</p>
                        <CardDescription className='mt-4'>A higher score indicates greater mental effort is required. Use this to compare the relative difficulty of different tasks.</CardDescription>
                    </div>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 'dataMax + 20']} />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                                <Bar dataKey="load" name="Cognitive Load" fill="hsl(var(--primary))" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
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
