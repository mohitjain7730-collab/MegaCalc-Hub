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
import { Zap, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  currentVo2Max: z.number().positive().optional(),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward', 'winger']).optional(),
  level: z.enum(['recreational', 'amateur', 'semi-pro', 'professional']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateVo2Requirement(values: FormValues) {
  const age = values.age || 25;
  const weight = values.weight || 70;
  const currentVo2 = values.currentVo2Max || 45;
  
  // Base VO2 max requirements by position and level
  let baseRequirement = 45; // ml/kg/min
  
  if (values.position === 'midfielder') baseRequirement = 55;
  else if (values.position === 'forward' || values.position === 'winger') baseRequirement = 52;
  else if (values.position === 'defender') baseRequirement = 48;
  else if (values.position === 'goalkeeper') baseRequirement = 42;
  
  if (values.level === 'professional') baseRequirement += 8;
  else if (values.level === 'semi-pro') baseRequirement += 5;
  else if (values.level === 'amateur') baseRequirement += 2;
  
  // Age adjustment
  if (age > 30) baseRequirement -= (age - 30) * 0.5;
  
  const gap = Math.max(0, baseRequirement - currentVo2);
  return Math.round(baseRequirement);
}

export default function SoccerVo2RequirementCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      weight: undefined,
      height: undefined,
      currentVo2Max: undefined,
      position: undefined,
      level: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateVo2Requirement(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="currentVo2Max" render={({ field }) => (
              <FormItem>
                <FormLabel>Current VO₂ Max (ml/kg/min)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem>
                <FormLabel>Playing Position</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="goalkeeper">Goalkeeper</option>
                  <option value="defender">Defender</option>
                  <option value="midfielder">Midfielder</option>
                  <option value="forward">Forward</option>
                  <option value="winger">Winger</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="level" render={({ field }) => (
              <FormItem>
                <FormLabel>Playing Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="recreational">Recreational</option>
                  <option value="amateur">Amateur</option>
                  <option value="semi-pro">Semi-Professional</option>
                  <option value="professional">Professional</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate VO₂ Requirement</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-primary" />
              <CardTitle>Recommended VO₂ Max</CardTitle>
            </div>
            <CardDescription>Based on position and playing level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} ml/kg/min</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result >= 60 ? 'Elite level fitness required! This is professional/elite athlete territory.' : 
                 result >= 50 ? 'High level fitness required. Excellent cardiovascular capacity needed.' :
                 result >= 45 ? 'Good fitness level. Solid foundation with room for improvement.' :
                 'Moderate fitness level. Focus on building aerobic capacity through training.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Soccer VO₂ Requirement Calculator – Position-Specific Fitness Goals" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate optimal VO₂ max for soccer players based on position and playing level with training recommendations." />

        <h2 className="text-xl font-bold text-foreground">Guide: Building Soccer-Specific VO₂ Max</h2>
        <p>VO₂ max is crucial for soccer performance. Here's how to improve your aerobic capacity:</p>
        <h3 className="font-semibold text-foreground mt-4">Training Methods</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Interval training: 4x4 minute high-intensity intervals</li>
          <li>Small-sided games for sport-specific fitness</li>
          <li>Continuous running at 70-80% max heart rate</li>
          <li>Fartlek training with varying intensities</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Position-Specific Training</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Midfielders: Focus on high-intensity intervals</li>
          <li>Forwards: Sprint training and explosive movements</li>
          <li>Defenders: Endurance and recovery training</li>
          <li>Goalkeepers: Reaction and short-burst training</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/target-heart-rate-calculator">Target Heart Rate Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/marathon-finish-time-predictor">Marathon Finish Time Predictor</Link></p>
      </div>
    </div>
  );
}
