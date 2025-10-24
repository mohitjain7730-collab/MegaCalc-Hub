'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock, Activity, Target, Info, AlertCircle, TrendingUp, Users, Heart, Dumbbell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  sessionIntensity1to10: z.number().min(1).max(10).optional(),
  eccentricFocusPercent: z.number().min(0).max(100).optional(),
  setsPerMuscle: z.number().min(1).max(40).optional(),
  trainingStatus: z.enum(['novice','intermediate','advanced']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DOMSRecoveryTimeCalculator() {
  const [result, setResult] = useState<{ 
    recoveryHours: number; 
    interpretation: string; 
    opinion: string;
    recoveryPhase: string;
    severityLevel: string;
    recommendations: string[];
    warningSigns: string[];
  } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sessionIntensity1to10: undefined, eccentricFocusPercent: undefined, setsPerMuscle: undefined, trainingStatus: undefined } });

  const calculate = (v: FormValues) => {
    if (v.sessionIntensity1to10 == null || v.eccentricFocusPercent == null || v.setsPerMuscle == null || v.trainingStatus == null) return null;
    let base = 24 + (v.sessionIntensity1to10 - 5) * 6 + (v.setsPerMuscle - 10) * 1.5 + (v.eccentricFocusPercent/100) * 24;
    const statusFactor = v.trainingStatus === 'novice' ? 1.2 : v.trainingStatus === 'advanced' ? 0.85 : 1.0;
    const hours = Math.max(12, base * statusFactor);
    return Math.round(hours);
  };

  const interpret = (h: number) => {
    if (h > 72) return 'High recovery need—DOMS likely to persist for several days.';
    if (h >= 36) return 'Moderate recovery need—expect DOMS for 1–2 days.';
    return 'Light recovery need—minor soreness expected.';
  };

  const getRecoveryPhase = (h: number) => {
    if (h > 72) return 'Extended Recovery Phase';
    if (h >= 36) return 'Peak DOMS Phase';
    return 'Mild Recovery Phase';
  };

  const getSeverityLevel = (h: number) => {
    if (h > 72) return 'High';
    if (h >= 36) return 'Moderate';
    return 'Low';
  };

  const getRecommendations = (h: number, trainingStatus: string) => {
    const recommendations = [];
    
    if (h > 72) {
      recommendations.push('Complete rest for 2-3 days');
      recommendations.push('Focus on sleep (8-9 hours)');
      recommendations.push('Gentle massage or foam rolling');
      recommendations.push('Anti-inflammatory foods (turmeric, ginger)');
      recommendations.push('Consider deload week');
    } else if (h >= 36) {
      recommendations.push('Active recovery (light walking, swimming)');
      recommendations.push('Protein-rich meals (1.6-2.2g per kg bodyweight)');
      recommendations.push('Gentle stretching and mobility work');
      recommendations.push('Hydration (3-4 liters daily)');
    } else {
      recommendations.push('Light training can resume');
      recommendations.push('Maintain normal hydration');
      recommendations.push('Focus on sleep quality');
    }

    if (trainingStatus === 'novice') {
      recommendations.push('Start with lighter weights next session');
      recommendations.push('Focus on proper form over intensity');
    }

    return recommendations;
  };

  const getWarningSigns = (h: number) => {
    const signs = [];
    
    if (h > 72) {
      signs.push('Severe pain lasting more than 5 days');
      signs.push('Dark or brown urine (rhabdomyolysis)');
      signs.push('Extreme swelling or heat in affected area');
      signs.push('Sharp, stabbing pain during movement');
    } else {
      signs.push('Pain that worsens instead of improving');
      signs.push('Significant swelling or bruising');
      signs.push('Pain that prevents normal daily activities');
    }

    return signs;
  };

  const opinion = (h: number) => {
    if (h > 72) return 'Use deloads, massage, sleep 8–9h, and nutrition to aid recovery.';
    if (h >= 36) return 'Active recovery, gentle mobility, and protein + carbs will help.';
    return 'You can resume training sooner; still prioritize hydration and sleep.';
  };

  const onSubmit = (values: FormValues) => {
    const hours = calculate(values);
    if (hours == null) { setResult(null); return; }
    setResult({ 
      recoveryHours: hours, 
      interpretation: interpret(hours), 
      opinion: opinion(hours),
      recoveryPhase: getRecoveryPhase(hours),
      severityLevel: getSeverityLevel(hours),
      recommendations: getRecommendations(hours, values.trainingStatus || 'intermediate'),
      warningSigns: getWarningSigns(hours)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Workout Parameters
          </CardTitle>
          <CardDescription>
            Enter your workout details to get a personalized DOMS recovery estimate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="sessionIntensity1to10" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Session Intensity (1-10)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 7" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Rate your workout intensity from 1 (very light) to 10 (maximum effort). Higher intensity workouts typically cause more muscle damage and longer recovery times.
                      </p>
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="eccentricFocusPercent" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Eccentric Focus (%)
                      </FormLabel>
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
                      <p className="text-sm text-muted-foreground">
                        Percentage of your workout focused on eccentric (lengthening) movements. Eccentric exercises cause significantly more muscle damage and DOMS.
                      </p>
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="setsPerMuscle" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Sets per Muscle Group
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 14" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Total number of sets performed for the specific muscle group. More sets generally lead to greater muscle damage and longer recovery.
                      </p>
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="trainingStatus" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Training Experience Level
                      </FormLabel>
                      <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as any)}
                        >
                          <option value="">Select experience level</option>
                          <option value="novice">Novice (0-6 months)</option>
                          <option value="intermediate">Intermediate (6 months - 2 years)</option>
                          <option value="advanced">Advanced (2+ years)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Your training experience affects recovery capacity. Beginners typically need longer recovery times, while advanced trainees adapt faster.
                      </p>
                    </FormItem>
                  )} 
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate My Recovery Time
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
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your DOMS Recovery Estimate</CardTitle>
                  <CardDescription>Personalized recovery timeline and recommendations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Recovery Time</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.recoveryHours} hours
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recoveryPhase}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Severity Level</span>
                  </div>
                  <p className="text-2xl font-bold">
                    <Badge variant={result.severityLevel === 'High' ? 'destructive' : result.severityLevel === 'Moderate' ? 'default' : 'secondary'}>
                      {result.severityLevel}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recovery Status</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.recoveryHours > 72 ? 'Extended Rest Needed' : 
                     result.recoveryHours >= 36 ? 'Moderate Recovery' : 'Quick Recovery'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
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
                        <Target className="h-5 w-5" />
                        Recovery Recommendations
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
                        Warning Signs to Watch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.warningSigns.map((sign, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{sign}</span>
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
              <h4 className="font-semibold text-foreground mb-2">Session Intensity (1-10)</h4>
              <p className="text-muted-foreground">
                This measures how hard you worked during your training session. Higher intensity workouts cause more muscle fiber damage, leading to longer recovery times. Rate based on perceived exertion, heart rate, or how close you were to failure.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Eccentric Focus Percentage</h4>
              <p className="text-muted-foreground">
                Eccentric (lengthening) movements cause significantly more muscle damage than concentric movements. Examples include the lowering phase of squats, deadlifts, or bicep curls. Higher eccentric focus means longer recovery times.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Sets per Muscle Group</h4>
              <p className="text-muted-foreground">
                Total training volume for the specific muscle group. More sets generally lead to greater muscle damage and longer recovery. Consider both direct and indirect work (compound movements that hit multiple muscle groups).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Training Experience Level</h4>
              <p className="text-muted-foreground">
                Your training experience significantly affects recovery capacity. Beginners typically experience more severe DOMS and need longer recovery, while advanced trainees have better adaptation mechanisms and recover faster.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other fitness and health calculators to optimize your training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/muscle-soreness-recovery-estimator" className="text-primary hover:underline">
                    Muscle Soreness Recovery Estimator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get a more detailed recovery estimate based on age, fitness level, and exercise type.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/resting-heart-rate-calculator" className="text-primary hover:underline">
                    Resting Heart Rate Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your cardiovascular fitness and recovery capacity with heart rate analysis.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal protein intake to support muscle recovery and growth.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/sleep-quality-calculator" className="text-primary hover:underline">
                    Sleep Quality Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Assess your sleep patterns and their impact on recovery and performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section - Keep existing content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Complete Guide to DOMS Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-4">What is DOMS? Peak Soreness Timeframe (12-72 Hours)</h3>
            <p><strong>DOMS (Delayed Onset Muscle Soreness)</strong> is the pain, stiffness, and tenderness you feel in your muscles after unaccustomed or intense exercise. This feeling is not due to lactic acid (a common myth), but rather the body's inflammatory response to <strong>micro-trauma</strong> in the muscle fibers caused by mechanical stress.</p>

            <h4 className="text-lg font-semibold mt-6 mb-2">The DOMS Timeline</h4>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Onset:</strong> Soreness typically begins 12 to 24 hours post-exercise.</li>
              <li><strong>Peak:</strong> Pain usually <strong>peaks between 24 and 72 hours</strong> (1 to 3 days).</li>
              <li><strong>Resolution:</strong> For a healthy individual, DOMS symptoms should completely resolve within <strong>4 to 6 days</strong>.</li>
            </ul>
            <p>The calculator refines this 48-hour peak based on the factors you input to give you a personalized estimate.</p>

            <h4 className="text-lg font-semibold mt-6 mb-2">Training & Lifestyle Factors that Control Recovery Time</h4>
            <p>Your recovery time is highly personalized. The calculator adjusts the baseline 48-hour recovery window based on how much damage you created and how well your body can repair it:</p>

            <h5 className="font-semibold mt-4 mb-2">Exercise-Induced Factors (Damage)</h5>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Eccentric Focus:</strong> Exercises where the muscle lengthens under load (e.g., Romanian deadlifts, running downhill, slow negatives) cause significantly more damage and extend recovery time.</li>
              <li><strong>Unaccustomed Activity:</strong> Any new exercise, sudden increase in volume, or high intensity (training to failure) will drastically increase DOMS severity and duration.</li>
              <li><strong>Muscle Group Size:</strong> Large muscle groups (quads, back, chest) require more resources and time to repair than smaller groups (biceps, triceps).</li>
            </ul>

            <h5 className="font-semibold mt-4 mb-2">Physiological Factors (Repair)</h5>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Sleep Quality:</strong> <strong>The single most critical factor.</strong> Lack of sleep blunts the release of Growth Hormone and impairs cellular repair, drastically prolonging DOMS.</li>
              <li><strong>Protein Intake:</strong> Insufficient protein consumption slows the muscle protein synthesis (MPS) process required to rebuild damaged fibers.</li>
              <li><strong>Age:</strong> Physiological aging naturally slows the efficiency of repair mechanisms, often adding hours to the recovery needed for the same training stress.</li>
            </ul>

            <h4 className="text-lg font-semibold mt-6 mb-2">The 5 Scientifically Proven DOMS Recovery Strategies</h4>
            <p>While only time heals the micro-tears, you can actively reduce pain and accelerate the repair process.</p>

            <ol className="list-decimal ml-6 space-y-3">
              <li className="font-semibold">
                Active Recovery:
                <p className="font-normal text-muted-foreground ml-4">Engage in <strong>very light, low-impact activity</strong> (walking, gentle cycling, swimming). This increases blood flow to the sore muscles, which helps flush metabolic waste and deliver oxygen and nutrients for repair.</p>
              </li>
              <li className="font-semibold">
                Massage/SMR:
                <p className="font-normal text-muted-foreground ml-4">Manual massage or <strong>Foam Rolling</strong> (Self-Myofascial Release) can reduce pain perception and stiffness by improving blood flow and stimulating local mechanoreceptors. Perform gently, avoiding sharp pain.</p>
              </li>
              <li className="font-semibold">
                Nutrient Timing:
                <p className="font-normal text-muted-foreground ml-4">Consume a post-workout meal with adequate <strong>Protein</strong> (20-40g) and <strong>Carbohydrates</strong> to initiate muscle repair (MPS) and replenish glycogen stores.</p>
              </li>
              <li className="font-semibold">
                Cold Water Immersion (CWI):
                <p className="font-normal text-muted-foreground ml-4">An <strong>Ice Bath</strong> (for 5-10 minutes at 10°C–15°C or 50°F–59°F) can acutely reduce inflammation and pain perception. <em>Use with caution, as it may interfere with long-term muscle adaptation.</em></p>
              </li>
              <li className="font-semibold">
                Heat Therapy:
                <p className="font-normal text-muted-foreground ml-4">Applying local <strong>heat packs</strong> or taking a warm bath can help reduce stiffness by increasing tissue flexibility and enhancing localized blood circulation.</p>
              </li>
            </ol>

            <h4 className="text-lg font-semibold mt-6 mb-2">When to Worry: Differentiating DOMS from Injury</h4>
            <p>While DOMS is a sign of successful muscle adaptation, certain symptoms should prompt you to consult a physician or physical therapist:</p>

            <h5 className="font-semibold mt-4 mb-2">Signs it's NOT Just DOMS</h5>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Sharp Pain:</strong> DOMS is a dull ache, not a sharp or stabbing pain that occurs during movement.</li>
              <li><strong>Pain Persistence:</strong> If the pain lasts <strong>longer than 6 days</strong> and shows no sign of improvement, it suggests a more serious injury or severe overtraining.</li>
              <li><strong>Extreme Swelling:</strong> Significant, localized swelling that is hot to the touch.</li>
              <li><strong>Dark Urine:</strong> This is a rare but critical sign of <strong>Rhabdomyolysis</strong> (severe muscle breakdown) and requires immediate medical attention.</li>
            </ul>
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
              Common questions about DOMS recovery and muscle soreness
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does DOMS typically last?</h4>
              <p className="text-muted-foreground">
                DOMS usually begins 12-24 hours after exercise, peaks at 24-72 hours, and resolves within 4-6 days. The exact duration depends on workout intensity, training experience, and individual recovery capacity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I work out a muscle group if it has DOMS?</h4>
              <p className="text-muted-foreground">
                Yes, but lightly. Performing low-intensity, active recovery workouts (light cardio, gentle stretching) can actually help. However, avoid intense training of the affected muscle group until peak soreness (24-72 hours) has passed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does stretching help prevent DOMS?</h4>
              <p className="text-muted-foreground">
                No conclusive evidence shows that static stretching prevents DOMS. Dynamic stretching during warm-up is beneficial, but the best way to reduce DOMS severity is gradual, progressive training to let your body adapt over time.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is feeling sore necessary for muscle growth?</h4>
              <p className="text-muted-foreground">
                No. While soreness indicates muscle damage (one pathway to growth), it's not required. As you adapt to a routine, you may stop feeling sore but still make excellent gains. Progressive overload is the key indicator of muscle growth, not pain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between DOMS and muscle injury?</h4>
              <p className="text-muted-foreground">
                DOMS is a dull ache that appears 12-72 hours after exercise and improves with movement. Muscle injuries cause sharp, immediate pain that worsens with activity and may include swelling, bruising, or loss of function.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I speed up DOMS recovery?</h4>
              <p className="text-muted-foreground">
                Focus on sleep (8-9 hours), proper nutrition (adequate protein and carbs), active recovery (light movement), massage/foam rolling, and hydration. Cold water immersion and heat therapy can also provide temporary relief.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why do I get more DOMS as a beginner?</h4>
              <p className="text-muted-foreground">
                Beginners experience more severe DOMS because their muscles aren't adapted to the training stimulus. As you become more experienced, your body adapts faster and DOMS severity typically decreases, even with intense training.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can supplements help with DOMS recovery?</h4>
              <p className="text-muted-foreground">
                Some supplements may help: protein for muscle repair, omega-3s for inflammation, tart cherry juice for antioxidants, and magnesium for muscle relaxation. However, proper nutrition, sleep, and training progression are more important than supplements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I avoid training if I have severe DOMS?</h4>
              <p className="text-muted-foreground">
                If DOMS is severe (pain rating 7-10/10), avoid training the affected muscle group. Focus on other muscle groups, active recovery, or complete rest. Listen to your body and don't push through severe pain, as this can lead to injury.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I prevent DOMS in the future?</h4>
              <p className="text-muted-foreground">
                Gradually increase training intensity and volume, maintain consistent training, ensure adequate sleep and nutrition, include proper warm-ups and cool-downs, and avoid sudden changes in your training routine.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


