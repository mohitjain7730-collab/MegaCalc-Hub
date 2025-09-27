
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  name1: z.string().min(1, "Please enter the first name."),
  name2: z.string().min(1, "Please enter the second name."),
});

type FormValues = z.infer<typeof formSchema>;

const getCompatibility = (score: number) => {
    if (score > 90) return { text: "Perfect Match!", emojis: "❤️‍🔥🥰💖" };
    if (score > 75) return { text: "Great Match!", emojis: "😊👍🎉" };
    if (score > 50) return { text: "Looking Good!", emojis: "🙂👌" };
    if (score > 25) return { text: "Hmm, Interesting...", emojis: "🤔😬" };
    return { text: "Maybe Just Friends?", emojis: "🥶👎" };
};

export default function EmojiCompatibilityCalculator() {
  const [result, setResult] = useState<{ score: number, compatibility: ReturnType<typeof getCompatibility> } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name1: '', name2: '' },
  });

  const calculateScore = (name1: string, name2: string) => {
    const combinedNames = (name1 + name2).toLowerCase();
    let sum = 0;
    for (let i = 0; i < combinedNames.length; i++) {
        sum += combinedNames.charCodeAt(i);
    }
    return (sum % 100) + 1;
  };

  const onSubmit = (values: FormValues) => {
    const score = calculateScore(values.name1, values.name2);
    setResult({ score, compatibility: getCompatibility(score) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Enter two names to see your fun emoji compatibility score!</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name1" render={({ field }) => (
                <FormItem><FormLabel>Name 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="name2" render={({ field }) => (
                <FormItem><FormLabel>Name 2</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Compatibility</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Compatibility Result</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className="text-5xl my-4">{result.compatibility.emojis}</p>
                <p className="text-2xl font-bold">{result.compatibility.text}</p>
                <CardDescription className="mt-2">Score: {result.score}/100</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This is a "for fun" calculator! It converts the letters in both names to numbers, adds them up, and uses a bit of math to generate a compatibility score from 1 to 100. It is not scientific in any way.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
