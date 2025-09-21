'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronsUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  currentXp: z.number().nonnegative("Cannot be negative"),
  xpForNextLevel: z.number().positive("Must be positive"),
  xpPerHour: z.number().positive("Must be positive").optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatDuration(hours: number) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} minutes`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} hours and ${m} minutes`;
}

export default function VideoGameXpLevelUpCalculator() {
  const [result, setResult] = useState<{ xpNeeded: number; timeNeeded?: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        currentXp: undefined,
        xpForNextLevel: undefined,
        xpPerHour: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { currentXp, xpForNextLevel, xpPerHour } = values;
    const xpNeeded = xpForNextLevel - currentXp;

    let timeNeeded;
    if (xpPerHour && xpNeeded > 0) {
        timeNeeded = formatDuration(xpNeeded / xpPerHour);
    }
    
    setResult({ xpNeeded: Math.max(0, xpNeeded), timeNeeded });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentXp" render={({ field }) => (
                <FormItem><FormLabel>Current XP</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="xpForNextLevel" render={({ field }) => (
                <FormItem><FormLabel>Total XP for Next Level</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="xpPerHour" render={({ field }) => (
                <FormItem><FormLabel>Average XP per Hour (Optional)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><ChevronsUp className="h-8 w-8 text-primary" /><CardTitle>Level Up Requirements</CardTitle></div></CardHeader>
            <CardContent className="text-center">
                <p className="text-lg">You need</p>
                <p className="text-3xl font-bold my-1">{result.xpNeeded.toLocaleString()} XP</p>
                <p className="text-lg">to reach the next level.</p>
                {result.timeNeeded && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-lg">Estimated time to level up:</p>
                        <p className="text-2xl font-bold my-1">{result.timeNeeded}</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
