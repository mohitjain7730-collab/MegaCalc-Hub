'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  bodyWeight: z.number().positive('Enter body weight'),
  unit: z.enum(['metric', 'imperial']),
  contactArea: z.number().min(5).max(500),
  weightDistribution: z.number().min(10).max(100),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  targetArea: z.enum(['calves', 'hamstrings', 'quads', 'glutes', 'back', 'shoulders', 'other']),
  painTolerance: z.enum(['low', 'medium', 'high']),
  sessionGoal: z.enum(['warmup', 'recovery', 'therapy', 'maintenance']),
});

type FormValues = z.infer<typeof formSchema>;

const calculatePressure = (values: FormValues) => {
  // Convert weight to kg if needed
  let weightKg = values.bodyWeight;
  if (values.unit === 'imperial') {
    weightKg = values.bodyWeight * 0.453592;
  }

  // Calculate force in Newtons
  const forceN = weightKg * 9.80665 * (values.weightDistribution / 100);
  
  // Convert contact area to m²
  const areaM2 = values.contactArea / 10000;
  
  // Calculate pressure in Pa, then convert to kPa
  const pressurePa = forceN / areaM2;
  const pressureKpa = pressurePa / 1000;

  return {
    pressureKpa: Math.round(pressureKpa * 10) / 10,
    forceN: Math.round(forceN * 10) / 10,
    weightKg,
    areaM2: Math.round(areaM2 * 10000) / 10000
  };
};

const getPressureStatus = (pressureKpa: number, values: FormValues) => {
  let status = 'light';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  let statusText = 'Light Pressure';
  let description = 'Gentle pressure suitable for warm-up and beginners';

  if (pressureKpa > 60) {
    status = 'very_high';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = AlertTriangle;
    statusText = 'Very High Pressure';
    description = 'Extreme pressure - use with caution and limit duration';
  } else if (pressureKpa > 40) {
    status = 'high';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'High Pressure';
    description = 'Intense pressure for advanced users and trigger point work';
  } else if (pressureKpa > 25) {
    status = 'moderate';
    statusColor = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    icon = Info;
    statusText = 'Moderate Pressure';
    description = 'Good pressure for most foam rolling applications';
  } else if (pressureKpa > 15) {
    status = 'light';
    statusColor = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = CheckCircle;
    statusText = 'Light Pressure';
    description = 'Gentle pressure suitable for warm-up and beginners';
  }

  return { status, statusColor, bgColor, borderColor, icon, statusText, description };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculatePressure>, values: FormValues) => {
  const interpretations = [];
  
  // Pressure level interpretation
  if (result.pressureKpa > 60) {
    interpretations.push('This is very high pressure that should only be used by experienced individuals');
    interpretations.push('Limit sessions to 30-60 seconds per area to avoid tissue damage');
    interpretations.push('Consider reducing weight distribution or increasing contact area');
  } else if (result.pressureKpa > 40) {
    interpretations.push('High pressure suitable for advanced foam rolling techniques');
    interpretations.push('Ideal for trigger point therapy and deep tissue work');
    interpretations.push('Use for 30-90 seconds per muscle group');
  } else if (result.pressureKpa > 25) {
    interpretations.push('Moderate pressure that works well for most foam rolling applications');
    interpretations.push('Good balance between effectiveness and comfort');
    interpretations.push('Suitable for 1-2 minutes per muscle group');
  } else {
    interpretations.push('Light pressure perfect for warm-up and recovery sessions');
    interpretations.push('Gentle enough for daily use and beginners');
    interpretations.push('Ideal for 2-3 minutes per muscle group');
  }

  // Experience-based insights
  if (values.experience === 'beginner' && result.pressureKpa > 30) {
    interpretations.push('As a beginner, consider starting with lighter pressure and gradually increasing');
    interpretations.push('Focus on proper technique rather than maximum pressure');
  } else if (values.experience === 'advanced' && result.pressureKpa < 20) {
    interpretations.push('As an advanced user, you may benefit from higher pressure for better results');
    interpretations.push('Consider increasing weight distribution or using a firmer roller');
  }

  // Target area specific advice
  const areaAdvice = {
    calves: 'Calves can handle higher pressure due to dense muscle tissue',
    hamstrings: 'Hamstrings respond well to moderate pressure with slow movements',
    quads: 'Quads are large muscles that can tolerate higher pressure',
    glutes: 'Glutes require careful pressure application due to sciatic nerve proximity',
    back: 'Back muscles need gentle pressure to avoid spinal issues',
    shoulders: 'Shoulders require light pressure due to joint complexity'
  };

  if (areaAdvice[values.targetArea]) {
    interpretations.push(areaAdvice[values.targetArea]);
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculatePressure>, values: FormValues) => {
  const recommendations = [];
  
  // Pressure-specific recommendations
  if (result.pressureKpa > 60) {
    recommendations.push('Limit high-pressure sessions to 30-60 seconds per area');
    recommendations.push('Use only 2-3 times per week to allow tissue recovery');
    recommendations.push('Stop immediately if you feel sharp pain or numbness');
    recommendations.push('Consider using a softer roller or reducing weight distribution');
  } else if (result.pressureKpa > 40) {
    recommendations.push('Use for 30-90 seconds per muscle group');
    recommendations.push('Focus on slow, controlled movements');
    recommendations.push('Breathe deeply and avoid tensing against the pressure');
    recommendations.push('Perfect for trigger point therapy and deep tissue work');
  } else if (result.pressureKpa > 25) {
    recommendations.push('Ideal for 1-2 minutes per muscle group');
    recommendations.push('Use slow, sweeping motions across the muscle');
    recommendations.push('Great for post-workout recovery and maintenance');
    recommendations.push('Can be used 3-4 times per week');
  } else {
    recommendations.push('Perfect for daily use and warm-up routines');
    recommendations.push('Use for 2-3 minutes per muscle group');
    recommendations.push('Great for beginners and gentle recovery');
    recommendations.push('Can be used daily without risk of overuse');
  }

  // Session goal recommendations
  if (values.sessionGoal === 'warmup') {
    recommendations.push('Use light to moderate pressure for 30-60 seconds per area');
    recommendations.push('Focus on dynamic movements to prepare muscles for activity');
    recommendations.push('Avoid high pressure that might fatigue muscles before exercise');
  } else if (values.sessionGoal === 'recovery') {
    recommendations.push('Use moderate pressure for 1-2 minutes per muscle group');
    recommendations.push('Focus on areas that feel tight or sore');
    recommendations.push('Combine with gentle stretching for best results');
  } else if (values.sessionGoal === 'therapy') {
    recommendations.push('Use higher pressure for 30-90 seconds on specific trigger points');
    recommendations.push('Work slowly and methodically through problem areas');
    recommendations.push('Consider professional guidance for chronic issues');
  } else if (values.sessionGoal === 'maintenance') {
    recommendations.push('Use moderate pressure for 1-2 minutes per muscle group');
    recommendations.push('Focus on full-body coverage 2-3 times per week');
    recommendations.push('Maintain consistent routine for best long-term results');
  }

  // Pain tolerance recommendations
  if (values.painTolerance === 'low') {
    recommendations.push('Start with lighter pressure and gradually increase');
    recommendations.push('Focus on breathing and relaxation during rolling');
    recommendations.push('Stop if you feel sharp pain or discomfort');
  } else if (values.painTolerance === 'high') {
    recommendations.push('You can handle higher pressure but still listen to your body');
    recommendations.push('Focus on technique and controlled movements');
    recommendations.push('Consider using firmer rollers for better results');
  }

  return recommendations;
};

const getSafetyGuidelines = (result: ReturnType<typeof calculatePressure>, values: FormValues) => {
  const guidelines = [];
  
  guidelines.push('Never roll directly over bones, joints, or the spine');
  guidelines.push('Avoid rolling over areas with bruises, cuts, or inflammation');
  guidelines.push('Stop immediately if you feel sharp pain, numbness, or tingling');
  guidelines.push('Breathe normally and avoid holding your breath');
  guidelines.push('Use slow, controlled movements rather than rapid rolling');
  
  if (result.pressureKpa > 40) {
    guidelines.push('High pressure requires extra caution - limit session duration');
    guidelines.push('Consider consulting a physical therapist for proper technique');
    guidelines.push('Allow 24-48 hours between high-pressure sessions');
  }
  
  if (values.targetArea === 'back') {
    guidelines.push('For back rolling, focus on the muscles, not the spine');
    guidelines.push('Use a softer roller and lighter pressure for the back');
    guidelines.push('Consider professional guidance for back issues');
  }
  
  if (values.targetArea === 'glutes') {
    guidelines.push('Be cautious around the sciatic nerve area');
    guidelines.push('Use lighter pressure and shorter sessions for glutes');
    guidelines.push('Stop if you feel any nerve-related symptoms');
  }

  return guidelines;
};

const getRollerRecommendations = (result: ReturnType<typeof calculatePressure>, values: FormValues) => {
  const recommendations = [];
  
  if (result.pressureKpa > 40) {
    recommendations.push('High-density foam roller for maximum pressure');
    recommendations.push('Textured roller for deeper tissue penetration');
    recommendations.push('Consider a vibrating foam roller for enhanced effects');
  } else if (result.pressureKpa > 25) {
    recommendations.push('Medium-density foam roller for balanced pressure');
    recommendations.push('Standard smooth roller works well');
    recommendations.push('Consider a slightly firmer roller for better results');
  } else {
    recommendations.push('Soft to medium-density foam roller');
    recommendations.push('Smooth roller is perfect for gentle pressure');
    recommendations.push('Consider a softer roller for comfort');
  }
  
  // Target area specific roller recommendations
  if (values.targetArea === 'calves' || values.targetArea === 'hamstrings') {
    recommendations.push('Long roller (36 inches) for full leg coverage');
    recommendations.push('Consider a half-round roller for stability');
  }
  
  if (values.targetArea === 'back') {
    recommendations.push('Softer roller for back safety');
    recommendations.push('Consider a contoured roller for spine support');
  }
  
  if (values.targetArea === 'shoulders') {
    recommendations.push('Smaller roller or massage ball for targeted work');
    recommendations.push('Consider a lacrosse ball for precise pressure');
  }

  return recommendations;
};

export default function FoamRollingPressureEstimator() {
  const [result, setResult] = useState<ReturnType<typeof calculatePressure> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bodyWeight: undefined,
      unit: 'metric',
      contactArea: undefined,
      weightDistribution: undefined,
      experience: undefined,
      targetArea: undefined,
      painTolerance: undefined,
      sessionGoal: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculatePressure(values);
    setResult(calculation);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Unit System</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit system" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg)</SelectItem>
                    <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contactArea" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Area (cm²)</FormLabel>
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
                <p className="text-sm text-muted-foreground">Area of roller in contact with your body</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="weightDistribution" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight on Roller (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="1" 
                    placeholder="e.g., 40"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Percentage of body weight on the roller</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="experience" render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="targetArea" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Area</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="calves">Calves</SelectItem>
                    <SelectItem value="hamstrings">Hamstrings</SelectItem>
                    <SelectItem value="quads">Quadriceps</SelectItem>
                    <SelectItem value="glutes">Glutes</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                    <SelectItem value="shoulders">Shoulders</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="painTolerance" render={({ field }) => (
              <FormItem>
                <FormLabel>Pain Tolerance</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pain tolerance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="sessionGoal" render={({ field }) => (
              <FormItem>
                <FormLabel>Session Goal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session goal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="warmup">Warm-up</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Calculate Foam Rolling Pressure
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Foam Rolling Pressure Analysis
            </CardTitle>
            <CardDescription>
              Your personalized foam rolling pressure assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${getPressureStatus(result.pressureKpa, form.getValues()).bgColor} ${getPressureStatus(result.pressureKpa, form.getValues()).borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">{result.pressureKpa} kPa</p>
                  <p className={`text-lg font-semibold ${getPressureStatus(result.pressureKpa, form.getValues()).statusColor}`}>
                    {getPressureStatus(result.pressureKpa, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPressureStatus(result.pressureKpa, form.getValues()).description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Applied Force</p>
                    <p className="font-semibold">{result.forceN} N</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact Area</p>
                    <p className="font-semibold">{result.contactArea} cm²</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight Distribution</p>
                    <p className="font-semibold">{form.getValues().weightDistribution}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{interpretation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Personalized Recommendations</h3>
              <ul className="space-y-2">
                {getPersonalizedRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Safety Guidelines</h3>
              <ul className="space-y-2">
                {getSafetyGuidelines(result, form.getValues()).map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Roller Recommendations</h3>
              <ul className="space-y-2">
                {getRollerRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

<<<<<<< HEAD
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Body Weight</h4>
                <p>Your body weight determines the maximum force that can be applied through the roller.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Contact Area</h4>
                <p>The surface area of the roller in contact with your body. Smaller areas create higher pressure.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Weight Distribution</h4>
                <p>The percentage of your body weight actually applied to the roller. This varies based on position and technique.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Target Area</h4>
                <p>Different muscle groups have different density and can handle varying pressure levels.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pressure-levels">
          <AccordionTrigger>Understanding Pressure Levels</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Light Pressure (15-25 kPa)</h4>
                <p>Gentle pressure suitable for warm-up, beginners, and daily maintenance. Safe for extended use.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Moderate Pressure (25-40 kPa)</h4>
                <p>Good pressure for most foam rolling applications. Effective for recovery and maintenance.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">High Pressure (40-60 kPa)</h4>
                <p>Intense pressure for advanced users and trigger point therapy. Limit duration and frequency.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Very High Pressure (60+ kPa)</h4>
                <p>Extreme pressure requiring caution. Use only for short durations and with proper technique.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="technique-tips">
          <AccordionTrigger>Foam Rolling Technique Tips</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Start Slow:</strong> Begin with gentle pressure and gradually increase</li>
                <li><strong>Breathe Deeply:</strong> Maintain steady breathing throughout the session</li>
                <li><strong>Move Slowly:</strong> Use slow, controlled movements rather than rapid rolling</li>
                <li><strong>Listen to Your Body:</strong> Stop if you feel sharp pain or discomfort</li>
                <li><strong>Focus on Problem Areas:</strong> Spend more time on tight or sore muscles</li>
                <li><strong>Maintain Good Posture:</strong> Keep your core engaged and spine neutral</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="related-tools">
          <AccordionTrigger>Related Tools</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p><Link href="/category/health-fitness/muscle-soreness-recovery-estimator" className="text-primary underline">Muscle Soreness Recovery Estimator</Link></p>
              <p><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary underline">Training Stress Score Calculator</Link></p>
              <p><Link href="/category/health-fitness/ice-bath-duration-temp-calculator" className="text-primary underline">Ice Bath Duration Calculator</Link></p>
              <p><Link href="/category/health-fitness/doms-recovery-time-calculator" className="text-primary underline">DOMS Recovery Time Calculator</Link></p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EmbedWidget calculatorSlug="foam-rolling-pressure-estimator" calculatorName="Foam Rolling Pressure Estimator" />
=======
<section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (E-E-A-T FOCUS) */}
    <meta itemProp="name" content="Foam Rolling Pressure Estimator & Pain Guide" />
    <meta itemProp="description" content="Calculate the optimal pressure for foam rolling (Self-Myofascial Release) using the 10-point pain scale. Find your 'comfortably uncomfortable' zone for glutes, IT band, and quads." />
    <meta itemProp="keywords" content="foam rolling pressure estimator, optimal foam rolling pressure, SMR pressure scale, comfortably uncomfortable foam rolling, self-myofascial release guide, how much pressure for foam roller" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/foam-rolling-pressure-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Foam Rolling Pressure Estimator: Find Your Optimal SMR Intensity</h1>
    
    <p className="text-lg italic text-primary">Stop guessing! Use this guide to ensure your **Self-Myofascial Release (SMR)** technique is effective for trigger point relief and muscle recovery, without causing tissue damage.</p>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#smr" className="hover:underline">What is SMR and Why Does Pressure Matter?</a></li>
        <li><a href="#scale" className="hover:underline">The 10-Point Foam Rolling Pain Scale</a></li>
        <li><a href="#optimal-zone" className="hover:underline">Finding the 'Comfortably Uncomfortable' Zone</a></li>
        <li><a href="#techniques" className="hover:underline">Pressure Adjustment Techniques for Each Muscle</a></li>
        <li><a href="#faq" className="hover:underline">Foam Rolling Pressure FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION */}
    <h2 id="smr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is SMR and Why Does Pressure Matter?</h2>
    <p>**Self-Myofascial Release (SMR)** is a self-massage technique, commonly done with a foam roller, designed to relieve muscle tightness and address **trigger points** (or "knots") in the fascia. The goal is to apply sustained, controlled pressure to encourage soft tissue relaxation and improve blood flow.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Controlled Pressure</h3>
    <p>Foam rolling pressure is a delicate balance. Too little pressure means you won't stimulate the Golgi tendon organs or reach the deeper fascial layers required for true release. Too much pressure can cause bruising, inflammation, and muscle guarding, where the muscle actually tightens further in self-defense, negating the entire effort.</p>

<hr />
    {/* SECTION 2: THE PAIN SCALE */}
    <h2 id="scale" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 10-Point Foam Rolling Pain Scale</h2>
    <p>Physical therapists often use a simplified pain scale to teach clients the right amount of pressure. When using the calculator, assess your pain level on this scale to find your working zone.</p>

    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scale Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pain Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Indication</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**0 - 3**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Mild Discomfort / Ticklish</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Increase Pressure.** Not deep enough for tissue change.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**4 - 7**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Comfortably Uncomfortable / Deep Ache</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Optimal Zone.** Sustained pressure encourages release.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**8 - 10**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Severe Pain / Sharp or Shooting</td>
                    <td className="px-6 py-4 whitespace-nowrap">**Reduce Pressure Immediately.** Risk of bruising and muscle guarding.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 3: OPTIMAL ZONE */}
    <h2 id="optimal-zone" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Finding the 'Comfortably Uncomfortable' Zone (Score 4-7)</h2>
    <p>Your target intensity zone is the **4 to 7 range**. This is the sweet spot where the mechanical pressure is intense enough to create a therapeutic effect without triggering your pain receptors to make the muscle tense up defensively.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tips for Staying in the Zone</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Use Breathing:** When you find a tender spot, hold the pressure for 20-30 seconds. Use slow, deep breaths (diaphragmatic breathing) to encourage the parasympathetic nervous system to take over and allow the muscle to release tension.</li>
        <li>**Control Speed:** Roll very slowly (about 1 inch per second). Fast rolling simply skims over the muscle and connective tissue, preventing the sustained compression needed for SMR.</li>
        <li>**Duration:** Spend a total of 1 to 2 minutes on each major muscle group. Prolonged rolling over 2 minutes can increase post-session soreness.</li>
    </ul>

<hr />
    {/* SECTION 4: ADJUSTMENT TECHNIQUES */}
    <h2 id="techniques" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pressure Adjustment Techniques for Each Muscle</h2>
    <p>You can adjust the pressure by manipulating how much of your body weight is supported by the floor or an unrolled limb, depending on the muscle being treated.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Muscle-Specific Pressure Control</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Glutes/Hips:** To reduce pressure, place both feet flat on the floor. To increase pressure for deeper relief, lift the non-rolling foot off the floor or cross the leg over the knee.</li>
        <li>**IT Band (Side of Thigh):** This is often highly sensitive. Start by placing the non-rolling leg on the floor in front of the roller for support (reducing the pressure by 50%). Gradually lift the foot as tolerated to increase intensity.</li>
        <li>**Calves/Hamstrings:** To reduce pressure, use your arms to support most of your body weight. To increase pressure, cross one leg over the other, doubling the weight applied to the targeted calf or hamstring.</li>
        <li>**Upper/Mid-Back (Thoracic Spine):** To reduce pressure, interlace your hands behind your head to support your neck and keep your glutes on the floor. To increase pressure, lift your hips off the floor. **Never roll the lower back (lumbar spine).**</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Foam Rolling Pressure FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Should I use a smooth or textured foam roller?</h3>
    <p>If you are a **beginner** or have high pain sensitivity, start with a **smooth, soft-density roller** for even, generalized pressure. **Textured (knobby)** or **high-density rollers** provide more intense, pinpointed pressure, which is best reserved for experienced users targeting deeper, chronic trigger points.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is sharp, shooting pain a good sign of a deep release?</h3>
    <p>**Absolutely not.** Sharp, shooting, or electric pain (Score 8-10) is a sign you are rolling directly over a **nerve or tendon/joint**. Stop immediately. This level of pain triggers muscle guarding and can cause serious bruising or trauma. Focus only on the soft, fleshy parts of the muscle belly.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How long should I hold sustained pressure on a knot?</h3>
    <p>Once you find a tender spot (a knot or trigger point in the 4-7 range), hold sustained pressure for **20 to 30 seconds**. Continue deep breathing until you feel the sensation decrease by about 1 to 2 points on the scale, signaling the tissue has begun to release. If the pain does not subside, move on and try again during your next session.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. Consult a physical therapist before starting SMR if you have a recent injury or chronic pain condition.</p>
    </div>
</section>
>>>>>>> 444c0fa8a15e845171b2cffaf5ebb713f0575ba5
    </div>
  );
}