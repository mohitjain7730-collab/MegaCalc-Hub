
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const frameSchema = z.object({
  roll1: z.number().min(0).max(10).optional(),
  roll2: z.number().min(0).max(10).optional(),
  roll3: z.number().min(0).max(10).optional(),
}).refine(data => (data.roll1 || 0) + (data.roll2 || 0) <= 10, {
  message: "Rolls 1 and 2 cannot exceed 10.",
  path: ["roll2"],
});

const formSchema = z.object({
  frames: z.array(frameSchema).length(10),
});

type FormValues = z.infer<typeof formSchema>;

export default function BowlingScoreCalculator() {
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [frameScores, setFrameScores] = useState<(number | null)[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frames: Array(10).fill({ roll1: undefined, roll2: undefined, roll3: undefined }),
    },
  });

  const onSubmit = (values: FormValues) => {
    let score = 0;
    const scores = [];
    for (let i = 0; i < 10; i++) {
        let frameScore = 0;
        const frame = values.frames[i];
        const roll1 = frame.roll1 ?? 0;
        const roll2 = frame.roll2 ?? 0;
        
        if(frame.roll1 === undefined) {
            scores.push(null);
            continue;
        }

        const isStrike = roll1 === 10;
        const isSpare = roll1 + roll2 === 10;
        
        if (i < 9) { // Frames 1-9
            if (isStrike) {
                const nextFrame = values.frames[i+1];
                const nextRoll1 = nextFrame.roll1 ?? 0;
                if(nextRoll1 === 10 && i < 8) { // Double strike
                    const nextNextFrame = values.frames[i+2];
                    frameScore = 10 + 10 + (nextNextFrame.roll1 ?? 0);
                } else {
                    frameScore = 10 + nextRoll1 + (nextFrame.roll2 ?? 0);
                }
            } else if (isSpare) {
                const nextFrame = values.frames[i+1];
                frameScore = 10 + (nextFrame.roll1 ?? 0);
            } else {
                frameScore = roll1 + roll2;
            }
        } else { // 10th Frame
            frameScore = roll1 + roll2 + (frame.roll3 ?? 0);
        }
        
        score += frameScore;
        scores.push(score);
    }
    
    setFrameScores(scores);
    setTotalScore(score);
  };
  
  const frames = form.watch('frames');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onChange={() => onSubmit(form.getValues())} className="space-y-6">
          <div className="overflow-x-auto">
            <div className="flex space-x-2">
              {frames.map((_, index) => (
                <Card key={index} className="min-w-[120px] flex-shrink-0">
                  <CardHeader className="p-2 border-b">
                    <CardTitle className="text-center text-sm">Frame {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-1">
                    <div className="flex justify-center space-x-1">
                      <FormField control={form.control} name={`frames.${index}.roll1`} render={({ field }) => (<FormItem><FormControl><Input type="number" min="0" max="10" className="w-12 h-8 text-center" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>)} />
                      {index < 9 && frames[index].roll1 !== 10 && <FormField control={form.control} name={`frames.${index}.roll2`} render={({ field }) => (<FormItem><FormControl><Input type="number" min="0" max={10 - (frames[index].roll1 || 0)} className="w-12 h-8 text-center" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>)} />}
                      {index === 9 && <FormField control={form.control} name={`frames.${index}.roll2`} render={({ field }) => (<FormItem><FormControl><Input type="number" className="w-12 h-8 text-center" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>)} />}
                      {index === 9 && (frames[index].roll1 === 10 || (frames[index].roll1 || 0) + (frames[index].roll2 || 0) === 10) && <FormField control={form.control} name={`frames.${index}.roll3`} render={({ field }) => (<FormItem><FormControl><Input type="number" className="w-12 h-8 text-center" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl></FormItem>)} />}
                    </div>
                    <div className="text-center font-bold h-6">{frameScores[index]}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </form>
      </Form>
      
      {totalScore !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Trophy className="h-8 w-8 text-primary" /><CardTitle>Total Score</CardTitle></div></CardHeader>
          <CardContent><p className="text-3xl font-bold text-center">{totalScore}</p></CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How Bowling Scoring Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>Bowling scoring can be tricky. Here's a breakdown:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Open Frame:</strong> If you don't knock down all 10 pins in two rolls, your score for that frame is the total number of pins you knocked down.</li>
                    <li><strong>Spare (/):</strong> If you knock down all 10 pins in two rolls, you get 10 points plus the number of pins you knock down on your NEXT roll.</li>
                    <li><strong>Strike (X):</strong> If you knock down all 10 pins on your first roll, you get 10 points plus the pins from your NEXT TWO rolls.</li>
                    <li><strong>10th Frame:</strong> If you get a spare or a strike in the 10th frame, you get one or two bonus rolls, respectively, to complete the score for that frame.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
