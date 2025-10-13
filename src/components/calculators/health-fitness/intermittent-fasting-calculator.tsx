
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
import Link from 'next/link';

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
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Intermittent Fasting Calculator – Schedules, Tips, and Safety" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to choose an IF protocol (16:8, 18:6, 20:4), align eating windows with training and sleep, manage hunger, and stay hydrated and nourished." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">How to Use Intermittent Fasting Successfully</h2>
        <p itemProp="description">Pick a schedule you can sustain, then structure meals to meet your protein, fiber, and micronutrient needs within the eating window.</p>

        <h3 className="font-semibold text-foreground mt-6">Choosing a Protocol</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>16:8:</strong> balanced for most people; 2–3 meals fits well.</li>
          <li><strong>18:6:</strong> shorter window, useful for appetite control if lifestyle allows.</li>
          <li><strong>20:4:</strong> advanced; ensure meals remain nutrient‑dense.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Performance & Recovery</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Place higher‑carb, protein‑rich meals <strong>before/after training</strong> when possible.</li>
          <li>Stay hydrated; include electrolytes on hot days or long fasts.</li>
          <li>Sleep matters—late‑night eating may affect sleep quality for some.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">What to Consume While Fasting</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Water, black coffee, plain tea, non‑caloric electrolytes typically fit most protocols.</li>
          <li>Zero‑calorie sweeteners are individual—test tolerance and appetite response.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs (TDEE)</Link></p>
          <p><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio Calculator</Link></p>
        </div>

        <p className="italic">Medical note: IF is not appropriate for everyone (e.g., pregnancy, certain metabolic or eating disorders). Consult a clinician if unsure.</p>
        
        <h3 className="font-semibold text-foreground mt-6">Benefits & Considerations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Simplicity:</strong> fewer eating decisions may improve dietary adherence.</li>
          <li><strong>Appetite rhythm:</strong> many find hunger consolidates to the eating window after 1–2 weeks.</li>
          <li><strong>Training schedule:</strong> if you train early, consider a window that includes your post‑workout meal.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Does coffee break a fast?</strong> Plain black coffee generally fits most practical IF approaches.</p>
          <p><strong>Can I build muscle on IF?</strong> Yes—ensure adequate protein and progressive training; distribute protein across meals in the window.</p>
          <p><strong>Should I fast daily?</strong> Many do; others cycle IF 3–5 days/week. Choose what fits your routine and recovery.</p>
        </div>
      </section>
    </div>
  );
}
