
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
  lmp: z.date({
    required_error: "First day of last menstrual period is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DueDateCalculator() {
  const [result, setResult] = useState<Date | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lmp: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Naegele's Rule: +1 year, -3 months, +7 days
    const lmp = new Date(values.lmp);
    lmp.setFullYear(lmp.getFullYear() + 1);
    lmp.setMonth(lmp.getMonth() - 3);
    lmp.setDate(lmp.getDate() + 7);
    setResult(lmp);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="lmp"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>First Day of Last Menstrual Period (LMP)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Calculate Due Date</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><CalendarIcon className="h-8 w-8 text-primary" /><CardTitle>Estimated Due Date</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center">
                    <p className="text-3xl font-bold">{format(result, 'MMMM do, yyyy')}</p>
                    <CardDescription className='mt-4'>This is an estimate. A full-term pregnancy can range from 38 to 42 weeks.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <h4 className="font-semibold text-foreground">First Day of Last Menstrual Period (LMP)</h4>
                <p>Select the first day of your most recent menstrual cycle from the calendar. This is the starting point for the calculation.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (Naegele's Rule)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>This calculator uses Naegele's Rule, a standard method for estimating a due date. The rule assumes a regular 28-day menstrual cycle.</p>
              <ol className="list-decimal list-inside">
                <li>Start with the first day of your last menstrual period (LMP).</li>
                <li>Add one year.</li>
                <li>Subtract three months.</li>
                <li>Add seven days.</li>
              </ol>
              <p>This method provides an estimated date that is 280 days (40 weeks) from the LMP. Remember, this is just an estimate; ultrasound dating is often more accurate.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
