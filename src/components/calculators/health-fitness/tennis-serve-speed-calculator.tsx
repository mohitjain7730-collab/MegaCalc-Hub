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
  ballWeight: z.number().positive().optional(),
  racketHeadSpeed: z.number().positive().optional(),
  ballSpeed: z.number().positive().optional(),
  courtSurface: z.enum(['hard', 'clay', 'grass', 'carpet']).optional(),
  serveType: z.enum(['flat', 'slice', 'kick']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateServeSpeed(values: FormValues) {
  // Simplified calculation based on racket head speed and ball weight
  const racketSpeed = values.racketHeadSpeed || 0;
  const ballWeight = values.ballWeight || 57; // Standard tennis ball weight in grams
  
  // Basic physics: serve speed ≈ racket speed * efficiency factor
  let efficiency = 0.85; // Base efficiency
  
  if (values.serveType === 'flat') efficiency = 0.9;
  else if (values.serveType === 'slice') efficiency = 0.8;
  else if (values.serveType === 'kick') efficiency = 0.75;
  
  if (values.courtSurface === 'grass') efficiency *= 1.05; // Faster surface
  else if (values.courtSurface === 'clay') efficiency *= 0.95; // Slower surface
  
  const serveSpeed = racketSpeed * efficiency;
  return Math.round(serveSpeed);
}

export default function TennisServeSpeedCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ballWeight: undefined,
      racketHeadSpeed: undefined,
      ballSpeed: undefined,
      courtSurface: undefined,
      serveType: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateServeSpeed(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="racketHeadSpeed" render={({ field }) => (
              <FormItem>
                <FormLabel>Racket Head Speed (km/h)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="ballWeight" render={({ field }) => (
              <FormItem>
                <FormLabel>Ball Weight (grams)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="serveType" render={({ field }) => (
              <FormItem>
                <FormLabel>Serve Type</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="flat">Flat</option>
                  <option value="slice">Slice</option>
                  <option value="kick">Kick</option>
                </select>
              </FormItem>
            )} />
            <FormField control={form.control} name="courtSurface" render={({ field }) => (
              <FormItem>
                <FormLabel>Court Surface</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="hard">Hard Court</option>
                  <option value="clay">Clay</option>
                  <option value="grass">Grass</option>
                  <option value="carpet">Carpet</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Serve Speed</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Zap className="h-8 w-8 text-primary" />
              <CardTitle>Estimated Serve Speed</CardTitle>
            </div>
            <CardDescription>Based on racket head speed and court conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} km/h</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result >= 200 ? 'Elite level serve speed! Professional players typically serve 180-220 km/h.' : 
                 result >= 160 ? 'Advanced level serve speed. Great power and technique!' :
                 result >= 130 ? 'Intermediate level serve speed. Good foundation with room for improvement.' :
                 'Beginner to intermediate level. Focus on technique and racket head speed.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Tennis Serve Speed Calculator – Power and Technique Analysis" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate tennis serve speed based on racket head speed, court surface, and serve type with technique tips." />

        <h2 className="text-xl font-bold text-foreground">Guide: Improving Your Serve Speed</h2>
        <p>Serve speed depends on technique, strength, and equipment. Here's how to maximize your power:</p>
        <h3 className="font-semibold text-foreground mt-4">Technique Fundamentals</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use proper grip (continental for most serves)</li>
          <li>Generate power from legs and core rotation</li>
          <li>Follow through across your body</li>
          <li>Practice consistent ball toss placement</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Equipment Considerations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Racket weight and balance affect power transfer</li>
          <li>String tension impacts ball speed and control</li>
          <li>Court surface affects ball bounce and speed</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/target-heart-rate-calculator">Target Heart Rate Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength-to-Weight Ratio</Link></p>
      </div>
    </div>
  );
}
