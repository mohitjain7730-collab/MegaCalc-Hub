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
import { RotateCcw, Activity, TrendingUp, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  joint: z.enum(['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'spine', 'neck']),
  initialROM: z.number().positive('Initial ROM must be positive'),
  currentROM: z.number().positive('Current ROM must be positive'),
  targetROM: z.number().positive('Target ROM must be positive'),
  timePeriod: z.number().positive('Time period must be positive'),
  injuryType: z.enum(['acute', 'chronic', 'post_surgical', 'overuse', 'none']),
  therapySessions: z.number().min(0, 'Therapy sessions cannot be negative'),
});

type FormValues = z.infer<typeof formSchema>;

const getJointInfo = (joint: string) => {
  const jointData = {
    shoulder: { name: 'Shoulder', normalROM: 180, unit: 'degrees' },
    elbow: { name: 'Elbow', normalROM: 150, unit: 'degrees' },
    wrist: { name: 'Wrist', normalROM: 80, unit: 'degrees' },
    hip: { name: 'Hip', normalROM: 120, unit: 'degrees' },
    knee: { name: 'Knee', normalROM: 135, unit: 'degrees' },
    ankle: { name: 'Ankle', normalROM: 50, unit: 'degrees' },
    spine: { name: 'Spine', normalROM: 60, unit: 'degrees' },
    neck: { name: 'Neck', normalROM: 45, unit: 'degrees' },
  };
  return jointData[joint as keyof typeof jointData];
};

const getProgressInterpretation = (progressPercentage: number, timePeriod: number, injuryType: string) => {
  const weeklyProgress = progressPercentage / (timePeriod / 7);
  
  if (weeklyProgress > 5) {
    return {
      category: 'Excellent Progress',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle,
      description: 'Outstanding progress! You are recovering faster than expected. Keep up the excellent work.',
      recommendations: [
        'Continue current rehabilitation program',
        'Gradually increase exercise intensity',
        'Monitor for any signs of overexertion',
        'Consider advancing to more challenging exercises'
      ]
    };
  } else if (weeklyProgress > 2) {
    return {
      category: 'Good Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: TrendingUp,
      description: 'Good progress! You are on track with your rehabilitation goals.',
      recommendations: [
        'Maintain consistent therapy sessions',
        'Follow prescribed home exercise program',
        'Track progress weekly',
        'Communicate any concerns with your therapist'
      ]
    };
  } else if (weeklyProgress > 0) {
    return {
      category: 'Slow Progress',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Activity,
      description: 'Progress is slower than expected. Consider adjusting your rehabilitation approach.',
      recommendations: [
        'Review and modify exercise program',
        'Increase therapy session frequency',
        'Address any pain or discomfort',
        'Consider additional treatment modalities'
      ]
    };
  } else {
    return {
      category: 'No Progress',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      description: 'No progress detected. Immediate attention and program modification needed.',
      recommendations: [
        'Consult with healthcare provider immediately',
        'Reassess treatment plan',
        'Consider imaging or additional diagnostics',
        'Modify therapy approach significantly'
      ]
    };
  }
};

const calculateRecoveryTimeline = (currentROM: number, targetROM: number, weeklyProgress: number) => {
  if (weeklyProgress <= 0) return null;
  
  const remainingROM = targetROM - currentROM;
  const weeksToTarget = remainingROM / weeklyProgress;
  
  return {
    weeksToTarget: Math.ceil(weeksToTarget),
    monthsToTarget: Math.ceil(weeksToTarget / 4),
    progressRate: weeklyProgress
  };
};

export default function RangeOfMotionProgressCalculator() {
  const [result, setResult] = useState<{
    progressPercentage: number;
    weeklyProgress: number;
    interpretation: ReturnType<typeof getProgressInterpretation>;
    recoveryTimeline: ReturnType<typeof calculateRecoveryTimeline> | null;
    recommendations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      joint: 'shoulder',
      initialROM: 0,
      currentROM: 0,
      targetROM: 0,
      timePeriod: 0,
      injuryType: 'none',
      therapySessions: 0,
    },
  });

  const onSubmit = (data: FormValues) => {
    const progressPercentage = ((data.currentROM - data.initialROM) / (data.targetROM - data.initialROM)) * 100;
    const weeklyProgress = (data.currentROM - data.initialROM) / (data.timePeriod / 7);
    
    const interpretation = getProgressInterpretation(progressPercentage, data.timePeriod, data.injuryType);
    const recoveryTimeline = calculateRecoveryTimeline(data.currentROM, data.targetROM, weeklyProgress);
    
    setResult({
      progressPercentage,
      weeklyProgress,
      interpretation,
      recoveryTimeline,
      recommendations: interpretation.recommendations,
    });
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const selectedJoint = form.watch('joint');
  const jointInfo = getJointInfo(selectedJoint);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <RotateCcw className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Range of Motion Progress Calculator</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Track and calculate your range of motion improvement over time for rehabilitation monitoring
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ROM Progress Calculation
          </CardTitle>
          <CardDescription>
            Enter your range of motion measurements to track your rehabilitation progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="joint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joint</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select joint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="shoulder">Shoulder</SelectItem>
                          <SelectItem value="elbow">Elbow</SelectItem>
                          <SelectItem value="wrist">Wrist</SelectItem>
                          <SelectItem value="hip">Hip</SelectItem>
                          <SelectItem value="knee">Knee</SelectItem>
                          <SelectItem value="ankle">Ankle</SelectItem>
                          <SelectItem value="spine">Spine</SelectItem>
                          <SelectItem value="neck">Neck</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="injuryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Injury Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select injury type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Injury</SelectItem>
                          <SelectItem value="acute">Acute Injury</SelectItem>
                          <SelectItem value="chronic">Chronic Condition</SelectItem>
                          <SelectItem value="post_surgical">Post-Surgical</SelectItem>
                          <SelectItem value="overuse">Overuse Injury</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter initial ROM"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Enter current ROM"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetROM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target ROM ({jointInfo.unit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder={`Enter target ROM (normal: ${jointInfo.normalROM}${jointInfo.unit})`}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Period (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter time period in days"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="therapySessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Therapy Sessions</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter number of therapy sessions"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Calculate Progress
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card className={`${result.interpretation.bgColor} ${result.interpretation.borderColor} border-2`}>
            <CardHeader>
              <CardTitle className={`${result.interpretation.color} flex items-center gap-2`}>
                <result.interpretation.icon className="h-5 w-5" />
                {result.interpretation.category}
              </CardTitle>
              <CardDescription className="text-gray-700">
                {result.interpretation.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.progressPercentage.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Progress to Target</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.weeklyProgress.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Weekly Progress</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.recoveryTimeline ? `${result.recoveryTimeline.weeksToTarget}` : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Weeks to Target</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Recommendations:</h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {result.recoveryTimeline && (
            <Card>
              <CardHeader>
                <CardTitle>Recovery Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{result.recoveryTimeline.weeksToTarget}</div>
                      <div className="text-sm text-muted-foreground">Weeks to Target ROM</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{result.recoveryTimeline.monthsToTarget}</div>
                      <div className="text-sm text-muted-foreground">Months to Target ROM</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-lg font-semibold text-purple-600">{result.recoveryTimeline.progressRate.toFixed(1)} degrees/week</div>
                    <div className="text-sm text-muted-foreground">Current Progress Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding">
          <AccordionTrigger className="text-left">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Understanding Range of Motion Progress
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>For more detailed information on range of motion assessment and rehabilitation progress, consult these authoritative sources:</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3133579/" target="_blank" rel="noopener noreferrer" className="text-primary underline">National Center for Biotechnology Information – ROM Assessment</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section
        className="space-y-4 text-muted-foreground leading-relaxed"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="headline" content="Range of Motion Progress Calculator – Track Rehabilitation Recovery" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="How to track range of motion progress, interpret recovery rates, and optimize rehabilitation programs." />

        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Range of Motion Progress</h2>
        <p itemProp="description">Range of Motion (ROM) progress tracking is essential for monitoring rehabilitation success and adjusting treatment plans based on recovery rates.</p>

        <h3 className="font-semibold text-foreground mt-6">Normal ROM Ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Shoulder:</strong> 180° (flexion), 60° (extension)</li>
          <li><strong>Elbow:</strong> 150° (flexion), 0° (extension)</li>
          <li><strong>Wrist:</strong> 80° (flexion), 70° (extension)</li>
          <li><strong>Hip:</strong> 120° (flexion), 30° (extension)</li>
          <li><strong>Knee:</strong> 135° (flexion), 0° (extension)</li>
          <li><strong>Ankle:</strong> 20° (dorsiflexion), 50° (plantarflexion)</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Factors Affecting ROM Recovery</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Injury Type:</strong> Acute injuries often recover faster than chronic conditions</li>
          <li><strong>Age:</strong> Younger individuals typically recover ROM faster</li>
          <li><strong>Therapy Compliance:</strong> Consistent therapy sessions improve outcomes</li>
          <li><strong>Home Exercise:</strong> Regular home exercises accelerate recovery</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Progress Tracking Tips</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Measure Consistently:</strong> Use the same measurement technique each time</li>
          <li><strong>Track Weekly:</strong> Measure ROM at the same time each week</li>
          <li><strong>Document Pain:</strong> Note any pain or discomfort during movement</li>
          <li><strong>Adjust Goals:</strong> Modify targets based on progress and limitations</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/injury-recovery-timeline-calculator" className="text-primary underline">Injury Recovery Timeline Calculator</Link></p>
          <p><Link href="/category/health-fitness/physical-therapy-session-intensity-calculator" className="text-primary underline">Physical Therapy Session Intensity Calculator</Link></p>
          <p><Link href="/category/health-fitness/strength-to-weight-ratio-calculator" className="text-primary underline">Strength to Weight Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        </div>
      </section>
    </div>
  );
}