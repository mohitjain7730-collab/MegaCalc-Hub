'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  capillariesCounted: z.number().positive('Enter a positive number').optional(),
  fieldAreaMm2: z.number().positive('Enter area in mm^2').optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapillaryDensityEstimator() {
  const [result, setResult] = useState<{ densityPerMm2: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      capillariesCounted: undefined,
      fieldAreaMm2: undefined,
    },
  });

  const calculate = (values: FormValues) => {
    if (!values.capillariesCounted || !values.fieldAreaMm2) return null;
    const density = values.capillariesCounted / values.fieldAreaMm2; // capillaries per mm^2
    return Math.round(density * 100) / 100;
  };

  const interpret = (density: number) => {
    // Generic reference ranges for skeletal muscle at rest
    // Low < 200, Average 200-350, High > 350 capillaries/mm^2
    if (density > 350) return 'High capillary density, indicative of strong aerobic conditioning.';
    if (density >= 200) return 'Average capillary density, consistent with moderate aerobic fitness.';
    return 'Low capillary density, may reflect limited aerobic conditioning.';
  };

  const opinionForUser = (density: number) => {
    if (density > 350) return 'Excellent aerobic base. Maintain with regular endurance work and occasional intervals.';
    if (density >= 200) return 'Solid foundation. Gradually increase weekly aerobic volume and include tempo sessions.';
    return 'Consider progressive aerobic training (Zone 2), consistency, and nutrition to improve perfusion.';
  };

  const onSubmit = (values: FormValues) => {
    const density = calculate(values);
    if (density == null) {
      setResult(null);
      return;
    }
    setResult({
      densityPerMm2: density,
      interpretation: interpret(density),
      opinion: opinionForUser(density),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capillariesCounted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capillaries Counted (n)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="Enter count" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fieldAreaMm2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Microscope Field Area (mm²)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Enter area in mm²" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Estimate Capillary Density</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Capillary Density Result</CardTitle>
              </div>
              <CardDescription>Capillaries per square millimeter (mm²)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.densityPerMm2} / mm²</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Opinion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{result.opinion}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Capillary density is computed as counted capillaries divided by the microscopic field area.</p>
            <p>Higher density generally correlates with better oxygen delivery capacity and endurance performance.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide: Capillary Density in Training</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <h4 className="font-semibold text-foreground">What Is Capillary Density?</h4>
            <p>Capillary density reflects the number of capillaries supplying a given area of muscle. Endurance training stimulates angiogenesis, increasing density and improving oxygen extraction.</p>
            <h4 className="font-semibold text-foreground">Why It Matters</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Enhances oxygen delivery and metabolite clearance</li>
              <li>Improves lactate shuttling and fatigue resistance</li>
              <li>Supports higher sustainable workloads</li>
            </ul>
            <h4 className="font-semibold text-foreground">How to Improve</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Consistent Zone 2 aerobic training</li>
              <li>Tempo and long intervals near lactate threshold</li>
              <li>Adequate calories, iron, and sleep for adaptation</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related-calculators">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Aerobic Capacity</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</a></li>
                  <li><a href="/category/health-fitness/running-economy-calculator" className="text-primary underline">Running Economy Calculator</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Recovery & Training</h4>
                <ul className="space-y-1">
                  <li><a href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</a></li>
                  <li><a href="/category/health-fitness/muscle-soreness-recovery-estimator" className="text-primary underline">Muscle Soreness Recovery Estimator</a></li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


