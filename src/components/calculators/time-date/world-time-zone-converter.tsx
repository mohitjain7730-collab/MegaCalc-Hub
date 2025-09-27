
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// A selection of major IANA time zones
const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const formSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
  fromZone: z.string().min(1),
  toZone: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export default function WorldTimeZoneConverter() {
  const [result, setResult] = useState<string | null>(null);
  const [localZone, setLocalZone] = useState('');

  useEffect(() => {
    // Set the local timezone on component mount
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLocalZone(local);
    form.setValue('fromZone', local);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      fromZone: '',
      toZone: 'America/New_York',
    },
  });
  
  const onSubmit = (values: FormValues) => {
    try {
        const [hour, minute] = values.time.split(':');
        const today = new Date();
        const dateInFromZone = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hour), parseInt(minute));
        
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: values.toZone,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZoneName: 'short',
        });
        
        // This works because the JS Date object holds a UTC timestamp.
        // We are creating a string that represents the "local time" in the "from" zone,
        // then telling the formatter to interpret that same timestamp as if it were in the "to" zone.
        // The `toLocaleString` with `timeZone` option handles the conversion.
        const dateString = dateInFromZone.toLocaleString('en-US', { timeZone: values.fromZone });
        const convertedDate = new Date(dateString);

        setResult(formatter.format(convertedDate));

    } catch (e) {
        console.error(e);
        setResult("Error in conversion. Please check time format.");
    }
  };


  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem><FormLabel>Time (HH:MM)</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="fromZone" render={({ field }) => (
              <FormItem><FormLabel>From Time Zone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {localZone && <SelectItem value={localZone}>{localZone} (Local)</SelectItem>}
                    {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="toZone" render={({ field }) => (
              <FormItem><FormLabel>To Time Zone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Convert Time</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Globe className="h-8 w-8 text-primary" /><CardTitle>Converted Time</CardTitle></div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold">{result}</p>
          </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This calculator uses the browser's built-in `Intl.DateTimeFormat` object. This powerful API has access to the full IANA Time Zone Database, allowing it to correctly handle complex conversions, including Daylight Saving Time (DST) rules, without needing a separate database. It formats the input time according to the target time zone.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
