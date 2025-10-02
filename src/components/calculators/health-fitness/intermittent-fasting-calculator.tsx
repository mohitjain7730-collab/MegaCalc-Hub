
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  protocol: z.enum(['16:8', '18:6', '20:4']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
});

type FormValues = z.infer<typeof formSchema>;

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function IntermittentFastingCalculator() {
  const [result, setResult] = useState<{ eatingWindow: string; fastingWindow: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protocol: '16:8',
      startTime: '12:00',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { protocol, startTime } = values;
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    const windowHours = parseInt(protocol.split(':')[1]);
    endDate.setHours(startDate.getHours() + windowHours);

    setResult({
        eatingWindow: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        fastingWindow: `${formatTime(endDate)} - ${formatTime(startDate)}`,
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardDescription>Select your desired fasting protocol and when you'd like your eating window to start.</CardDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="protocol" render={({ field }) => (
                    <FormItem>
                        <FormLabel>IF Protocol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="16:8">16:8 (16hr fast, 8hr eating)</SelectItem>
                                <SelectItem value="18:6">18:6 (18hr fast, 6hr eating)</SelectItem>
                                <SelectItem value="20:4">20:4 (20hr fast, 4hr eating)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem><FormLabel>Eating Window Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
          <Button type="submit">Calculate Schedule</Button>
        </form>
      </Form>
      
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Your Intermittent Fasting Schedule</CardTitle></div></CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <p className="font-bold text-lg text-green-700 dark:text-green-300">Eating Window</p>
                        <p className="text-xl font-bold">{result.eatingWindow}</p>
                    </div>
                     <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <p className="font-bold text-lg text-red-700 dark:text-red-300">Fasting Window</p>
                        <p className="text-xl font-bold">{result.fastingWindow}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines your eating and fasting windows based on the intermittent fasting (IF) protocol you select. It adds the duration of the eating window (e.g., 8 hours for a 16:8 protocol) to your chosen start time to define your daily schedule.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
