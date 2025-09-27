
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DayOfTheWeekCalculator() {
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const onSubmit = (values: FormValues) => {
    // Zeller's Congruence
    let q = values.date.getDate();
    let m = values.date.getMonth() + 1;
    let Y = values.date.getFullYear();

    if (m < 3) {
      m += 12;
      Y--;
    }

    const K = Y % 100;
    const J = Math.floor(Y / 100);

    const h = (q + Math.floor(13 * (m + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) - 2 * J) % 7;
    const dayIndex = (h + 6) % 7; // Adjust to make Sunday=0, Monday=1, etc. -> Our array is Sunday-first so it's correct.
                                  // The +6 and mod 7 is a trick to handle negative results from the first modulo
    
    setResult(daysOfWeek[dayIndex]);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select a Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} captionLayout="dropdown-nav" fromYear={1900} toYear={new Date().getFullYear() + 100} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Calculate Day</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><CalendarIcon className="h-8 w-8 text-primary" /><CardTitle>Day of the Week</CardTitle></div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result}</p>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works (Zeller's Congruence)</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            This calculator uses Zeller's Congruence, a mathematical algorithm developed to calculate the day of the week for any Gregorian calendar date. It assigns numerical values to the day, month, and year, and through a series of modular arithmetic operations, determines a final number that corresponds to a specific day of the week.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
