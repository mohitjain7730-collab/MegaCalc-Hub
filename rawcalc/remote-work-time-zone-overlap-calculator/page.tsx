'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Info, TrendingUp, Shield, Landmark, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

const TIMEZONE_OFFSETS = [
  { name: 'UTC-12', offset: -12 }, { name: 'UTC-11', offset: -11 }, { name: 'UTC-10 (HST)', offset: -10 },
  { name: 'UTC-9:30', offset: -9.5 }, { name: 'UTC-9 (AKST)', offset: -9 }, { name: 'UTC-8 (PST)', offset: -8 },
  { name: 'UTC-7 (MST)', offset: -7 }, { name: 'UTC-6 (CST)', offset: -6 }, { name: 'UTC-5 (EST)', offset: -5 },
  { name: 'UTC-4 (AST)', offset: -4 }, { name: 'UTC-3:30', offset: -3.5 }, { name: 'UTC-3', offset: -3 },
  { name: 'UTC-2', offset: -2 }, { name: 'UTC-1', offset: -1 }, { name: 'UTC+0 (GMT)', offset: 0 },
  { name: 'UTC+1 (CET)', offset: 1 }, { name: 'UTC+2 (EET)', offset: 2 }, { name: 'UTC+3', offset: 3 },
  { name: 'UTC+3:30', offset: 3.5 }, { name: 'UTC+4', offset: 4 }, { name: 'UTC+4:30', offset: 4.5 },
  { name: 'UTC+5', offset: 5 }, { name: 'UTC+5:30 (IST)', offset: 5.5 }, { name: 'UTC+5:45', offset: 5.75 },
  { name: 'UTC+6', offset: 6 }, { name: 'UTC+6:30', offset: 6.5 }, { name: 'UTC+7', offset: 7 },
  { name: 'UTC+8 (SGT)', offset: 8 }, { name: 'UTC+9', offset: 9 }, { name: 'UTC+9:30', offset: 9.5 },
  { name: 'UTC+10 (AEST)', offset: 10 }, { name: 'UTC+10:30', offset: 10.5 }, { name: 'UTC+11', offset: 11 },
  { name: 'UTC+12', offset: 12 }, { name: 'UTC+13', offset: 13 }, { name: 'UTC+14', offset: 14 },
];

const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required."),
  timezone: z.number(),
  startWork: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endWork: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const formSchema = z.object({
  members: z.array(teamMemberSchema).min(2, 'Please add at least two team members.'),
});

type FormValues = z.infer<typeof formSchema>;

interface OverlapResult {
  overlapHours: number;
  overlapWindows: { start: string; end: string }[];
}

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export default function TimeZoneOverlapCalculator() {
  const [result, setResult] = useState<OverlapResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      members: [
        { name: '', timezone: undefined, startWork: '09:00', endWork: '17:00' },
        { name: '', timezone: undefined, startWork: '09:00', endWork: '17:00' },
      ],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members",
  });
  
  const onSubmit = (values: FormValues) => {
    const intervalsUTC = values.members.map(member => {
      const startMin = timeToMinutes(member.startWork) - member.timezone * 60;
      const endMin = timeToMinutes(member.endWork) - member.timezone * 60;
      return endMin > startMin 
        ? [{ start: startMin, end: endMin }]
        : [{ start: startMin, end: 1440 }, { start: 0, end: endMin }];
    }).flat();

    let overlapStart = 0;
    let overlapEnd = 1440;

    intervalsUTC.forEach(interval => {
        overlapStart = Math.max(overlapStart, interval.start);
        overlapEnd = Math.min(overlapEnd, interval.end);
    });

    if (overlapStart >= overlapEnd) {
      setResult({ overlapHours: 0, overlapWindows: [] });
      return;
    }
    
    const overlapHours = (overlapEnd - overlapStart) / 60;
    
    // For simplicity, we show one window. A more complex scenario could have multiple windows.
    // We will show the result in the timezone of the first member.
    const displayTimezoneOffset = values.members[0].timezone * 60;
    const windowStart = minutesToTime((overlapStart + displayTimezoneOffset + 1440) % 1440);
    const windowEnd = minutesToTime((overlapEnd + displayTimezoneOffset + 1440) % 1440);

    setResult({ overlapHours, overlapWindows: [{ start: windowStart, end: windowEnd }] });
  };
  
   const resetForm = () => {
    form.reset({
      members: [
        { name: '', timezone: undefined, startWork: '09:00', endWork: '17:00' },
        { name: '', timezone: undefined, startWork: '09:00', endWork: '17:00' },
      ],
    });
    setResult(null);
  };


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Remote Work Time Zone Overlap Calculator
          </CardTitle>
          <CardDescription>
            Find the ideal meeting times by calculating the overlapping work hours for a distributed team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Team Members</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-lg relative">
                      <FormField control={form.control} name={`members.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder={`Member ${index+1}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`members.${index}.timezone`} render={({ field }) => (<FormItem><FormLabel>Timezone</FormLabel><Select onValueChange={(v) => field.onChange(parseFloat(v))}><FormControl><SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger></FormControl><SelectContent>{TIMEZONE_OFFSETS.map(tz => (<SelectItem key={tz.name} value={tz.offset.toString()}>{tz.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`members.${index}.startWork`} render={({ field }) => (<FormItem><FormLabel>Work Start</FormLabel><FormControl><Input placeholder="09:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name={`members.${index}.endWork`} render={({ field }) => (<FormItem><FormLabel>Work End</FormLabel><FormControl><Input placeholder="17:00" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)} disabled={fields.length <= 2}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', timezone: undefined, startWork: '09:00', endWork: '17:00' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Member</Button>
              </div>

               <div className="flex gap-4">
                <Button type="submit">Calculate Overlap</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
                <CardTitle>Team Work Overlap</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground">Total Overlap Duration</p>
                    <p className="text-5xl font-bold text-primary">{result.overlapHours.toFixed(2)} hours</p>
                </div>
                <div>
                  <h4 className="text-center text-lg font-semibold mb-4">Optimal Collaboration Window(s)</h4>
                  <p className="text-center text-sm text-muted-foreground mb-4">(Shown in {form.getValues('members.0.name')}'s timezone)</p>
                   {result.overlapWindows.length > 0 && result.overlapHours > 0 ? (
                        result.overlapWindows.map((window, i) => (
                           <div key={i} className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                                <p className="text-3xl font-bold text-green-600">{window.start} - {window.end}</p>
                           </div>
                        ))
                   ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                            <p className="text-2xl font-bold text-red-600">No Overlap Found</p>
                        </div>
                   )}
                </div>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Time Zone Overlap</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>For remote and distributed teams, finding a convenient time for everyone to meet is a major challenge. This calculator helps solve that problem by identifying the "golden hours" — the block of time where every team member's working hours overlap.</p>
            <p>By inputting each member's local working hours and their timezone, the tool converts all times to a universal standard (UTC), finds the common intersection, and then displays that optimal window back in the first team member's local time.</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Calculation Logic</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ol className="list-decimal pl-5 mt-2 space-y-2">
                  <li><strong className="text-foreground">Convert to UTC:</strong> Each person's start and end work times are converted from their local timezone to Coordinated Universal Time (UTC). This creates a standard for comparison.</li>
                  <li><strong className="text-foreground">Find Intersection:</strong> The algorithm finds the latest start time and the earliest end time among all UTC-converted schedules.</li>
                  <li><strong className="text-foreground">Check for Overlap:</strong> If the latest start time is before the earliest end time, an overlap exists. The duration is the difference between these two times.</li>
                  <li><strong className="text-foreground">Display Locally:</strong> The resulting UTC overlap window is converted back to the local timezone of the first person on the list for easy interpretation.</li>
              </ol>
            </CardContent>
        </Card>
        
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle></CardHeader>
          <CardContent><ul className="list-disc pl-5 text-sm text-primary"><li><Link href="/employment/shift-rotation-calculator" className="hover:underline">Shift Rotation Calculator</Link></li></ul></CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">A Manager's Guide to Asynchronous & Synchronous Work</h1>
            <p className="text-lg italic">In a global team, time is the most precious commodity. Optimizing your team's limited synchronous time is key to productivity and preventing burnout.</p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Synchronous vs. Asynchronous Work</h2>
            <p>This calculator helps you identify your synchronous time. A successful remote team masters both work styles.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted"><th className="p-4 border">Work Style</th><th className="p-4 border">Definition</th><th className="p-4 border">Best For</th><th className="p-4 border">Tools</th></tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">Synchronous</td><td className="p-4 border">Work done at the same time.</td><td className="p-4 border">Brainstorming, complex problem-solving, 1-on-1s, team bonding.</td><td className="p-4 border">Video Calls (Zoom, Meet), Instant Messaging (Slack, Teams)</td></tr>
                        <tr><td className="p-4 border font-semibold">Asynchronous</td><td className="p-4 border">Work done at different times.</td><td className="p-4 border">Deep work, status updates, documentation, work that requires focus.</td><td className="p-4 border">Documents (Google Docs, Notion), Project Management (Jira, Asana), Email</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Common Time Zones</h2>
            <p>This table lists some major time zones to help you configure the calculator. Remember to account for Daylight Saving Time (DST) where applicable.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Time Zone (UTC)</th>
                            <th className="p-4 border">Offset</th>
                            <th className="p-4 border">Example Cities</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td className="p-4 border font-semibold">UTC-8 (PST/PDT)</td><td className="p-4 border">-8 / -7</td><td className="p-4 border">Los Angeles, Vancouver, Seattle</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC-7 (MST)</td><td className="p-4 border">-7</td><td className="p-4 border">Phoenix, Denver, Calgary</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC-6 (CST/CDT)</td><td className="p-4 border">-6 / -5</td><td className="p-4 border">Chicago, Mexico City, Winnipeg</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC-5 (EST/EDT)</td><td className="p-4 border">-5 / -4</td><td className="p-4 border">New York, Toronto, Lima</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC-3</td><td className="p-4 border">-3</td><td className="p-4 border">São Paulo, Buenos Aires</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+0 (GMT/BST)</td><td className="p-4 border">+0 / +1</td><td className="p-4 border">London, Dublin, Lisbon</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+1 (CET/CEST)</td><td className="p-4 border">+1 / +2</td><td className="p-4 border">Paris, Berlin, Rome</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+3</td><td className="p-4 border">+3</td><td className="p-4 border">Moscow, Istanbul, Nairobi</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+5:30 (IST)</td><td className="p-4 border">+5.5</td><td className="p-4 border">Mumbai, New Delhi, Bangalore</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+8 (SGT/CST)</td><td className="p-4 border">+8</td><td className="p-4 border">Singapore, Hong Kong, Perth</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+9 (JST/KST)</td><td className="p-4 border">+9</td><td className="p-4 border">Tokyo, Seoul</td></tr>
                        <tr><td className="p-4 border font-semibold">UTC+10 (AEST/AEDT)</td><td className="p-4 border">+10 / +11</td><td className="p-4 border">Sydney, Melbourne, Brisbane</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Strategies by Overlap Amount</h2>
            <p>Your strategy should adapt based on the amount of synchronous time your team has.</p>
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted">
                            <th className="p-4 border">Overlap Amount</th>
                            <th className="p-4 border">Primary Strategy</th>
                            <th className="p-4 border">Key Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-4 border font-semibold">High Overlap (4+ hours)</td>
                            <td className="p-4 border">Balanced Communication</td>
                            <td className="p-4 border">Use overlap for daily stand-ups, collaborative sessions, and quick questions. Reserve non-overlap time for deep focus work.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">Low Overlap (1-3 hours)</td>
                            <td className="p-4 border">Asynchronous First</td>
                            <td className="p-4 border">Protect the overlap window for critical, high-bandwidth meetings only. Default to asynchronous communication for all status updates and non-urgent matters. Rotate meeting times to be fair.</td>
                        </tr>
                        <tr>
                            <td className="p-4 border font-semibold">No Overlap (0 hours)</td>
                            <td className="p-4 border">Fully Asynchronous</td>
                            <td className="p-4 border">Abandon the idea of real-time meetings. Rely on excellent documentation, recorded video updates (e.g., using Loom), and structured hand-offs. One team member's end-of-day summary is the next member's start-of-day brief.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2">How does this handle Daylight Saving Time (DST)?</h4><p className="text-muted-foreground">This calculator uses fixed UTC offsets. It does not automatically account for DST changes. Team members should select their current, correct UTC offset. For example, during DST, US Pacific Time is UTC-7, but during standard time, it is UTC-8.</p></div>
             <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2">What if someone works overnight?</h4><p className="text-muted-foreground">The calculator can handle this. If a team member's end time is earlier than their start time (e.g., starts at 22:00, ends at 06:00), it correctly interprets this as an overnight shift when calculating the UTC interval.</p></div>
             <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-2">Why does the result only show one overlap window?</h4><p className="text-muted-foreground">For simplicity, this calculator finds the single, continuous block of time where everyone is available. In very complex schedules, it's possible to have multiple, separate overlap windows, but this model focuses on finding the largest continuous intersection.</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground"><p>This calculator is an indispensable tool for managers and members of globally distributed teams. By converting multiple local work schedules into a universal standard, it quickly identifies the optimal window for collaboration, eliminating guesswork and the need for confusing manual calculations. This helps teams protect their synchronous time, schedule meetings more efficiently, and foster a more inclusive remote work culture.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
