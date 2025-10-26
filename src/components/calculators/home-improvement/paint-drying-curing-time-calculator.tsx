'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaintBucket, Clock, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const paintTypes = {
  latex: { dryTime: 1, cureTime: 30, recoatTime: 4 },
  oil: { dryTime: 8, cureTime: 7, recoatTime: 24 },
  primer: { dryTime: 1, cureTime: 7, recoatTime: 2 },
  enamel: { dryTime: 2, cureTime: 14, recoatTime: 6 },
  epoxy: { dryTime: 4, cureTime: 7, recoatTime: 8 },
};

const formSchema = z.object({
  paintType: z.string().optional(),
  temperature: z.number().min(32).max(100).optional(),
  humidity: z.number().min(0).max(100).optional(),
  thickness: z.number().min(0.1).optional(),
  coats: z.number().min(1).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaintDryingCuringTimeCalculator() {
  const [result, setResult] = useState<{ 
    dryTime: number; 
    cureTime: number; 
    recoatTime: number; 
    interpretation: string; 
    opinion: string;
    dryingLevel: string;
    curingLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      paintType: undefined, 
      temperature: undefined, 
      humidity: undefined, 
      thickness: undefined, 
      coats: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.paintType == null || v.temperature == null || v.humidity == null || v.thickness == null || v.coats == null) return null;
    
    const basePaint = paintTypes[v.paintType as keyof typeof paintTypes];
    if (!basePaint) return null;
    
    // Temperature adjustment (optimal is 70°F)
    const tempFactor = Math.max(0.5, Math.min(2, 70 / v.temperature));
    
    // Humidity adjustment (optimal is 50%)
    const humidityFactor = Math.max(0.5, Math.min(2, 50 / v.humidity));
    
    // Thickness adjustment (optimal is 1 mil)
    const thicknessFactor = Math.max(0.5, Math.min(2, v.thickness));
    
    const dryTime = basePaint.dryTime * tempFactor * humidityFactor * thicknessFactor;
    const cureTime = basePaint.cureTime * tempFactor * humidityFactor;
    const recoatTime = basePaint.recoatTime * tempFactor * humidityFactor;
    
    return { dryTime, cureTime, recoatTime };
  };

  const interpret = (dryTime: number, cureTime: number, paintType: string) => {
    const paintTypeName = paintType.charAt(0).toUpperCase() + paintType.slice(1);
    if (dryTime <= 2) return `Fast-drying ${paintTypeName} paint with ${dryTime.toFixed(1)} hour dry time and ${cureTime.toFixed(0)} day cure time.`;
    if (dryTime <= 6) return `Standard-drying ${paintTypeName} paint with ${dryTime.toFixed(1)} hour dry time and ${cureTime.toFixed(0)} day cure time.`;
    return `Slow-drying ${paintTypeName} paint with ${dryTime.toFixed(1)} hour dry time and ${cureTime.toFixed(0)} day cure time.`;
  };

  const getDryingLevel = (dryTime: number) => {
    if (dryTime <= 2) return 'Fast Drying';
    if (dryTime <= 6) return 'Standard Drying';
    return 'Slow Drying';
  };

  const getCuringLevel = (cureTime: number) => {
    if (cureTime <= 7) return 'Quick Cure';
    if (cureTime <= 14) return 'Standard Cure';
    return 'Extended Cure';
  };

  const getRecommendations = (dryTime: number, cureTime: number, recoatTime: number, temperature: number, humidity: number, coats: number) => {
    const recommendations = [];
    
    recommendations.push(`Wait ${dryTime.toFixed(1)} hours before light handling`);
    recommendations.push(`Allow ${cureTime.toFixed(0)} days for full cure before heavy use`);
    recommendations.push(`Recoat after ${recoatTime.toFixed(1)} hours for best adhesion`);
    recommendations.push('Ensure proper ventilation during application');
    
    if (temperature < 50) {
      recommendations.push('Consider using paint heaters or waiting for warmer weather');
      recommendations.push('Use low-temperature paint formulations if available');
    }
    
    if (humidity > 70) {
      recommendations.push('Use dehumidifiers to reduce humidity');
      recommendations.push('Consider delaying painting until humidity drops');
    }
    
    if (coats > 2) {
      recommendations.push('Plan for extended project timeline');
      recommendations.push('Allow extra time between coats for proper drying');
    }
    
    return recommendations;
  };

  const getConsiderations = (dryTime: number, cureTime: number, temperature: number, humidity: number) => {
    const considerations = [];
    
    considerations.push('Temperature and humidity significantly affect drying times');
    considerations.push('Proper ventilation speeds up drying and improves air quality');
    considerations.push('Thick coats take longer to dry than thin coats');
    considerations.push('Full cure time is needed before heavy furniture placement');
    
    if (temperature < 50 || temperature > 85) {
      considerations.push('Extreme temperatures can cause paint failure');
    }
    
    if (humidity > 80) {
      considerations.push('High humidity can cause blistering and poor adhesion');
    }
    
    return considerations;
  };

  const opinion = (dryTime: number, cureTime: number, temperature: number, humidity: number) => {
    if (dryTime <= 2 && temperature >= 60 && temperature <= 80 && humidity >= 40 && humidity <= 60) {
      return `Ideal conditions for fast, even drying. Your paint should perform excellently with minimal issues.`;
    }
    if (dryTime <= 6 && temperature >= 50 && temperature <= 85 && humidity >= 30 && humidity <= 70) {
      return `Good conditions for painting. Allow adequate time for proper drying and curing.`;
    }
    return `Challenging conditions for painting. Consider adjusting temperature, humidity, or timing for better results.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    setResult({ 
      dryTime: calculation.dryTime, 
      cureTime: calculation.cureTime, 
      recoatTime: calculation.recoatTime, 
      interpretation: interpret(calculation.dryTime, calculation.cureTime, values.paintType || ''), 
      opinion: opinion(calculation.dryTime, calculation.cureTime, values.temperature || 0, values.humidity || 0),
      dryingLevel: getDryingLevel(calculation.dryTime),
      curingLevel: getCuringLevel(calculation.cureTime),
      recommendations: getRecommendations(calculation.dryTime, calculation.cureTime, calculation.recoatTime, values.temperature || 0, values.humidity || 0, values.coats || 0),
      considerations: getConsiderations(calculation.dryTime, calculation.cureTime, values.temperature || 0, values.humidity || 0)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaintBucket className="h-5 w-5" />
            Paint & Environmental Conditions
          </CardTitle>
          <CardDescription>
            Enter your paint type and environmental conditions to calculate drying and curing times
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="paintType" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PaintBucket className="h-4 w-4" />
                        Paint Type
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="">Select paint type</option>
                          <option value="latex">Latex Paint</option>
                          <option value="oil">Oil-Based Paint</option>
                          <option value="primer">Primer</option>
                          <option value="enamel">Enamel Paint</option>
                          <option value="epoxy">Epoxy Paint</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="temperature" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Temperature (°F)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 70" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="humidity" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Humidity (%)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 50" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="thickness" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PaintBucket className="h-4 w-4" />
                        Paint Thickness (mils)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 1.0" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="coats" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PaintBucket className="h-4 w-4" />
                        Number of Coats
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 2" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} 
                        />
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Drying Times
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PaintBucket className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Paint Drying Analysis</CardTitle>
                  <CardDescription>Detailed drying and curing time calculations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Dry Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.dryTime.toFixed(1)} hours
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.dryingLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Cure Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.cureTime.toFixed(0)} days
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.curingLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recoat Time</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.recoatTime.toFixed(1)} hours
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Timing Guidelines</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Touch Dry:</span>
                      <span className="font-medium">{result.dryTime.toFixed(1)} hours</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Recoat Ready:</span>
                      <span className="font-medium">{result.recoatTime.toFixed(1)} hours</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Full Cure:</span>
                      <span className="font-medium">{result.cureTime.toFixed(0)} days</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Condition Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    {result.opinion}
                  </p>
                </div>
              </div>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <PaintBucket className="h-5 w-5" />
                        Application Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Explain the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Paint Type</h4>
              <p className="text-muted-foreground">
                Different paint types have varying drying characteristics. Latex dries fastest, while oil-based paints take longer but provide durability.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Temperature</h4>
              <p className="text-muted-foreground">
                Temperature significantly affects drying time. Optimal range is 60-80°F. Cold temperatures slow drying, while hot temperatures can cause issues.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Humidity</h4>
              <p className="text-muted-foreground">
                Humidity affects paint drying by slowing evaporation. Optimal range is 40-60%. High humidity can cause blistering and poor adhesion.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Paint Thickness</h4>
              <p className="text-muted-foreground">
                Thicker coats take longer to dry than thin coats. Standard thickness is 1-2 mils. Thick coats may cause sagging or wrinkling.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other home improvement calculators to plan your painting and renovation project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/paint-coverage-calculator" className="text-primary hover:underline">
                    Paint Coverage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the exact amount of paint needed for your walls and ceilings.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/window-glass-curtain-coverage-calculator" className="text-primary hover:underline">
                    Window Curtain Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal curtain coverage and fullness for your windows.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/cost-estimator-renovation-calculator" className="text-primary hover:underline">
                    Renovation Cost Estimator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get accurate cost estimates for your home renovation and improvement projects.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/lighting-layout-calculator" className="text-primary hover:underline">
                    Lighting Layout Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal lighting fixtures and placement for your room dimensions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PaintBucket className="h-5 w-5" />
              Complete Guide to Paint Drying and Curing
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about paint drying times and curing processes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between dry time and cure time?</h4>
              <p className="text-muted-foreground">
                Dry time is when paint is touch-dry and safe to handle. Cure time is when paint reaches full hardness and chemical resistance. Cure time is typically much longer than dry time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does temperature affect paint drying?</h4>
              <p className="text-muted-foreground">
                Temperature directly affects drying speed. Cold temperatures slow drying, while hot temperatures can cause cracking, blistering, or poor adhesion. Optimal range is 60-80°F.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why does humidity matter for paint drying?</h4>
              <p className="text-muted-foreground">
                High humidity slows paint drying by reducing evaporation. It can cause blistering, poor adhesion, and extended drying times. Optimal humidity is 40-60%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I speed up paint drying?</h4>
              <p className="text-muted-foreground">
                Yes, by improving ventilation, using fans, dehumidifiers, or paint heaters. However, avoid forcing rapid drying as it can cause cracking or poor adhesion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long should I wait between coats?</h4>
              <p className="text-muted-foreground">
                Wait for the recoat time specified on the paint can, typically 2-6 hours for latex, 24 hours for oil-based. Too soon can cause wrinkling or poor adhesion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When can I place furniture on painted surfaces?</h4>
              <p className="text-muted-foreground">
                Wait for full cure time (usually 7-30 days) before placing heavy furniture. Use felt pads or coasters to protect surfaces during the curing period.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What happens if I paint in cold weather?</h4>
              <p className="text-muted-foreground">
                Cold weather slows drying and can cause poor adhesion, cracking, or wrinkling. Use low-temperature paint formulations or wait for warmer conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if paint is fully cured?</h4>
              <p className="text-muted-foreground">
                Paint is fully cured when it reaches maximum hardness and chemical resistance. This typically takes 7-30 days depending on paint type and conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I paint over partially cured paint?</h4>
              <p className="text-muted-foreground">
                Yes, you can paint over touch-dry paint for recoating. However, avoid heavy use or cleaning until full cure time has passed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the best time of day to paint?</h4>
              <p className="text-muted-foreground">
                Paint during moderate temperature periods (morning or evening in summer, midday in winter). Avoid painting during extreme temperature changes or high humidity.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}

