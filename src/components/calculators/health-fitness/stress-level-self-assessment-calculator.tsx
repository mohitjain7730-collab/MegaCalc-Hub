'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Brain } from 'lucide-react';

const items = [
  'In the past few days, how often have your days felt rushed or overloaded?',
  'How supported do you feel by your current routines and habits?',
  'How easy is it for you to unwind and “switch off” at the end of the day?',
  'How often do you notice tension in your body (for example, tight shoulders or jaw)?',
  'How steady or unsettled has your mood felt over the last few days?',
];

const formSchema = z.object({ scores: z.array(z.number().min(0).max(4)).length(items.length) });
type FormValues = z.infer<typeof formSchema>;

export default function StressLevelSelfAssessmentCalculator() {
  const [score, setScore] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { scores: Array(items.length).fill(undefined) } as unknown as FormValues });

  const onSubmit = (v: FormValues) => {
    const total = v.scores.reduce((s, x) => s + (x ?? 0), 0);
    setScore(total);
    let text = 'Your recent days show a mixed stress pattern—small, steady routines can help you feel more grounded.';
    if (total <= 6) {
      text =
        'Your responses suggest a lighter stress load right now. You can keep leaning on the habits that already support you.';
    } else if (total >= 14) {
      text =
        'Your days may be feeling quite full or demanding. Gentle supports—like short breaks, movement, or talking with someone you trust—may be helpful.';
    }
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {items.map((label, i) => (
              <FormField key={i} control={form.control} name={`scores.${i}` as const} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">{label}</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={4}
                      step={1}
                      defaultValue={[0]}
                      value={[field.value ?? 0]}
                      onValueChange={(v) => field.onChange(v[0])}
                    />
                  </FormControl>
                </FormItem>
              )} />
            ))}
          </div>
          <Button type="submit">See my stress tendency insight</Button>
        </form>
      </Form>

      {score !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Brain className="h-8 w-8 text-primary" />
              <CardTitle>Stress Tendency Check‑In</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">Score: {score} / 20</p>
              <CardDescription>
                {opinion}
                <span className="block mt-1">
                  This is a personal wellness reflection, not a mental health diagnosis.
                </span>
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <StressGuide />

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

function StressGuide() {
  return (
    <section
      className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
      itemScope
      itemType="https://schema.org/HealthAssessmentTool"
    >
      {/* SEO & SCHEMA METADATA – wellness, non‑diagnostic */}
      <meta itemProp="name" content="Daily Stress Tendency Check-In" />
      <meta
        itemProp="description"
        content="Use a short self‑reflection to notice how your recent days feel in terms of stress and tension, and explore gentle lifestyle ideas to support calm and balance."
      />
      <meta
        itemProp="keywords"
        content="stress tendency check in, daily stress reflection, mood and tension self assessment, gentle stress insight, non diagnostic stress tool"
      />

      <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/stress-level-calculator" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
        Daily Stress Tendency Check‑In: Notice How Full Your Days Feel
      </h1>

      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What this check‑in is for</h2>
      <p>
        This tool is designed to help you briefly pause and notice how your recent days have felt—busy, light, tense, or
        somewhere in between. It offers a simple wellness insight and is not a test, diagnosis, or clinical scale.
      </p>

      <hr />

      <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
        Using your results as a gentle guide
      </h2>
      <p>
        Higher scores usually mean your days have felt more loaded or tense; lower scores often mean things feel a bit more
        spacious or steady. Instead of treating the number as “good” or “bad,” you can use it as a cue to check in with what
        you might need more (or less) of right now.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6">Ideas that some people find supportive</h3>
      <ul className="list-disc ml-6 space-y-2">
        <li>Taking small breaks during the day to stretch, breathe, or step outside.</li>
        <li>Adding a short, calming ritual in the evening, like journaling or listening to gentle music.</li>
        <li>Moving your body in a way that feels good—such as walking, light exercise, or dancing.</li>
        <li>Talking with someone you trust about how your days have been feeling.</li>
      </ul>

      <hr />

      <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
        When to reach out for extra support
      </h2>
      <p>
        If your stress feels overwhelming, persistent, or is affecting your ability to get through daily life, consider
        speaking with a qualified professional or a trusted support person. This tool cannot evaluate mental health conditions
        and is meant only as a gentle starting point for reflection.
      </p>
    </section>
  );
}