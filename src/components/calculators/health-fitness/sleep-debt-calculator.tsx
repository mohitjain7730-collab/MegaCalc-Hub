'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon } from 'lucide-react';

const formSchema = z.object({
  targetPerNight: z
    .number()
    .min(4)
    .max(10),
  mon: z.number().min(0).max(24),
  tue: z.number().min(0).max(24),
  wed: z.number().min(0).max(24),
  thu: z.number().min(0).max(24),
  fri: z.number().min(0).max(24),
  sat: z.number().min(0).max(24),
  sun: z.number().min(0).max(24),
});
type FormValues = z.infer<typeof formSchema>;

export default function SleepBalanceCheckInCalculator() {
  const [balance, setBalance] = useState<number | null>(null);
  const [insight, setInsight] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { targetPerNight: undefined, mon: undefined, tue: undefined, wed: undefined, thu: undefined, fri: undefined, sat: undefined, sun: undefined } });

  const onSubmit = (v: FormValues) => {
    const totalSlept = v.mon + v.tue + v.wed + v.thu + v.fri + v.sat + v.sun;
    const target = v.targetPerNight * 7;
    const diff = totalSlept - target; // positive = more than target, negative = below target
    setBalance(diff);

    let message = 'Your sleep time is close to your weekly target. Keep noticing what helps you feel rested.';
    if (diff <= -5) {
      message =
        'You slept noticeably less than your target this week. You might gently experiment with a slightly earlier wind-down or bedtime to see how you feel.';
    } else if (diff < 0) {
      message =
        'You slept a bit less than your target this week. Small tweaks like a calmer evening routine or steadier wake time may support your rest.';
    } else if (diff >= 5) {
      message =
        'You slept more than your target this week. If that feels good in your body, you can keep the routine that works for you.';
    } else if (diff > 0) {
      message =
        'You slept slightly more than your target this week. Notice how your energy feels and adjust your target if needed.';
    }

    setInsight(message);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            <FormField
              control={form.control}
              name="targetPerNight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred sleep per night (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((d) => (
              <FormField
                key={d}
                control={form.control}
                name={d}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{d} sleep (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button type="submit">Check weekly sleep balance</Button>
        </form>
      </Form>

      {balance !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Moon className="h-8 w-8 text-primary" />
              <CardTitle>Weekly Sleep Balance Insight</CardTitle>
            </div>
            <CardDescription>
              A gentle look at how your recent sleep time compares with the amount of sleep you prefer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">
                {balance === 0
                  ? 'Right on your target'
                  : balance > 0
                  ? `${balance.toFixed(1)} hours above target`
                  : `${Math.abs(balance).toFixed(1)} hours below target`}
              </p>
              <CardDescription>{insight}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <SleepDebtGuide />

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

function SleepDebtGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA – wellness, non‑diagnostic */}
    <meta itemProp="name" content="Sleep Balance Check-In" />
    <meta
      itemProp="description"
      content="Gently compare your weekly sleep time with your personal target and explore simple lifestyle ideas to support more restful nights."
    />
    <meta
      itemProp="keywords"
      content="sleep balance check in, weekly sleep overview, sleep habits reflection, bedtime routine, gentle sleep insight"
    />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/sleep-debt-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
      Sleep Balance Check-In: Notice How Your Week of Sleep Compares to Your Target
    </h1>
    
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What this sleep balance check-in can show you</h2>
    <p>
      This simple check-in looks at how many hours you slept over the last seven days compared with the amount of sleep you
      would like to get. It is meant to support gentle reflection on your routines, not to diagnose any sleep condition.
    </p>
<hr />
    <h2 id="calculate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
      How the weekly sleep balance idea works
    </h2>
    <p>
      Many adults feel best with roughly 7–9 hours of sleep per night, but the exact number is personal. This tool lets you
      pick a preferred nightly amount and then compare it with your actual sleep over the last week.
    </p>

    <h3 className="text-xl font-semibold text-foreground mt-6">A simple way to think about balance</h3>
    <p>
      If you are a little below your target, you might experiment with a calmer evening wind‑down, dimmer lights, or a more
      consistent wake time. If you are above your target and feel refreshed, your current rhythm may already be working well
      for you.
    </p>

<hr />
    <h2 id="habits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
      Gentle habits that can support more restful nights
    </h2>
    <ul className="list-disc ml-6 space-y-2">
      <li>Keep a fairly steady wake time, even on weekends, so your body knows when the day begins.</li>
      <li>Create a short, calming wind‑down routine before bed, such as reading, stretching, or quiet breathing.</li>
      <li>Make your sleep space as dark, quiet and comfortable as you reasonably can.</li>
      <li>Notice how caffeine, late meals, or screens close to bedtime affect how you feel.</li>
    </ul>

<hr />
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
      Frequently asked questions about using this tool
    </h2>
    <h3 className="text-xl font-semibold text-foreground mt-6">Is this sleep check-in a diagnosis?</h3>
    <p>
      No. This calculator is only for personal reflection on your recent routines. It does not diagnose any sleep problem or
      condition.
    </p>

    <h3 className="text-xl font-semibold text-foreground mt-6">What if my sleep feels off or I am worried?</h3>
    <p>
      If you ever feel concerned about your sleep, energy, or overall health, it can be helpful to discuss your experience
      with a qualified health professional who can look at your full situation.
    </p>
</section>
  );
}