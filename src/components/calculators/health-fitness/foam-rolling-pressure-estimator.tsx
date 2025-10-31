'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 
import { Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  bodyWeightKg: z.number().positive('Enter body weight').optional(),
  contactAreaCm2: z.number().min(5).max(500).optional(),
  weightDistributionPercent: z.number().min(10).max(100).optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  targetArea: z.enum(['calves', 'hamstrings', 'quads', 'glutes', 'back', 'shoulders', 'other']).optional(),
  painTolerance: z.enum(['low', 'medium', 'high']).optional(),
  sessionGoal: z.enum(['warmup', 'recovery', 'therapy', 'maintenance']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculatePressure = (values: FormValues) => {
  if (values.bodyWeightKg == null || values.contactAreaCm2 == null || values.weightDistributionPercent == null) return null;
  
  const forceN = values.bodyWeightKg * 9.80665 * (values.weightDistributionPercent / 100);
  const areaM2 = values.contactAreaCm2 / 10000;
  const pressurePa = forceN / areaM2;
  const pressureKpa = pressurePa / 1000;

  return {
    pressureKpa: Math.round(pressureKpa * 10) / 10,
    forceN: Math.round(forceN * 10) / 10,
    weightKg: values.bodyWeightKg,
    contactArea: values.contactAreaCm2,
    weightDistribution: values.weightDistributionPercent
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

  if (values.targetArea && areaAdvice[values.targetArea]) {
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
      bodyWeightKg: undefined,
      contactAreaCm2: undefined,
      weightDistributionPercent: undefined,
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

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyWeightKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 70"
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="contactAreaCm2" render={({ field }) => (
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
            
            <FormField control={form.control} name="weightDistributionPercent" render={({ field }) => (
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
                <FormLabel>Experience Level (Optional)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="targetArea" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Area (Optional)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select target area</option>
                    <option value="calves">Calves</option>
                    <option value="hamstrings">Hamstrings</option>
                    <option value="quads">Quadriceps</option>
                    <option value="glutes">Glutes</option>
                    <option value="back">Back</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="other">Other</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="painTolerance" render={({ field }) => (
              <FormItem>
                <FormLabel>Pain Tolerance (Optional)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select pain tolerance</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="sessionGoal" render={({ field }) => (
              <FormItem>
                <FormLabel>Session Goal (Optional)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select session goal</option>
                    <option value="warmup">Warm-up</option>
                    <option value="recovery">Recovery</option>
                    <option value="therapy">Therapy</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <Button type="submit" className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Estimate Pressure
          </Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Foam Rolling Pressure</CardTitle>
              </div>
              <CardDescription>Approximate applied pressure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-6 rounded-lg border ${getPressureStatus(result.pressureKpa, form.getValues()).bgColor} ${getPressureStatus(result.pressureKpa, form.getValues()).borderColor}`}>
                <div className="text-center space-y-2">
                  <p className="text-4xl font-bold">{result.pressureKpa} kPa</p>
                  <p className={`text-lg font-semibold ${getPressureStatus(result.pressureKpa, form.getValues()).statusColor}`}>
                    {getPressureStatus(result.pressureKpa, form.getValues()).statusText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPressureStatus(result.pressureKpa, form.getValues()).description}
                  </p>
                </div>
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
                  <p className="font-semibold">{result.weightDistribution}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Detailed Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{interpretation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getPersonalizedRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Safety Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getSafetyGuidelines(result, form.getValues()).map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{guideline}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Roller Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {getRollerRecommendations(result, form.getValues()).map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Related Calculators</CardTitle>
          <CardDescription>Complement your recovery routine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/doms-recovery-time-calculator" className="text-primary hover:underline">DOMS Recovery Time</Link></h4><p className="text-sm text-muted-foreground">Estimate recovery hours after hard sessions.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rate</Link></h4><p className="text-sm text-muted-foreground">Monitor autonomic recovery trends.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide to Foam Rolling</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>About pressure, safety, and technique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How much should it hurt?', 'Aim for tolerable discomfort (≤3/10). Sharp pain is a stop signal.'],
            ['How long per area?', '30–120 seconds depending on pressure and tolerance.'],
            ['Roll fast or slow?', 'Slow, controlled movements are more effective and safer.'],
            ['Can I roll daily?', 'Light pressure can be daily; high pressure 2–3×/week.'],
            ['Which areas to avoid?', 'Bones, joints, and the lumbar spine—focus on muscles around them.'],
            ['Better before or after training?', 'Light rolling before, moderate after or on rest days.'],
            ['Should I hold on tender spots?', 'Yes, brief holds (20–30 s) can help trigger points—avoid numbness.'],
            ['What tool density?', 'Beginners: soft/medium. Advanced: high‑density or textured as needed.'],
            ['Signs to stop?', 'Numbness, tingling, or sharp pain—stop immediately.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>

      <EmbedWidget calculatorSlug="foam-rolling-pressure-estimator" calculatorName="Foam Rolling Pressure Estimator" />
    </div>
  );
}