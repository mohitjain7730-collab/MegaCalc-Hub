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
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  armLength: z.number().positive().optional(),
  pitchType: z.enum(['fastball', 'curveball', 'slider', 'changeup', 'knuckleball']).optional(),
  level: z.enum(['youth', 'high-school', 'college', 'minor-league', 'major-league']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculatePitchSpeed(values: FormValues) {
  const age = values.age || 18;
  const height = values.height || 180; // cm
  const weight = values.weight || 80; // kg
  const armLength = values.armLength || 75; // cm
  
  // Base speed calculation using physics principles
  let baseSpeed = 80; // mph
  
  // Age and physical factors
  if (age >= 18 && age <= 25) baseSpeed += 5;
  else if (age > 25) baseSpeed -= (age - 25) * 0.5;
  
  // Height factor (longer arms = more leverage)
  if (height > 185) baseSpeed += (height - 185) * 0.1;
  else if (height < 175) baseSpeed -= (175 - height) * 0.1;
  
  // Weight factor (more mass = more power potential)
  if (weight > 85) baseSpeed += (weight - 85) * 0.05;
  
  // Pitch type adjustment
  if (values.pitchType === 'fastball') baseSpeed += 5;
  else if (values.pitchType === 'slider') baseSpeed += 2;
  else if (values.pitchType === 'curveball') baseSpeed -= 3;
  else if (values.pitchType === 'changeup') baseSpeed -= 8;
  else if (values.pitchType === 'knuckleball') baseSpeed -= 10;
  
  // Level adjustment
  if (values.level === 'major-league') baseSpeed += 15;
  else if (values.level === 'minor-league') baseSpeed += 10;
  else if (values.level === 'college') baseSpeed += 5;
  else if (values.level === 'high-school') baseSpeed += 2;
  
  return Math.round(baseSpeed);
}

export default function BaseballPitchSpeedCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      height: undefined,
      weight: undefined,
      armLength: undefined,
      pitchType: undefined,
      level: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculatePitchSpeed(values));
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
            <FormField control={form.control} name="height" render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
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
            <FormField control={form.control} name="armLength" render={({ field }) => (
              <FormItem>
                <FormLabel>Arm Length (cm)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pitchType" render={({ field }) => (
              <FormItem>
                <FormLabel>Pitch Type</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="fastball">Fastball</option>
                  <option value="curveball">Curveball</option>
                  <option value="slider">Slider</option>
                  <option value="changeup">Changeup</option>
                  <option value="knuckleball">Knuckleball</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="level" render={({ field }) => (
              <FormItem>
                <FormLabel>Playing Level</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="youth">Youth</option>
                  <option value="high-school">High School</option>
                  <option value="college">College</option>
                  <option value="minor-league">Minor League</option>
                  <option value="major-league">Major League</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Pitch Speed</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Pitch Speed</CardTitle>
            </div>
            <CardDescription>Based on physical attributes and pitch type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mph</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result >= 95 ? 'Elite velocity! Professional-level fastball speed.' : 
                 result >= 90 ? 'Excellent velocity. College to pro potential.' :
                 result >= 85 ? 'Good velocity. Strong foundation for development.' :
                 result >= 80 ? 'Average velocity. Focus on mechanics and strength.' :
                 'Developing velocity. Emphasize proper mechanics and conditioning.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Baseball Pitch Speed Calculator – Velocity and Mechanics Analysis" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate baseball pitch speed based on physical attributes and pitch type with mechanics improvement tips." />

        <h2 className="text-xl font-bold text-foreground">Guide: Increasing Pitch Velocity</h2>
        <p>Pitch speed comes from proper mechanics, strength, and flexibility. Here's how to improve:</p>
        <h3 className="font-semibold text-foreground mt-4">Mechanics Fundamentals</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Proper leg drive and hip rotation</li>
          <li>Long arm action with good extension</li>
          <li>Follow through across your body</li>
          <li>Consistent release point and timing</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Strength Training</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Core strength for rotational power</li>
          <li>Leg strength for drive and stability</li>
          <li>Shoulder and arm strength (carefully)</li>
          <li>Flexibility to prevent injury</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/tennis-serve-speed-calculator">Tennis Serve Speed Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength-to-Weight Ratio</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/basketball-shooting-percentage-calculator">Basketball Shooting Percentage Calculator</Link></p>
      </div>
    </div>
  );
}
