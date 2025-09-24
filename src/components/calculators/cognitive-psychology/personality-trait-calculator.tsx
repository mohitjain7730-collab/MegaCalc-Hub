
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, User } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  openness: z.number().min(1).max(5),
  conscientiousness: z.number().min(1).max(5),
  extraversion: z.number().min(1).max(5),
  agreeableness: z.number().min(1).max(5),
  neuroticism: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

const traitDescriptions = {
    openness: "Openness to Experience: How inventive and curious are you?",
    conscientiousness: "Conscientiousness: How organized and efficient are you?",
    extraversion: "Extraversion: How outgoing and energetic are you?",
    agreeableness: "Agreeableness: How friendly and compassionate are you?",
    neuroticism: "Neuroticism: How sensitive and nervous are you?",
}

export default function PersonalityTraitCalculator() {
  const [result, setResult] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      openness: 3,
      conscientiousness: 3,
      extraversion: 3,
      agreeableness: 3,
      neuroticism: 3,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values);
  };
  
  const values = form.watch();

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardDescription>For each trait, rate yourself on a scale of 1 (Not at all) to 5 (Very much).</CardDescription>
          <div className="space-y-8">
            {Object.keys(traitDescriptions).map((trait) => (
                <FormField key={trait} control={form.control} name={trait as keyof FormValues} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{traitDescriptions[trait as keyof typeof traitDescriptions]} (Score: {values[trait as keyof FormValues]})</FormLabel>
                        <FormControl><Slider defaultValue={[3]} min={1} max={5} step={1} onValueChange={(vals) => field.onChange(vals[0])} /></FormControl>
                    </FormItem>
                )} />
            ))}
          </div>
          <Button type="submit">Show My Profile</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Simplified Personality Profile</CardTitle></div></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Object.entries(result).map(([trait, score]) => (
                        <div key={trait}>
                            <div className='flex justify-between items-center mb-1'>
                                <p className='font-medium'>{trait.charAt(0).toUpperCase() + trait.slice(1)}</p>
                                <p className='text-sm text-muted-foreground'>{score} / 5</p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(score/5) * 100}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                 <CardDescription className='mt-6 text-center'>This is a simplified, non-clinical tool for self-exploration based on the Big Five model. Scores represent tendencies, not definitive labels.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>About the Big Five</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The "Big Five" or OCEAN model is a widely accepted framework in psychology for describing personality. This calculator provides a very basic self-assessment.</p>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>Openness:</strong> Appreciation for art, emotion, adventure, unusual ideas, curiosity, and variety of experience.</li>
                    <li><strong>Conscientiousness:</strong> A tendency to be organized and dependable, show self-discipline, act dutifully, and aim for achievement.</li>
                    <li><strong>Extraversion:</strong> Energy, positive emotions, surgency, assertiveness, sociability and the tendency to seek stimulation in the company of others.</li>
                    <li><strong>Agreeableness:</strong> A tendency to be compassionate and cooperative rather than suspicious and antagonistic towards others.</li>
                    <li><strong>Neuroticism:</strong> The tendency to experience unpleasant emotions easily, such as anger, anxiety, depression, and vulnerability.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

