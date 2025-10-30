
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Info, CalendarDays, Building, X } from 'lucide-react';
import { differenceInDays, isSaturday, isSunday, isSameDay } from 'date-fns';
import { start } from 'repl';

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
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Duration">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Working Days and Business Days Calculation, Rules, and Conventions" />
    <meta itemProp="description" content="An expert guide detailing the calculation of working days within a period, the difference between calendar days and business days, standard 5/2 conventions, and the critical role of holidays and jurisdictional rules in financial and legal deadlines." />
    <meta itemProp="keywords" content="working days vs business days, calculate net working days, 5/2 work week convention, public holiday calculation, financial deadline adjustment, date difference calculator" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-working-days-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Working Days: Calculating Net Business Time and Deadlines</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental time-calculation method essential for financial contracts, project management, and legal deadlines.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Working Days vs. Calendar Days: Core Definitions</a></li>
        <li><a href="#standard-convention" className="hover:underline">Standard Working Week Convention (5/2 Rule)</a></li>
        <li><a href="#holidays" className="hover:underline">The Critical Role of Public Holidays</a></li>
        <li><a href="#calculation-mechanics" className="hover:underline">The Calculation Mechanics: Counting Net Days</a></li>
        <li><a href="#applications" className="hover:underline">Key Applications in Finance and Project Management</a></li>
    </ul>
<hr />

    {/* WORKING DAYS VS. CALENDAR DAYS: CORE DEFINITIONS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Working Days vs. Calendar Days: Core Definitions</h2>
    <p>A <strong className="font-semibold">Working Day</strong> (or <strong className="font-semibold">Business Day</strong>) is a designation used primarily in commerce and contract law to specify a day when the general workforce is typically available and financial markets are open. It is a calculated duration that excludes weekends and, most importantly, public holidays.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calendar Days vs. Business Days</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Calendar Days:</strong> The total number of days between two dates, including weekends and all holidays. This is the simple arithmetic difference between the start and end dates.</li>
        <li><strong className="font-semibold">Working/Business Days:</strong> The net number of days available for commerce, calculated by taking the calendar days and subtracting all non-working days (weekends + holidays).</li>
    </ul>
    <p>The distinction is legally and financially crucial. For example, a contract requiring action within "10 business days" offers a significantly different timeline than one requiring action within "10 calendar days."</p>

<hr />

    {/* STANDARD WORKING WEEK CONVENTION (5/2 RULE) */}
    <h2 id="standard-convention" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Standard Working Week Convention (5/2 Rule)</h2>
    <p>The primary convention for defining a non-working day is the **5/2 Rule**, though this varies geographically and by industry.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Global 5/2 Standard</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Standard Working Days (5):</strong> Monday, Tuesday, Wednesday, Thursday, Friday.</li>
        <li><strong className="font-semibold">Standard Weekend Days (2):</strong> Saturday and Sunday.</li>
    </ul>
    <p>This is the default setting for nearly all financial and project management calculations. However, the convention must be adjusted for non-Western economies and specific industries.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Jurisdictional Variations</h3>
    <p>The definition of the weekend changes based on location. For example, in many Middle Eastern countries, the standard working week runs from Sunday to Thursday, with the weekend falling on Friday and Saturday. Therefore, any global calculator must allow the user to define which days of the week are considered non-working.</p>

<hr />

    {/* THE CRITICAL ROLE OF PUBLIC HOLIDAYS */}
    <h2 id="holidays" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Public Holidays</h2>
    <p>Public holidays represent the secondary, non-fixed variable that must be subtracted from the total calendar days. Correctly identifying and excluding these days is essential for accurate deadline calculation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Holiday List Customization</h3>
    <p>Unlike fixed weekends, holiday schedules vary year-to-year and country-to-country. A robust working days calculation requires a dynamic input of specific dates to exclude. Common national holidays (e.g., Christmas, New Year's Day) are easy to identify, but local holidays must also be considered for precise calculations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Holiday Overlap Rule</h3>
    <p>A key rule is handling holidays that fall on a weekend. If a holiday falls on a Saturday or Sunday, the financial calendar often requires the non-working day to be moved to the nearest weekday (e.g., the following Monday). This **"observance rule"** is critical for calculating effective deadlines, particularly in banking and government sectors.</p>

<hr />

    {/* THE CALCULATION MECHANICS: COUNTING NET DAYS */}
    <h2 id="calculation-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Calculation Mechanics: Counting Net Days</h2>
    <p>Calculating the exact number of working days between a start date (D start) and an end date (D end) is an iterative process that relies on a defined algorithm, not simple subtraction.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Algorithmic Process</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Total Calendar Days:</strong> Determine the total number of days between the start date and the end date.</li>
        <li><strong className="font-semibold">Subtract Fixed Weekends:</strong> Calculate and subtract the total number of Saturdays and Sundays (or other defined weekend days) that fall within the period.</li>
        <li><strong className="font-semibold">Subtract Holidays:</strong> Iterate through the list of public holidays and subtract every specific date that falls on a previously determined working day.</li>
        <li><strong className="font-semibold">Net Working Days:</strong> The resulting figure is the total number of days available for work.</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating a Future Deadline</h3>
    <p>A variation of this problem is calculating a future date. If a task requires X working days to complete, the algorithm must iteratively count forward from the start date, skipping weekends and holidays until X working days are counted. The final date reached is the effective deadline.</p>

<hr />

    {/* KEY APPLICATIONS IN FINANCE AND PROJECT MANAGEMENT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Applications in Finance and Project Management</h2>
    <p>The distinction between calendar and working days impacts regulatory and operational processes across nearly every industry.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial and Legal Deadlines</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Settlement Dates:</strong> Stock and bond trades (e.g., T+2 settlement) rely strictly on business days. If the second day is a holiday, settlement rolls to the next business day.</li>
        <li><strong className="font-semibold">Contractual Obligations:</strong> Lease payments, loan due dates, and option expiry dates are often contractually tied to the nearest business day.</li>
        <li><strong className="font-semibold">Regulatory Compliance:</strong> Government reporting deadlines (e.g., SEC filings) are typically defined in business days.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Project Management and Scheduling</h3>
    <p>In project scheduling (e.g., Gantt charts), the duration of a task must be measured in net working days. If a task is scheduled to take 10 days, and the period spans a weekend and a public holiday, the calendar duration may be 14 or 15 days. Accurate working day calculation is vital for realistic resource allocation and delivery timing.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The working days calculation is a fundamental temporal metric that converts total elapsed time into actionable operational time. It is defined by the rigid exclusion of weekends (the 5/2 rule, adjusted for local customs) and the dynamic exclusion of public holidays.</p>
    <p>Mastery of this calculation is critical for managing financial risk and ensuring regulatory compliance. By accurately determining the net number of business days, organizations can set reliable deadlines, manage operational liquidity, and maintain trust in contractual agreements.</p>
</section>

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
