'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bone } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

// Lifestyle‑focused, non‑diagnostic inputs
const formSchema = z.object({
  weightBearingDays: z.number().min(0).max(7),
  strengthTrainingDays: z.number().min(0).max(7),
  calciumRichMealsPerDay: z.number().min(0).max(5),
  sunlightMinutesPerDay: z.number().min(0).max(180),
  sedentaryHoursPerDay: z.number().min(0).max(16),
});

type FormValues = z.infer<typeof formSchema>;

type BoneWellnessResult = {
  wellnessScore: number;
  levelText: string;
  summary: string;
  suggestions: string[];
};

function calculateBoneWellness(values: FormValues): BoneWellnessResult {
  // Simple lifestyle‑based wellness scoring (0–100), non‑diagnostic
  let score = 0;

  // Movement & loading
  score += Math.min(values.weightBearingDays * 8, 25); // up to 25 points
  score += Math.min(values.strengthTrainingDays * 8, 20); // up to 20 points

  // Nourishing meals
  score += Math.min(values.calciumRichMealsPerDay * 6, 20); // up to 20 points

  // Gentle sunlight / outdoor time
  const sunlightBuckets = Math.min(values.sunlightMinutesPerDay, 60) / 15; // cap at 60 min
  score += Math.min(sunlightBuckets * 4, 15); // up to 15 points

  // Sedentary time (less sitting = more points)
  const sedentaryPenalty = Math.max(0, values.sedentaryHoursPerDay - 4); // hours beyond 4
  score += Math.max(0, 20 - sedentaryPenalty * 4); // between 0–20

  // Clamp between 0–100
  const wellnessScore = Math.max(0, Math.min(100, Math.round(score)));

  let levelText = 'Gently building bone‑supportive habits';
  let summary =
    'You have some helpful routines in place, and there is room to add small habits that support bone strength over time.';

  if (wellnessScore >= 75) {
    levelText = 'Strong foundation of bone‑supportive habits';
    summary =
      'Your current routine includes many habits that can support bone strength, such as movement, nourishing meals, and time on your feet.';
  } else if (wellnessScore >= 50) {
    levelText = 'Growing bone‑supportive lifestyle';
    summary =
      'You have a mix of helpful habits. Small, steady adjustments over time can further support your bones and overall movement.';
  } else {
    levelText = 'Plenty of room for gentle lifestyle support';
    summary =
      'This score simply reflects that there is space to experiment with supportive habits like more movement, standing breaks, or bone‑friendly meals.';
  }

  const suggestions: string[] = [];

  if (values.weightBearingDays < 3) {
    suggestions.push('Consider adding short walks or other weight‑bearing activities on a few more days each week.');
  }
  if (values.strengthTrainingDays < 2) {
    suggestions.push('Light strength or resistance exercises 1–2 times per week can gently support muscles and bones.');
  }
  if (values.calciumRichMealsPerDay < 2) {
    suggestions.push('You might include more foods that naturally contain calcium, if this fits your preferences and needs.');
  }
  if (values.sunlightMinutesPerDay < 15) {
    suggestions.push('When practical, brief time outdoors most days can be a simple, grounding habit.');
  }
  if (values.sedentaryHoursPerDay > 8) {
    suggestions.push('Standing up, stretching, or walking for a few minutes each hour can break up long sitting periods.');
  }

  if (suggestions.length === 0) {
    suggestions.push('You can keep leaning on the everyday habits that already help you feel steady and mobile.');
  }

  return { wellnessScore, levelText, summary, suggestions };
}

export default function BoneDensityTScoreCalculator() {
  const [results, setResults] = useState<BoneWellnessResult | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weightBearingDays: undefined,
      strengthTrainingDays: undefined,
      calciumRichMealsPerDay: undefined,
      sunlightMinutesPerDay: undefined,
      sedentaryHoursPerDay: undefined,
    },
  });

  const onSubmit = (v: FormValues) => {
    const calc = calculateBoneWellness(v);
    setResults(calc);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="weightBearingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days per week you do weight‑bearing movement (walking, dancing, etc.)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="strengthTrainingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days per week you do strength or resistance exercises</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calciumRichMealsPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meals or snacks per day that include bone‑supportive foods</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sunlightMinutesPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average minutes per day spent outdoors or in natural light</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sedentaryHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate hours per day mostly sitting</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value || '0') || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">View bone strength wellness insight</Button>
        </form>
      </Form>

      {results && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Bone className="h-8 w-8 text-primary" />
              <CardTitle>Bone Strength Wellness Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
              <div>
                <p className="text-2xl font-bold">{results.wellnessScore}</p>
                <p className="text-sm text-muted-foreground">Wellness score (0–100)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{results.levelText}</p>
                <p className="text-sm text-muted-foreground">Lifestyle perspective</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {results.wellnessScore >= 75 ? 'Supportive' : results.wellnessScore >= 50 ? 'Growing' : 'Developing'}
                </p>
                <p className="text-sm text-muted-foreground">Overall pattern</p>
              </div>
            </div>
            <CardDescription className="text-center mb-4">
              {results.summary}{' '}
              <span className="block mt-1">
                This is a general wellness perspective on your routines, not a medical assessment or diagnosis.
              </span>
            </CardDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Gentle lifestyle ideas you might explore:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {results.suggestions.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <BoneDensityGuide />
        <EmbedWidget calculatorSlug="bone-density-t-score-calculator" calculatorName="Bone Density T-Score Calculator" />
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

function RelatedCalculators() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Calculators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/category/health-fitness/bmi-calculator" className="text-primary underline hover:text-primary/80">
            Body Mass Index (BMI) Calculator
          </Link>
          <Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline hover:text-primary/80">
            Calcium Intake Calculator
          </Link>
          <Link href="/category/health-fitness/vitamin-d-sun-exposure-calculator" className="text-primary underline hover:text-primary/80">
            Vitamin D Sun Exposure Calculator
          </Link>
          <Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline hover:text-primary/80">
            Exercise Calorie Burn Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BoneDensityGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Bone Strength Lifestyle Insight – Everyday Habits that Support Your Frame" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta
        itemProp="about"
        content="A gentle, lifestyle-focused overview of daily habits that can support bone strength and overall movement throughout life."
      />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding bone‑supportive habits</h2>
      <p itemProp="description">
        Bones respond over time to how we move, what we eat, and how we spend our days. This guide focuses on everyday habits
        that many people find supportive for feeling steady, strong, and mobile. It does not interpret medical test results.
      </p>

      <h3 className="font-semibold text-foreground mt-6">Movement patterns that can support bones</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Include regular weight‑bearing activities you enjoy, such as walking, dancing, or climbing stairs.</li>
        <li>Add simple strength or resistance exercises a couple of times per week when practical.</li>
        <li>Take standing or stretching breaks if you sit for long periods during the day.</li>
        <li>Choose movements that feel safe and comfortable for your body and current fitness level.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Nourishing your body</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Enjoy a variety of foods across the week, including fruits, vegetables, and sources of protein.</li>
        <li>When it fits your needs and preferences, include foods that are naturally rich in bone‑supportive nutrients.</li>
        <li>Drink water regularly throughout the day to stay hydrated.</li>
        <li>Seek personalised guidance from a professional if you have specific nutrition questions.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Daily routines and environment</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Keep walkways in your home clear and well lit so movement feels easier and safer.</li>
        <li>Use supportive footwear that feels stable and comfortable for you.</li>
        <li>Bring more small bouts of movement into your day, such as short walks or stretching breaks.</li>
        <li>Give yourself time to rest and recover between more demanding activities.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">A gentle reminder</h3>
      <p>
        This overview is meant for general wellness and lifestyle reflection only. For questions about your bones, joints, or
        overall health, consider speaking with a qualified health professional who can look at your full situation.
      </p>
    </section>
  );
}
