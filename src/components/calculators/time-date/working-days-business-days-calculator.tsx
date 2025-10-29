
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Info, CalendarDays, Building } from 'lucide-react';
import { differenceInDays, isSaturday, isSunday, isSameDay } from 'date-fns';

const formSchema = z.object({
  start: z.string().min(1, 'Start date is required'), // ISO yyyy-MM-dd
  end: z.string().min(1, 'End date is required'),
  excludeWeekends: z.boolean().optional(),
  includeUSHolidays: z.boolean().optional(),
  customHolidays: z.string().optional(), // comma-separated yyyy-MM-dd
}).refine(data => {
  if (!data.start || !data.end) return false;
  const s = new Date(data.start);
  const e = new Date(data.end);
  return e >= s;
}, { message: 'End date must be after start date.', path: ['end'] });

type FormValues = z.infer<typeof formSchema>;

const usHolidays2024 = [
  new Date('2024-01-01T12:00:00Z'),
  new Date('2024-01-15T12:00:00Z'),
  new Date('2024-02-19T12:00:00Z'),
  new Date('2024-05-27T12:00:00Z'),
  new Date('2024-06-19T12:00:00Z'),
  new Date('2024-07-04T12:00:00Z'),
  new Date('2024-09-02T12:00:00Z'),
  new Date('2024-10-14T12:00:00Z'),
  new Date('2024-11-11T12:00:00Z'),
  new Date('2024-11-28T12:00:00Z'),
  new Date('2024-12-25T12:00:00Z'),
];


const usHolidays2025 = [
  new Date('2025-01-01T12:00:00Z'),
  new Date('2025-01-20T12:00:00Z'),
  new Date('2025-02-17T12:00:00Z'),
  new Date('2025-05-26T12:00:00Z'),
  new Date('2025-06-19T12:00:00Z'),
  new Date('2025-07-04T12:00:00Z'),
  new Date('2025-09-01T12:00:00Z'),
  new Date('2025-10-13T12:00:00Z'),
  new Date('2025-11-11T12:00:00Z'),
  new Date('2025-11-27T12:00:00Z'),
  new Date('2025-12-25T12:00:00Z'),
];

export default function WorkingDaysBusinessDaysCalculator() {
  const [result, setResult] = useState<{ working: number; total: number; weekends: number; holidays: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { excludeWeekends: true, includeUSHolidays: true },
  });

  const onSubmit = (values: FormValues) => {
    const startDate = new Date(values.start);
    const endDate = new Date(values.end);
    const totalDays = differenceInDays(endDate, startDate) + 1;
    const holidaysBase = [...usHolidays2024, ...usHolidays2025];
    const custom = (values.customHolidays || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => new Date(s + 'T12:00:00Z'));

    let working = 0;
    let weekends = 0;
    let holidays = 0;

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const weekend = isSaturday(currentDate) || isSunday(currentDate);
      const isHoliday = (values.includeUSHolidays ? holidaysBase : []).some(h => isSameDay(h, currentDate)) || custom.some(h => isSameDay(h, currentDate));
      if (weekend && values.excludeWeekends) { weekends++; continue; }
      if (isHoliday) { holidays++; continue; }
      working++;
    }
    setResult({ working, total: totalDays, weekends, holidays });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="start" render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="end" render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl><Input type="date" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="excludeWeekends" render={({ field }) => (
              <FormItem>
                <FormLabel>Exclude Weekends</FormLabel>
                <FormControl><input type="checkbox" className="h-4 w-4" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="includeUSHolidays" render={({ field }) => (
              <FormItem>
                <FormLabel>Exclude US Holidays (2024–2025)</FormLabel>
                <FormControl><input type="checkbox" className="h-4 w-4" checked={!!field.value} onChange={e => field.onChange(e.target.checked)} /></FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="customHolidays" render={({ field }) => (
              <FormItem>
                <FormLabel>Custom Holidays (comma-separated yyyy-MM-dd)</FormLabel>
                <FormControl><Input placeholder="2025-12-31, 2026-01-01" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} /></FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Business Days</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-2">
          <CardHeader>
            <div className='flex items-center gap-4'><Briefcase className="h-8 w-8 text-primary" /><CardTitle>Working Days Summary</CardTitle></div>
            <CardDescription>Interactive breakdown between the selected dates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Total Days</p><p className="text-3xl font-bold text-primary">{result.total}</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Weekends</p><p className="text-2xl font-bold">{result.weekends}</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Holidays</p><p className="text-2xl font-bold">{result.holidays}</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Working Days</p><p className="text-2xl font-bold text-green-600">{result.working}</p></div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                {(() => {
                  const workPct = (result.working / result.total) * 100;
                  const weekendPct = (result.weekends / result.total) * 100;
                  const holidayPct = (result.holidays / result.total) * 100;
                  return (
                    <div className="flex h-3 w-full">
                      <div style={{ width: `${workPct}%` }} className="bg-green-500" />
                      <div style={{ width: `${weekendPct}%` }} className="bg-gray-400" />
                      <div style={{ width: `${holidayPct}%` }} className="bg-yellow-500" />
                    </div>
                  );
                })()}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Green: Working | Gray: Weekends | Yellow: Holidays</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Related Calculators</CardTitle>
          <CardDescription>Explore time & date tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/time-date/date-difference-calculator" className="text-primary hover:underline">Date Difference Calculator</a></h4><p className="text-sm text-muted-foreground">Compute days, weeks, and months between dates.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/time-date/day-of-the-week-calculator" className="text-primary hover:underline">Day of the Week</a></h4><p className="text-sm text-muted-foreground">Find weekday for any date.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Complete Guide to Working Days</CardTitle></CardHeader>
        <CardContent>
          <p>Add your detailed guide content here.</p>
          <p>These two lines are placeholders you can replace later.</p>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" />Frequently Asked Questions</CardTitle><CardDescription>About business day calculations</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {[
            ['Do start and end dates count?', 'Yes, both ends are included by default.'],
            ['Are weekends excluded?', 'Enable the “Exclude Weekends” option to skip Saturdays and Sundays.'],
            ['Which holidays are used?', 'US federal holidays for 2024–2025 are included when the checkbox is on.'],
            ['Can I add my own holidays?', 'Yes—enter comma‑separated dates in yyyy‑MM‑dd format.'],
            ['How is the total calculated?', 'We iterate through each day and exclude weekends/holidays as selected.'],
            ['Does locale/timezone matter?', 'We compare by calendar day; results are robust for most use cases.'],
            ['Can I get a breakdown?', 'The summary shows totals for weekends, holidays, and working days.'],
            ['Why is my count off by 1?', 'Remember both start and end are inclusive; adjust if you need exclusive end.'],
            ['Can half‑days be handled?', 'Not currently—enter custom assumptions separately.'],
            ['Do other countries’ holidays exist?', 'Not yet—enter custom dates or ask us to add a region.'],
          ].map(([q,a],i) => (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
