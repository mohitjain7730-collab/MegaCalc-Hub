
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
import Link from 'next/link';

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
      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="World Time Zone Converter – Complete Guide (UTC, GMT, DST)" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta
          itemProp="about"
          content="Learn how to convert time zones, the difference between UTC and GMT, how Daylight Saving Time works, and best practices for scheduling global meetings."
        />

        <h2 itemProp="name" className="text-xl font-bold text-foreground mb-3">World Time Zones: A Practical Guide</h2>
        <p itemProp="description">
          Use this World Time Zone Converter to quickly find the <strong>time difference</strong> between cities, adjust for
          <strong> Daylight Saving Time (DST)</strong>, and plan <strong>global meetings</strong>. This guide explains
          <strong> UTC vs GMT</strong>, why some countries use <strong>half-hour offsets</strong>, and how to convert times accurately.
        </p>

        <h3 className="font-semibold text-foreground mt-6">How to Use the Converter</h3>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Enter a time in the <strong>Time (HH:MM)</strong> field.</li>
          <li>Select the <strong>From Time Zone</strong> (your source zone).</li>
          <li>Choose the <strong>To Time Zone</strong> (your target zone).</li>
          <li>Click <strong>Convert Time</strong> to see the local time with the correct offset and DST applied.</li>
        </ol>

        <h3 className="font-semibold text-foreground mt-6">What Is a Time Zone?</h3>
        <p>
          A time zone is a region that observes a uniform standard time for legal, commercial, and social purposes.
          Time zones are typically defined as offsets from <strong>Coordinated Universal Time (UTC)</strong>, such as UTC−05:00 or UTC+09:00.
        </p>

        <h3 className="font-semibold text-foreground mt-6">UTC vs GMT</h3>
        <p>
          <strong>UTC (Coordinated Universal Time)</strong> is the modern time standard used for global coordination and does not observe DST.
          <strong> GMT (Greenwich Mean Time)</strong> is a historical term; in casual use it often matches UTC, but UTC is the official, precise reference.
        </p>

        <h3 className="font-semibold text-foreground mt-6">Daylight Saving Time (DST)</h3>
        <p>
          Many regions move clocks forward by one hour in warmer months to extend evening daylight. Our converter uses the
          browser’s <code>Intl.DateTimeFormat</code> with the IANA database to automatically account for DST rules and historical changes.
        </p>

        <h3 className="font-semibold text-foreground mt-6">Quick Examples</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>09:00 in <strong>America/New_York</strong> → what time is it in <strong>Europe/London</strong> today?</li>
          <li>14:30 in <strong>Asia/Tokyo</strong> → convert to <strong>Australia/Sydney</strong> accounting for DST.</li>
          <li>Your local zone ({localZone || 'Detected automatically'}) → <strong>UTC</strong> for logging or server operations.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Common UTC Offsets</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>UTC−08:00 — America/Los_Angeles (Pacific Time)</li>
          <li>UTC−05:00 — America/New_York (Eastern Time)</li>
          <li>UTC±00:00 — Europe/London (may observe BST in summer)</li>
          <li>UTC+01:00 — Europe/Paris (Central European Time)</li>
          <li>UTC+05:30 — Asia/Kolkata (half-hour offset)</li>
          <li>UTC+09:00 — Asia/Tokyo (Japan Standard Time)</li>
          <li>UTC+10:00 — Australia/Sydney (AEST/AEDT seasonally)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Scheduling Tips for Global Teams</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Prefer <strong>UTC</strong> when sharing times in documentation and tools.</li>
          <li>Specify the <strong>time zone name</strong> (e.g., America/New_York) instead of ambiguous labels like “PST.”</li>
          <li>Avoid daylight saving changeover weeks when possible.</li>
          <li>Use <strong>24-hour time</strong> to prevent AM/PM confusion.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">FAQ</h3>
        <div className="space-y-3">
          <p><strong>Why do some places use 30- or 45-minute offsets?</strong> Time zones are set by local governments; several regions choose half-hour (e.g., UTC+05:30) or 45-minute offsets for historical or practical reasons.</p>
          <p><strong>Does this tool handle DST?</strong> Yes. It relies on the IANA time zone database via the browser’s internationalization APIs.</p>
          <p><strong>What does UTC± mean?</strong> It’s the difference in hours and minutes from Coordinated Universal Time, the global reference standard.</p>
        </div>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/time-date/date-difference-calculator" className="text-primary underline">Date Difference Calculator</Link></p>
          <p><Link href="/category/time-date/day-of-the-week-calculator" className="text-primary underline">Day of the Week Calculator</Link></p>
          <p><Link href="/category/time-date/working-days-business-days-calculator" className="text-primary underline">Working Days / Business Days Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}
