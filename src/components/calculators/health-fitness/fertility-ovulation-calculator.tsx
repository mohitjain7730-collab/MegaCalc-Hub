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
import { Heart, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  lastMenstrualPeriod: z.string().optional(),
  cycleLength: z.number().positive().optional(),
  lutealPhaseLength: z.number().positive().optional(),
  age: z.number().positive().optional(),
  irregularCycles: z.enum(['regular', 'slightly-irregular', 'very-irregular']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateOvulationFertility(values: FormValues) {
  const cycleLength = values.cycleLength || 28;
  const lutealPhaseLength = values.lutealPhaseLength || 14;
  const age = values.age || 30;
  
  let lmpDate: Date;
  if (values.lastMenstrualPeriod) {
    lmpDate = new Date(values.lastMenstrualPeriod);
  } else {
    // Default to 10 days ago for demonstration
    lmpDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  }
  
  // Calculate ovulation date (cycle length - luteal phase length)
  const ovulationDay = cycleLength - lutealPhaseLength;
  const ovulationDate = new Date(lmpDate.getTime() + ovulationDay * 24 * 60 * 60 * 1000);
  
  // Fertile window (5 days before ovulation + ovulation day)
  const fertileWindowStart = new Date(ovulationDate.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertileWindowEnd = new Date(ovulationDate.getTime() + 24 * 60 * 60 * 1000);
  
  // Next period date
  const nextPeriodDate = new Date(lmpDate.getTime() + cycleLength * 24 * 60 * 60 * 1000);
  
  // Age-related fertility adjustments
  let fertilityScore = 100;
  if (age >= 35) fertilityScore -= (age - 35) * 3;
  if (age >= 40) fertilityScore -= (age - 40) * 5;
  
  // Cycle regularity adjustments
  if (values.irregularCycles === 'very-irregular') fertilityScore -= 20;
  else if (values.irregularCycles === 'slightly-irregular') fertilityScore -= 10;
  
  const fertilityLevel = fertilityScore >= 80 ? 'high' : fertilityScore >= 60 ? 'moderate' : fertilityScore >= 40 ? 'low' : 'very-low';
  
  return {
    ovulationDate: ovulationDate.toLocaleDateString(),
    fertileWindowStart: fertileWindowStart.toLocaleDateString(),
    fertileWindowEnd: fertileWindowEnd.toLocaleDateString(),
    nextPeriodDate: nextPeriodDate.toLocaleDateString(),
    ovulationDay,
    cycleLength,
    fertilityScore: Math.max(0, fertilityScore),
    fertilityLevel,
  };
}

export default function FertilityOvulationCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateOvulationFertility> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastMenstrualPeriod: undefined,
      cycleLength: undefined,
      lutealPhaseLength: undefined,
      age: undefined,
      irregularCycles: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateOvulationFertility(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="lastMenstrualPeriod" render={({ field }) => (
              <FormItem>
                <FormLabel>Last Menstrual Period Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cycleLength" render={({ field }) => (
              <FormItem>
                <FormLabel>Average Cycle Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="lutealPhaseLength" render={({ field }) => (
              <FormItem>
                <FormLabel>Luteal Phase Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="irregularCycles" render={({ field }) => (
              <FormItem>
                <FormLabel>Cycle Regularity</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="regular">Regular (consistent length)</option>
                  <option value="slightly-irregular">Slightly Irregular (±3 days)</option>
                  <option value="very-irregular">Very Irregular (±7+ days)</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Ovulation & Fertility</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary" />
              <CardTitle>Ovulation & Fertility Analysis</CardTitle>
            </div>
            <CardDescription>Based on your menstrual cycle patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{result.ovulationDate}</p>
                <p className="text-sm text-muted-foreground">Predicted Ovulation Date</p>
                <p className="text-lg">Day {result.ovulationDay} of {result.cycleLength}-day cycle</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Fertile Window</h4>
                  <p className="text-sm">{result.fertileWindowStart}</p>
                  <p className="text-sm">to</p>
                  <p className="text-sm">{result.fertileWindowEnd}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Next Period</h4>
                  <p className="text-sm">{result.nextPeriodDate}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${
                  result.fertilityLevel === 'high' ? 'bg-green-100 dark:bg-green-900' :
                  result.fertilityLevel === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  result.fertilityLevel === 'low' ? 'bg-orange-100 dark:bg-orange-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <h4 className="font-semibold mb-2">Fertility Score</h4>
                  <p className="text-2xl font-bold">{result.fertilityScore}%</p>
                  <p className="text-sm capitalize">{result.fertilityLevel} fertility</p>
                </div>
              </div>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.fertilityLevel === 'high' ? 'Your fertility indicators are excellent. Optimal timing for conception is during the fertile window.' : 
                 result.fertilityLevel === 'moderate' ? 'Your fertility is good. Track your cycles and consider timing intercourse during the fertile window.' :
                 result.fertilityLevel === 'low' ? 'Your fertility may be reduced. Consider consulting a fertility specialist if trying to conceive.' :
                 'Your fertility indicators suggest challenges. Consult with a reproductive endocrinologist for evaluation and treatment options.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Fertility Ovulation Calculator – Cycle Tracking and Conception Timing" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate ovulation dates, fertile windows, and fertility scores based on menstrual cycle patterns and age." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Fertility and Ovulation</h2>
        <p>Tracking your menstrual cycle helps identify the most fertile days for conception. Here is what you need to know:</p>
        <h3 className="font-semibold text-foreground mt-4">Menstrual Cycle Basics</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Average cycle length: 28 days (range: 21-35 days)</li>
          <li>Ovulation occurs 14 days before next period</li>
          <li>Egg survives 12-24 hours after ovulation</li>
          <li>Sperm can survive 3-5 days in reproductive tract</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Fertile Window</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Most fertile: 2 days before and day of ovulation</li>
          <li>Fertile window: 5 days before to 1 day after ovulation</li>
          <li>Track cervical mucus, basal body temperature, and LH surge</li>
          <li>Consider cycle irregularities and age factors</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/due-date-calculator">Due Date Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/pregnancy-weight-gain-calculator">Pregnancy Weight Gain Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
      </div>
    </div>
  );
}
