
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, differenceInYears, differenceInMonths, differenceInDays, subYears, subMonths } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  dob: z.date({
    required_error: "Date of birth is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Age {
    years: number;
    months: number;
    days: number;
}

export default function AgeCalculator() {
  const [result, setResult] = useState<Age | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dob: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const today = new Date();
    const dob = values.dob;
    
    let years = differenceInYears(today, dob);
    let months = differenceInMonths(today, dob) % 12;
    
    // Adjust days calculation to be more precise
    const monthAnniversary = new Date(dob);
    monthAnniversary.setFullYear(today.getFullYear());
    monthAnniversary.setMonth(dob.getMonth() + months);
    
    let days = differenceInDays(today, monthAnniversary);
    
    if (days < 0) {
        months = (months + 11) % 12;
        if(months === 11) years--;
        const prevMonthAnniversary = new Date(monthAnniversary);
        prevMonthAnniversary.setMonth(prevMonthAnniversary.getMonth() -1);
        days = differenceInDays(today, prevMonthAnniversary);
    }
    
    setResult({ years, months, days });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
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
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Calculate Age</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Your Age</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-3xl font-bold">{result.years}</p>
                        <CardDescription>Years</CardDescription>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{result.months}</p>
                        <CardDescription>Months</CardDescription>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{result.days}</p>
                        <CardDescription>Days</CardDescription>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines the elapsed time between a person's date of birth and today's date. It breaks down the difference into years, months, and remaining days to give a precise age.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

    