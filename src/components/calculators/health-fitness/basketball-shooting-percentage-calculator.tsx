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
import { Target, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  shotsAttempted: z.number().positive().optional(),
  shotsMade: z.number().positive().optional(),
  freeThrowsAttempted: z.number().positive().optional(),
  freeThrowsMade: z.number().positive().optional(),
  threePointersAttempted: z.number().positive().optional(),
  threePointersMade: z.number().positive().optional(),
  position: z.enum(['point-guard', 'shooting-guard', 'small-forward', 'power-forward', 'center']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateShootingPercentages(values: FormValues) {
  const shotsAttempted = values.shotsAttempted || 0;
  const shotsMade = values.shotsMade || 0;
  const freeThrowsAttempted = values.freeThrowsAttempted || 0;
  const freeThrowsMade = values.freeThrowsMade || 0;
  const threePointersAttempted = values.threePointersAttempted || 0;
  const threePointersMade = values.threePointersMade || 0;
  
  const fieldGoalPercentage = shotsAttempted > 0 ? (shotsMade / shotsAttempted) * 100 : 0;
  const freeThrowPercentage = freeThrowsAttempted > 0 ? (freeThrowsMade / freeThrowsAttempted) * 100 : 0;
  const threePointPercentage = threePointersAttempted > 0 ? (threePointersMade / threePointersAttempted) * 100 : 0;
  
  // Calculate True Shooting Percentage (TS%)
  const totalPoints = (shotsMade - threePointersMade) * 2 + threePointersMade * 3 + freeThrowsMade;
  const totalAttempts = shotsAttempted + (freeThrowsAttempted * 0.44);
  const trueShootingPercentage = totalAttempts > 0 ? (totalPoints / (2 * totalAttempts)) * 100 : 0;
  
  return {
    fieldGoalPercentage: Math.round(fieldGoalPercentage * 10) / 10,
    freeThrowPercentage: Math.round(freeThrowPercentage * 10) / 10,
    threePointPercentage: Math.round(threePointPercentage * 10) / 10,
    trueShootingPercentage: Math.round(trueShootingPercentage * 10) / 10,
  };
}

export default function BasketballShootingPercentageCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateShootingPercentages> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shotsAttempted: undefined,
      shotsMade: undefined,
      freeThrowsAttempted: undefined,
      freeThrowsMade: undefined,
      threePointersAttempted: undefined,
      threePointersMade: undefined,
      position: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateShootingPercentages(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="shotsAttempted" render={({ field }) => (
              <FormItem>
                <FormLabel>Field Goals Attempted</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="shotsMade" render={({ field }) => (
              <FormItem>
                <FormLabel>Field Goals Made</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="threePointersAttempted" render={({ field }) => (
              <FormItem>
                <FormLabel>3-Pointers Attempted</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="threePointersMade" render={({ field }) => (
              <FormItem>
                <FormLabel>3-Pointers Made</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="freeThrowsAttempted" render={({ field }) => (
              <FormItem>
                <FormLabel>Free Throws Attempted</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="freeThrowsMade" render={({ field }) => (
              <FormItem>
                <FormLabel>Free Throws Made</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="position" render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="point-guard">Point Guard</option>
                  <option value="shooting-guard">Shooting Guard</option>
                  <option value="small-forward">Small Forward</option>
                  <option value="power-forward">Power Forward</option>
                  <option value="center">Center</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Shooting Percentages</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-primary" />
              <CardTitle>Shooting Statistics</CardTitle>
            </div>
            <CardDescription>Complete shooting percentage breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{result.fieldGoalPercentage}%</p>
                <p className="text-sm text-muted-foreground">Field Goal %</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{result.freeThrowPercentage}%</p>
                <p className="text-sm text-muted-foreground">Free Throw %</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{result.threePointPercentage}%</p>
                <p className="text-sm text-muted-foreground">3-Point %</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{result.trueShootingPercentage}%</p>
                <p className="text-sm text-muted-foreground">True Shooting %</p>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.trueShootingPercentage >= 60 ? 'Elite shooting efficiency! Professional-level scoring ability.' : 
                 result.trueShootingPercentage >= 55 ? 'Excellent shooting. Above-average scoring efficiency.' :
                 result.trueShootingPercentage >= 50 ? 'Good shooting. Solid scoring foundation.' :
                 'Developing shooter. Focus on shot selection and mechanics.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Basketball Shooting Percentage Calculator – Complete Performance Analysis" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate basketball shooting percentages including field goal, free throw, three-point, and true shooting percentage." />

        <h2 className="text-xl font-bold text-foreground">Guide: Improving Shooting Accuracy</h2>
        <p>Shooting percentage reflects both skill and shot selection. Here's how to improve:</p>
        <h3 className="font-semibold text-foreground mt-4">Technique Fundamentals</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Consistent shooting form and follow-through</li>
          <li>Proper balance and foot positioning</li>
          <li>Focus on the rim and follow through</li>
          <li>Practice game-speed shooting</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Shot Selection</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Take shots within your range and comfort zone</li>
          <li>Look for open shots and good ball movement</li>
          <li>Practice different shot types and situations</li>
          <li>Focus on high-percentage shots first</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/tennis-serve-speed-calculator">Tennis Serve Speed Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/baseball-pitch-speed-calculator">Baseball Pitch Speed Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength-to-Weight Ratio</Link></p>
      </div>
    </div>
  );
}
