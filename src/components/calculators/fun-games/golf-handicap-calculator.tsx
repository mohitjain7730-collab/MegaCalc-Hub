
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const scoreSchema = z.object({
  score: z.number().int().min(50, "Score too low").max(150, "Score too high").optional(),
  courseRating: z.number().positive("Must be > 0").min(60).max(80).optional(),
  slopeRating: z.number().int().positive("Must be > 0").min(55).max(155).optional(),
});

const formSchema = z.object({
  scores: z.array(scoreSchema).min(1, "At least one score is required.").max(20, "Use up to 20 scores."),
});

type FormValues = z.infer<typeof formSchema>;

export default function GolfHandicapCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scores: [{ score: undefined, courseRating: undefined, slopeRating: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scores"
  });

  const onSubmit = (values: FormValues) => {
    const validScores = values.scores.filter(s => s.score && s.courseRating && s.slopeRating);
    if (validScores.length === 0) {
      setResult(null);
      return;
    }

    const differentials = validScores.map(s => ((s.score! - s.courseRating!) * 113) / s.slopeRating!);
    differentials.sort((a, b) => a - b);
    
    // Simplified logic: average the best differentials
    const scoresToUse = Math.max(1, Math.floor(differentials.length / 4));
    const bestDifferentials = differentials.slice(0, scoresToUse);
    const avgDifferential = bestDifferentials.reduce((sum, d) => sum + d, 0) / bestDifferentials.length;
    
    setResult(avgDifferential * 0.96);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Enter Your Scores</CardTitle>
            <CardDescription>Enter up to 20 of your most recent 18-hole scores along with the Course Rating and Slope Rating for each.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center font-medium text-sm mb-2">
                            <FormLabel>Score</FormLabel>
                            <FormLabel>Course Rating</FormLabel>
                            <FormLabel>Slope Rating</FormLabel>
                            <span></span>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-start mb-2">
                            <FormField control={form.control} name={`scores.${index}.score`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`scores.${index}.courseRating`} render={({ field }) => ( <FormItem><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name={`scores.${index}.slopeRating`} render={({ field }) => ( <FormItem><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ score: undefined, courseRating: undefined, slopeRating: undefined })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Score
                        </Button>
                    </div>
                    <Button type="submit">Calculate Handicap</Button>
                </form>
            </Form>
        </CardContent>
      </Card>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Flag className="h-8 w-8 text-primary" /><CardTitle>Estimated Golf Handicap</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(1)}</p>
                <CardDescription className='mt-4 text-center'>This is a simplified estimate for entertainment purposes and is not an official USGA Handicap Index.</CardDescription>
            </CardContent>
        </Card>
      )}

       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (Simplified)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a simplified estimate of a golf handicap. Here's the basic process:</p>
                 <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Calculate Handicap Differential:</strong> For each score, it calculates a "differential" using the formula: `(Score - Course Rating) * 113 / Slope Rating`. This adjusts your score for the difficulty of the course.</li>
                    <li><strong>Select Best Scores:</strong> It takes the best (lowest) differentials. This calculator simplifies the complex official rules by using roughly the best quarter of your scores.</li>
                    <li><strong>Average Differentials:</strong> It averages these best differentials.</li>
                    <li><strong>Apply Multiplier:</strong> This average is then multiplied by 0.96 to calculate the final handicap index.</li>
                </ol>
                <CardDescription className="mt-4 text-xs">Note: An official handicap calculation has more complex rules about the number of scores used. This is for illustrative purposes only.</CardDescription>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
