'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoonStar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  timeInBedHours: z.number().positive().max(24),
  totalSleepHours: z.number().nonnegative().max(24),
});

type FormValues = z.infer<typeof formSchema>;

const calculateSleepEfficiency = (values: FormValues) => {
  const efficiency = (values.totalSleepHours / values.timeInBedHours) * 100;
  
  // Determine wellness‑style status (non‑diagnostic)
  let status = 'excellent';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  let statusText = 'Excellent Sleep Efficiency';
  
  if (efficiency < 85) {
    status = 'gently-improve';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'Plenty of room to gently improve your time asleep in bed';
  } else if (efficiency < 90) {
    status = 'growing';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'Your sleep time in bed is gradually moving toward a steadier rhythm';
  } else if (efficiency >= 90 && efficiency < 95) {
    status = 'steady';
    statusColor = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    icon = CheckCircle;
    statusText = 'Most of your time in bed seems to be spent sleeping';
  } else {
    status = 'excellent';
    statusColor = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = CheckCircle;
    statusText = 'Excellent Sleep Efficiency';
  }

  // Calculate additional metrics
  const timeAwake = values.timeInBedHours - values.totalSleepHours;
  const timeAwakeMinutes = timeAwake * 60;
  
  return {
    efficiency,
    status,
    statusColor,
    bgColor,
    borderColor,
    icon,
    statusText,
    timeAwake,
    timeAwakeMinutes,
    timeInBed: values.timeInBedHours,
    totalSleep: values.totalSleepHours
  };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateSleepEfficiency>) => {
  const interpretations = [];
  
  if (result.efficiency < 85) {
    interpretations.push('You are spending a fair amount of time awake while in bed, which can be a cue to gently adjust your evening routine.');
    interpretations.push('You might experiment with getting into bed a little closer to when you naturally feel sleepy.');
  } else if (result.efficiency < 90) {
    interpretations.push('You are on the way to using most of your time in bed for sleep.');
    interpretations.push('Simple shifts—like a calmer wind‑down or fewer screens close to bedtime—may help you drift off more smoothly.');
  } else if (result.efficiency >= 90 && result.efficiency < 95) {
    interpretations.push('Most of the time you spend in bed is translating into sleep, which many people experience as supportive for rest and recovery.');
    interpretations.push('You can keep the routines that already help you feel restored.');
  } else {
    interpretations.push('You are using nearly all of your time in bed for sleep.');
    interpretations.push('Some people in this pattern choose to gently increase total sleep time if they would like even more rest.');
  }

  // Add specific insights based on time awake
  if (result.timeAwakeMinutes > 60) {
    interpretations.push(
      `You spent around ${result.timeAwakeMinutes.toFixed(
        0
      )} minutes awake in bed. You could experiment with getting up briefly for a calming activity if you feel wide awake.`
    );
  } else if (result.timeAwakeMinutes > 30) {
    interpretations.push(
      `You spent about ${result.timeAwakeMinutes.toFixed(
        0
      )} minutes awake in bed. Small tweaks to your wind‑down may help shorten this over time.`
    );
  } else {
    interpretations.push(
      `You spent only ${result.timeAwakeMinutes.toFixed(
        0
      )} minutes awake in bed, which many people experience as a smooth sleep rhythm.`
    );
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateSleepEfficiency>) => {
  const recommendations = [];
  
  if (result.efficiency < 85) {
    recommendations.push('Experiment with a short, relaxing pre‑bed routine such as reading, stretching, or quiet breathing.');
    recommendations.push('Notice how much time you spend in bed before you actually feel sleepy and adjust that window gently.');
    recommendations.push('Keep your wake‑up time fairly steady so your body learns a simple rhythm.');
  } else if (result.efficiency < 90) {
    recommendations.push('Pay attention to what helps you fall asleep more easily and repeat those cues most nights.');
    recommendations.push('Keep your sleep space as calm, dark and quiet as feels comfortable for you.');
    recommendations.push('Try setting a gentle “wind‑down alarm” 30–60 minutes before bed to begin slowing the day down.');
  } else if (result.efficiency >= 90 && result.efficiency < 95) {
    recommendations.push('You can keep the routines that already support your sleep well.');
    recommendations.push('If you would like even more rest, you might add a little extra time in bed and see how it feels.');
  } else {
    recommendations.push('Your current schedule appears to use time in bed for sleep very effectively.');
    recommendations.push('If this feels good to you, you can continue with your current approach.');
  }

  return recommendations;
};

const getSleepQualityInsights = (result: ReturnType<typeof calculateSleepEfficiency>) => {
  const insights = [];
  
  // Time in bed vs sleep time analysis
  if (result.timeInBed > 9) {
    insights.push('You are spending more than 9 hours in bed. Some people find a slightly shorter window still feels restful.');
  } else if (result.timeInBed < 7) {
    insights.push('You are spending less than 7 hours in bed. If your energy feels low, you might experiment with a bit more time for sleep.');
  }

  // Sleep efficiency analysis
  if (result.efficiency > 95) {
    insights.push('Very high percentages sometimes mean there is room to gently add a bit more total sleep if you would like.');
  }

  return insights;
};

export default function SleepEfficiencyCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateSleepEfficiency> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeInBedHours: undefined,
      totalSleepHours: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateSleepEfficiency(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="timeInBedHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Time in bed (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    placeholder="e.g., 8.5"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  About how long you were in bed from lying down to getting up.
                </p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="totalSleepHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated time asleep (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    placeholder="e.g., 7.2"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  Your best guess for how many of those hours you were actually asleep.
                </p>
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">
            <MoonStar className="mr-2 h-4 w-4" />
            See my time‑in‑bed wellness index
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <result.icon className={`h-5 w-5 ${result.statusColor}`} />
              Time‑in‑Bed Wellness Insight
            </CardTitle>
            <CardDescription>A gentle, non‑diagnostic look at how much of your time in bed seems to be spent sleeping.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">{result.efficiency.toFixed(1)}%</p>
                  <p className={`text-lg font-semibold ${result.statusColor}`}>{result.statusText}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time in Bed</p>
                    <p className="font-semibold">{result.timeInBed.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Sleep</p>
                    <p className="font-semibold">{result.totalSleep.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Awake</p>
                    <p className="font-semibold">{result.timeAwake.toFixed(1)} hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MoonStar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{interpretation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Gentle routine suggestions</h3>
              <ul className="space-y-2">
                {getPersonalizedRecommendations(result).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {getSleepQualityInsights(result).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Additional wellness insights</h3>
                <ul className="space-y-2">
                  {getSleepQualityInsights(result).map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <SeGuide />
      
      <EmbedWidget calculatorSlug="sleep-efficiency-calculator" calculatorName="Sleep Efficiency Calculator" />

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

function SeGuide() {
  return (
    <section
      className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
      itemScope
      itemType="https://schema.org/Calculator"
    >
      {/* SEO & SCHEMA METADATA – wellness, non‑diagnostic */}
      <meta itemProp="name" content="Sleep Time in Bed Wellness Index" />
      <meta
        itemProp="description"
        content="Look at how much of your time in bed seems to be spent sleeping and explore gentle lifestyle ideas to support more restful nights."
      />
      <meta
        itemProp="keywords"
        content="sleep time in bed wellness index, sleep habits reflection, bedtime routine, gentle sleep insight, non diagnostic sleep check in"
      />

      <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/sleep-efficiency-calculator" />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
        Time in Bed Wellness Index: A Gentle Look at Your Sleep Habits
      </h1>

      <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What this index is (and is not)</h2>
      <p>
        This tool simply compares how long you are in bed with how long you estimate you were asleep. It offers a personal
        wellness perspective on your current habits. It does not diagnose sleep disorders or make medical claims.
      </p>

      <hr />

      <h2 id="how-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
        How the time‑in‑bed wellness idea works
      </h2>
      <p>
        Many people notice that some nights they fall asleep quickly and other nights they are awake in bed for a while. This
        index uses a simple percentage to show how much of your time in bed seems to be spent sleeping.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6">A simple percentage for reflection</h3>
      <p>
        The percentage is calculated by dividing your estimated time asleep by your total time in bed and multiplying by 100.
        Higher numbers mean more of your bed time seems to be spent sleeping. The goal is not perfection, but awareness of
        your personal patterns.
      </p>

      <hr />

      <h2 id="habits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
        Everyday habits that can support smoother sleep
      </h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Keep a regular wake‑up time so your body has a consistent anchor for the day.</li>
        <li>Create a small pre‑bed ritual that signals “time to unwind,” such as stretching, journaling, or quiet reading.</li>
        <li>Make your bedroom as comfortable as you reasonably can—cool, darker, and quieter often help.</li>
        <li>Notice how caffeine, late heavy meals, or screens close to bedtime affect how easily you drift off.</li>
      </ul>

      <hr />

      <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
        Frequently asked questions about this index
      </h2>
      <h3 className="text-xl font-semibold text-foreground mt-6">Is this a medical or clinical score?</h3>
      <p>
        No. This is a simple wellness index meant to help you notice patterns in how you use your time in bed. It is not a
        clinical or diagnostic measure and does not replace professional advice.
      </p>

      <h3 className="text-xl font-semibold text-foreground mt-6">What if I feel worried about my sleep?</h3>
      <p>
        If your sleep leaves you feeling concerned, overwhelmed, or unwell, consider talking with a qualified health
        professional who can look at your full situation and provide personalized guidance.
      </p>
    </section>
  );
}