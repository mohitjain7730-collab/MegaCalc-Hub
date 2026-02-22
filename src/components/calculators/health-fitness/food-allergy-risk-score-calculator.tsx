'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import Link from 'next/link';

// Lifestyle‑style, non‑diagnostic inputs
const formSchema = z.object({
  newFoodComfortLevel: z.number().min(1).max(10),
  labelReadingFrequency: z.number().min(1).max(10),
  reactionAwareness: z.number().min(1).max(10),
  varietyOfFoods: z.number().min(1).max(10),
  mealPlanningConfidence: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type FoodSensitivityInsight = {
  wellnessScore: number;
  tendencyLabel: string;
  summary: string;
  tips: string[];
};

function calculateFoodSensitivityInsight(values: FormValues): FoodSensitivityInsight {
  // Simple 0–100 wellness‑style index based on self‑reflection
  const rawTotal =
    values.newFoodComfortLevel +
    values.labelReadingFrequency +
    values.reactionAwareness +
    values.varietyOfFoods +
    values.mealPlanningConfidence;

  const wellnessScore = Math.round((rawTotal / 50) * 100);

  let tendencyLabel = 'Balanced food awareness';
  let summary =
    'You appear to have a fairly balanced mix of trying foods, noticing how you feel, and choosing what works for you.';

  if (wellnessScore >= 75) {
    tendencyLabel = 'Confident, tuned‑in food habits';
    summary =
      'You seem comfortable exploring foods while staying aware of how your body responds, which can support relaxed, informed choices.';
  } else if (wellnessScore < 50) {
    tendencyLabel = 'Room to gently build food awareness';
    summary =
      'Your answers suggest there is space to build a bit more confidence around labels, variety, and noticing how meals feel for you.';
  }

  const tips: string[] = [];

  if (values.newFoodComfortLevel <= 5) {
    tips.push('You might start by trying small portions of new foods when you feel relaxed and unhurried.');
  }
  if (values.labelReadingFrequency <= 5) {
    tips.push('Glancing at ingredient lists when it feels manageable can slowly build comfort with what is in your food.');
  }
  if (values.reactionAwareness <= 5) {
    tips.push('A simple food journal noting what you ate and how you felt can gently increase awareness over time.');
  }
  if (values.varietyOfFoods <= 5) {
    tips.push('Adding one new fruit, vegetable, or grain each week can gradually expand variety without pressure.');
  }
  if (values.mealPlanningConfidence <= 5) {
    tips.push('Planning even one or two simple, repeatable meals can create a sense of ease around eating.');
  }

  if (tips.length === 0) {
    tips.push('You can keep leaning on the eating routines that already feel supportive for you and your household.');
  }

  return { wellnessScore, tendencyLabel, summary, tips };
}

export default function FoodAllergyRiskScoreCalculator() {
  const [result, setResult] = useState<FoodSensitivityInsight | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newFoodComfortLevel: 5,
      labelReadingFrequency: 5,
      reactionAwareness: 5,
      varietyOfFoods: 5,
      mealPlanningConfidence: 5,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateFoodSensitivityInsight(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="newFoodComfortLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comfort trying new or unfamiliar foods (1–10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labelReadingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How often you read ingredient labels when it matters to you (1–10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reactionAwareness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Awareness of how your body feels after meals (1–10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="varietyOfFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perceived variety in your weekly meals (1–10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mealPlanningConfidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confidence planning meals that feel good for you (1–10)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value || '0', 10) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">See my food sensitivity tendency insight</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Info className="h-8 w-8 text-primary" />
              <CardTitle>Food Sensitivity Tendency Insight</CardTitle>
            </div>
            <CardDescription>
              A gentle, non‑diagnostic reflection on how you currently relate to variety, labels, and how foods feel for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold">{result.wellnessScore}</p>
                <p className="text-sm text-muted-foreground">Food sensitivity wellness score (0–100)</p>
                <p className="text-lg font-semibold">{result.tendencyLabel}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
                <h4 className="font-semibold mb-2">How to read this insight</h4>
                <ul className="text-sm space-y-1">
                  <li>This score is a snapshot of your current comfort and awareness around foods, not a medical result.</li>
                  <li>Higher scores usually mean you feel more confident and tuned‑in; lower scores mean there is room to build gentle habits.</li>
                </ul>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.summary}{' '}
                This is a personal wellness reflection only and does not predict, diagnose, or rule out any allergy or
                medical condition.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Food Sensitivity Tendency Insight – Gentle Food Awareness Check-In" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta
          itemProp="about"
          content="A gentle, non‑diagnostic overview to help you reflect on your comfort with foods, variety, and noticing how meals feel for you."
        />

        <h2 className="text-xl font-bold text-foreground">Guide: Building gentle food awareness</h2>
        <p>
          Many people like to balance enjoying foods with paying attention to how their body feels after eating. This
          reflection is about everyday awareness and comfort, not about diagnosing food allergies or intolerances.
        </p>
        <h3 className="font-semibold text-foreground mt-4">Simple ways to notice how foods feel for you</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Check in with yourself before and after meals to notice energy, comfort, and overall mood.</li>
          <li>Write brief notes about what you ate and how you felt later, if that feels helpful and not stressful.</li>
          <li>Introduce new foods slowly and in small amounts when you feel relaxed and unhurried.</li>
          <li>Notice patterns over time rather than focusing on any single meal.</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Supportive everyday habits</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Plan simple, repeatable meals that you know sit well with you.</li>
          <li>Read ingredient labels when it feels important to you, without aiming for perfection.</li>
          <li>Ask questions in restaurants if you want clarity about ingredients or preparation.</li>
          <li>Seek personalised advice from a qualified professional if you have specific concerns about your eating pattern.</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/ideal-body-weight-calculator">Pregnancy Weight Gain Calculator</Link></p>
        <p><Link className="text-primary underline" href="/daily-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
        <p><Link className="text-primary underline" href="/bmi-calculator">Child BMI Percentile Calculator</Link></p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}
