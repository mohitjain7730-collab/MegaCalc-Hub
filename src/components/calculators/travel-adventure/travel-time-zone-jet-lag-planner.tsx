'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, AlarmClock, Info, Plane } from 'lucide-react';

const formSchema = z.object({
  originTz: z.string().min(1).optional(),
  destTz: z.string().min(1).optional(),
  departIso: z.string().min(1).optional(),
  flightHours: z.number().min(0).max(40).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function tzOffsetMinutes(tz: string, date: Date) {
  try {
    const fmt = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'shortOffset', hour: '2-digit' });
    const parts = fmt.formatToParts(date);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT+0';
    const m = tzName.match(/GMT([+−-])(\d{1,2})(?::?(\d{2}))?/);
    if (!m) return 0;
    const sign = m[1] === '-' || m[1] === '−' ? -1 : 1;
    const h = parseInt(m[2] || '0', 10);
    const min = parseInt(m[3] || '0', 10);
    return sign * (h * 60 + min);
  } catch {
    // Fallback to UTC if invalid/unsupported time zone input
    return 0;
  }
}

export default function TravelTimeZoneJetLagPlanner() {
  const supported = (Intl as any).supportedValuesOf ? (Intl as any).supportedValuesOf('timeZone') as string[] : [];
  const fallbackZones = ['UTC','Europe/London','Europe/Paris','America/New_York','America/Los_Angeles','Asia/Dubai','Asia/Kolkata','Asia/Singapore','Australia/Sydney'];
  const timeZones = supported?.length ? supported : fallbackZones;
  const systemTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const [result, setResult] = useState<{ diffHours: number; arriveLocal: string; plan: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { originTz: systemTz, destTz: 'Europe/Paris', departIso: '', flightHours: undefined } });

  const onSubmit = (v: FormValues) => {
    if (!v.originTz || !v.destTz || !v.departIso || v.flightHours == null) { setResult(null); return; }
    const depart = new Date(v.departIso);
    const departUtcMs = depart.getTime() - tzOffsetMinutes(v.originTz, depart) * 60_000;
    const arriveUtcMs = departUtcMs + v.flightHours * 3_600_000;
    const arriveLocalDate = new Date(arriveUtcMs + tzOffsetMinutes(v.destTz, new Date(arriveUtcMs)) * 60_000);
    const diffMin = tzOffsetMinutes(v.destTz, arriveLocalDate) - tzOffsetMinutes(v.originTz, depart);
    const diffHours = Math.round(diffMin / 60);
    const plan: string[] = [];
    if (Math.abs(diffHours) >= 3) {
      const dir = diffHours > 0 ? 'east' : 'west';
      plan.push(`You are flying ${dir} across ${Math.abs(diffHours)} time zones.`);
      plan.push(`Shift sleep by ~${Math.min(2, Math.max(1, Math.floor(Math.abs(diffHours)/3)))} hour(s) per day starting 2–3 days before.`);
      plan.push('Use light strategically: morning light for eastbound, evening light for westbound.');
      plan.push('Hydrate during flight; limit caffeine and alcohol.');
    } else {
      plan.push('Minor time shift—adjust on arrival with consistent meal and sleep times.');
    }
    setResult({ diffHours, arriveLocal: arriveLocalDate.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }), plan });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5" />Time Zone & Jet Lag Planner</CardTitle>
          <CardDescription>Compute time difference and a simple adjustment plan</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="originTz" render={({ field }) => (
              <FormItem>
                <FormLabel>Origin Time Zone</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value)}>
                    {timeZones.map(tz => (<option key={tz} value={tz}>{tz}</option>))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="destTz" render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Time Zone</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value)}>
                    {timeZones.map(tz => (<option key={tz} value={tz}>{tz}</option>))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="departIso" render={({ field }) => (
              <FormItem>
                <FormLabel>Departure Local Date & Time</FormLabel>
                <FormControl><Input type="datetime-local" {...field} value={field.value ?? ''} onChange={e=>field.onChange(e.target.value)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="flightHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Flight Duration (hours)</FormLabel>
                <FormControl><Input type="number" step="0.1" placeholder="e.g., 7.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Plan Jet Lag</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4"><Globe className="h-8 w-8 text-primary" /><div><CardTitle>Plan Summary</CardTitle><CardDescription>Arrival and time shift</CardDescription></div></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Time Difference</p><p className="text-3xl font-bold text-primary">{result.diffHours>0?'+':''}{result.diffHours} h</p></div>
              <div className="text-center p-6 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Arrive Local</p><p className="text-2xl font-bold">{result.arriveLocal}</p></div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">First Tip</p><p className="text-sm">{result.plan[0]}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlarmClock className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Useful time tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a className="text-primary hover:underline" href="/category/time-date/world-time-zone-converter">World Time Zone Converter</a></h4><p className="text-sm text-muted-foreground">Convert times between regions quickly.</p></div>
              <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a className="text-primary hover:underline" href="/category/time-date/date-difference-calculator">Date Difference Calculator</a></h4><p className="text-sm text-muted-foreground">Work out durations between dates.</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plane className="h-5 w-5" />Complete Guide to Jet Lag Planning</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle>
            <CardDescription>About jet lag and time zones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              ['What is jet lag?', 'A temporary circadian misalignment when your internal clock doesn’t match the destination time zone.'],
              ['East vs west travel?', 'Eastbound (advance clock) is usually harder than westbound (delay clock).'],
              ['Rule of thumb to adapt?', '1–2 time zones per day; strategic light exposure can speed this up.'],
              ['Which light helps?', 'Morning light for eastbound, evening light for westbound. Avoid opposite light windows.'],
              ['Caffeine timing?', 'Use after local morning; avoid within 8–10 hours of bedtime while adapting.'],
              ['Melatonin use?', 'Low doses (e.g., 0.5–1 mg) at local bedtime for a few nights can assist; consult a clinician.'],
              ['Flight arriving at night?', 'Try to sleep on the flight; limit bright light until local morning.'],
              ['Short trips?', 'If <3 days, consider staying on home time rather than fully shifting.'],
            ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


