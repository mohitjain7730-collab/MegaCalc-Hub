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
import { Activity, Target, Zap, AlertCircle, Info, Calculator, CheckCircle2, TrendingUp, TrendingDown, Shield, Users, HelpCircle, BarChart3, Wind, Briefcase, AlertTriangle, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  gender: z.enum(['male', 'female']),
  weightCategory: z.enum(['lightweight', 'heavyweight']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  workoutType: z.enum(['technique', 'steady_state', 'time_trial', 'sprint_power']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RowingDragFactorCalculator() {
  const [result, setResult] = useState<{
    minDrag: number;
    maxDrag: number;
    optimalDrag: number;
    damperEstimate: string;
    interpretation: string;
    feelType: string;
    intensityLevel: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: undefined,
      weightCategory: undefined,
      experienceLevel: undefined,
      workoutType: undefined,
    },
  });

  const calculate = (values: FormValues) => {
    // Base Baseline derived from Australian Rowing & Concept2 standards
    // Mental model: 
    // Heavyweight Male (HWT M): 130
    // Lightweight Male (LWT M) / Heavyweight Female (HWT F): 120-125
    // Lightweight Female (LWT F): 110-115

    let baseDrag = 120;

    if (values.gender === 'male') {
      baseDrag = values.weightCategory === 'heavyweight' ? 130 : 125;
    } else {
      baseDrag = values.weightCategory === 'heavyweight' ? 120 : 110;
    }

    // Adjust for experience
    // Beginners often row slightly lower to prioritize technique over load
    if (values.experienceLevel === 'beginner') baseDrag -= 10;
    if (values.experienceLevel === 'elite') baseDrag += 5; // Elite often handle slightly heavier for training, though tests are standardized

    // Adjust for workout type
    // Technique: Lower drag to feel the catch speed
    // Power: Higher drag to simulate heavy boat/resistance
    if (values.workoutType === 'technique') baseDrag -= 15;
    if (values.workoutType === 'steady_state') baseDrag -= 5;
    if (values.workoutType === 'sprint_power') baseDrag += 15;

    // Time trials (2k) usually sit around the "Standard" base

    return {
      min: baseDrag - 5,
      target: baseDrag,
      max: baseDrag + 5
    };
  };

  const getDamperEstimate = (drag: number) => {
    // Very rough approximation for a clean machine
    // 110 ~ 3-4
    // 130 ~ 5-6
    // 150 ~ 7-8
    if (drag < 100) return '1 - 3';
    if (drag < 120) return '3 - 4';
    if (drag < 140) return '4 - 6';
    if (drag < 160) return '6 - 8';
    return '8 - 10';
  }

  const getInterpretation = (drag: number) => {
    if (drag < 100) return 'Very light resistance, emphasizing fast handle speed and connection speed.';
    if (drag < 120) return 'Light to standard resistance, similar to a swift racing shell on calm water.';
    if (drag < 140) return 'Standard training resistance, balancing aerobic load with muscular connection.';
    if (drag < 160) return 'Heavy resistance, simulating a slow boat or strong headwind. high muscular demand.';
    return 'Very heavy resistance, primarily for maximal strength/power drills only.';
  }

  const getFeelType = (drag: number) => {
    if (drag < 115) return 'Fast & Light';
    if (drag < 135) return 'Standard / Solid';
    if (drag < 155) return 'Heavy / Muddy';
    return 'Very Heavy';
  }

  const getIntensityLevel = (drag: number) => {
    if (drag < 110) return 'Technical Focus';
    if (drag < 145) return 'optimal Training Load';
    return 'High Force Output';
  }

  const getRecommendation = (drag: number) => {
    if (drag > 150) return 'Limit volume at this setting to avoid lumbar stress. Focus on driving with legs, not opening the back early.';
    if (drag < 100) return 'Ensure you are not "shooting the slide" (legs moving without handle). Engage the core at the catch.';
    return 'Maintain a consistent rhythm. Focus on acceleration through the drive phase.';
  }

  const getInsights = (drag: number, type: string) => {
    const insights = [];
    if (drag < 115) {
      insights.push('Forces sharper catch timing');
      insights.push('Reduces load on the lower back');
      insights.push('Excellent for high stroke rate work');
    } else if (drag < 140) {
      insights.push('Ideal biomechanical balance');
      insights.push('Replicates standard on-water feel best');
      insights.push('Standard for 2k/5k ergometer testing');
    } else {
      insights.push('Maximizes peak force production per stroke');
      insights.push('Simulates heavy headwinds or heavy boat');
      insights.push('Recruits fast-twitch fibers more aggressively');
    }

    if (type === 'technique') insights.push('Light drag exposes connection flaws immediately');
    if (type === 'sprint_power') insights.push('Higher drag prevents "spinning out" at high rates');

    return insights;
  };

  const getRisks = (drag: number) => {
    const risks = [];
    if (drag > 135) risks.push('Increased shearing force on lumbar spine');
    if (drag > 145) risks.push('High risk of rib stress fractures if volume is high');
    if (drag < 90) risks.push('Risk of over-compressing at the catch');
    risks.push('Inconsistent drag affects split accuracy');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const { min, target, max } = calculate(values);

    setResult({
      minDrag: min,
      maxDrag: max,
      optimalDrag: target,
      damperEstimate: getDamperEstimate(target),
      interpretation: getInterpretation(target),
      feelType: getFeelType(target),
      intensityLevel: getIntensityLevel(target),
      recommendation: getRecommendation(target),
      insights: getInsights(target, values.workoutType),
      risks: getRisks(target)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Rower Profile & Goals
          </CardTitle>
          <CardDescription>
            Enter your details to determine the scientifically optimal drag factor for your session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weightCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weight class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lightweight">Lightweight (M: ≤75kg, F: ≤61.5kg)</SelectItem>
                          <SelectItem value="heavyweight">Heavyweight / Open</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-6 months)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (Regular training)</SelectItem>
                          <SelectItem value="advanced">Advanced (Club/University)</SelectItem>
                          <SelectItem value="elite">Elite / National Level</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workoutType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workout type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technique">Technique & Drills</SelectItem>
                          <SelectItem value="steady_state">Steady State (UT2/UT1)</SelectItem>
                          <SelectItem value="time_trial">2k / 5k Test</SelectItem>
                          <SelectItem value="sprint_power">Power & Sprints</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full">
                <Wind className="mr-2 h-4 w-4" />
                Calculate Optimal Drag Factor
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Wind className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recommended Drag Factor</CardTitle>
                  <CardDescription>Optimized for your physiology and session goal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center items-end gap-2">
                  <span className="text-5xl font-bold text-primary">{result.optimalDrag}</span>
                  <span className="text-xl text-muted-foreground mb-2">DF</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  Range: {result.minDrag} - {result.maxDrag}
                </p>
                <p className="text-lg text-primary mt-4 font-medium">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                  <p className="font-semibold">Est. Damper Setting</p>
                  <Badge variant="outline" className="text-lg px-4 py-1 mt-1">
                    {result.damperEstimate}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Varies by machine cleanliness</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Water Feel</p>
                  <Badge variant={result.feelType === 'Fast & Light' ? 'secondary' : 'default'}>
                    {result.feelType}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Load Focus</p>
                  <p className="font-medium text-sm mt-1">{result.intensityLevel}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Technique Cue:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Strategic Insights & Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Why this setting works for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Injury prevention monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components affecting your Drag Factor selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Users className="h-4 w-4" />
                Physiology (Weight & Gender)
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Drag factor scales with physical size and leverage.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Heavyweights:</strong> Typically use higher drag (125-140) as they have more mass to accelerate the flywheel.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Lightweights:</strong> Benefit from lower drag (110-125) to maintain higher turnover and catchment speed.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Zap className="h-4 w-4" />
                Training Focus
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The goal of the session dictates the resistance needed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Aerobic/Steady:</strong> Standard drag allows for sustainable rhythm without muscular burnout.</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span><strong>Power/Sprints:</strong> Higher drag increases 'handle heaviness', allowing peak force application at low rates.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula/Concept Box */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            The Drag Law Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Resistance &prop; Velocity³ * Drag Factor
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The rower measures the deceleration of the flywheel between strokes. A higher Drag Factor means the flywheel slows down faster, requiring more force to accelerate it again on the next stroke. It mimics the "weight" or "hull displacement" of a boat.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Health & Fitness Calculators
          </CardTitle>
          <CardDescription>
            Optimize your training with these additional tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/health-fitness/vo2-max-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">VO2 Max</p>
                      <p className="text-sm text-muted-foreground">Aerobic Capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/health-fitness/bmr-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">BMR Calculator</p>
                      <p className="text-sm text-muted-foreground">Caloric Baselines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/health-fitness/one-rep-max-strength-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">One Rep Max</p>
                      <p className="text-sm text-muted-foreground">Strength Potential</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/health-fitness/running-pace-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Running Pace Calc</p>
                      <p className="text-sm text-muted-foreground">Split Times & Speed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/health-fitness/body-fat-percentage-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Body Fat %</p>
                      <p className="text-sm text-muted-foreground">Composition Analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/health-fitness/ideal-body-weight-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Ideal Body Weight</p>
                      <p className="text-sm text-muted-foreground">Weight Management</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="The Ultimate Guide to Rowing Drag Factor: Optimization & Performance" />
        <meta itemProp="description" content="A comprehensive guide to understanding and setting the correct drag factor on a rowing machine (ergometer). Learn why the damper setting is not resistance, how weight affects drag, and how to prevent back injuries." />
        <meta itemProp="author" content="MegaCalc Fitness Team" />
        <meta itemProp="datePublished" content="2025-02-15" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Rowing Drag Factor: Mastery of the Flywheel</h1>
        <p className="text-lg italic text-muted-foreground">
          Unlock the secret to faster splits and injury-free rowing by understanding the physics of air resistance and the myth of the "10" damper setting.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#whatis" className="hover:underline">What is Drag Factor? (Vs. Damper Setting)</a></li>
          <li><a href="#technique" className="hover:underline">Physics of the Flywheel: Air Resistance Explained</a></li>
          <li><a href="#optimal" className="hover:underline">Finding Your Optimal Drag Factor</a></li>
          <li><a href="#myths" className="hover:underline">Common Myths: The "Ego" Damper Setting</a></li>
          <li><a href="#risks" className="hover:underline">Health Risks of Incorrect Drag Factors</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="whatis" className="text-2xl font-bold text-foreground pt-6">What is Drag Factor? (Vs. Damper Setting)</h2>
        <p>
          One of the most persistent misunderstandings in the world of indoor rowing is the relationship between the <strong>Damper Setting</strong> (the lever on the side of the fan cage, numbered 1-10) and the actual <strong>Drag Factor</strong> (the numerical measure of resistance).
        </p>
        <p className="mt-4">
          Think of the damper setting like the gears on a bicycle. It controls how much air is allowed into the flywheel housing. A setting of 10 opens the damper fully, allowing maximum air in. A setting of 1 allows very little air.
        </p>
        <p className="mt-4">
          However, the damper setting is inconsistent between machines. a setting of "4" on a brand new machine might feel very different from a "4" on a dusty, gym-worn machine. This is where <strong>Drag Factor</strong> comes in. Drag Factor is a precise calculation made by the performance monitor (PM3, PM4, PM5) that measures how quickly the flywheel slows down between strokes. It is the true measure of "load" or "resistance" tailored to that specific machine's condition.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why "10" isn't "Harder"</h3>
        <p>
          Many beginners confuse the damper setting with weight lifting intensity, believing that 10 is for strong people and 1 is for weak people. This is false. A setting of 10 creates a feel similar to a heavy, slow wooden rowboat. A setting of 3-4 simulates a sleek, fast racing shell. Olympic rowers—some of the strongest athletes in the world—rarely train at a setting of 10. They train at a drag factor (usually damper 3-5) that mimics water.
        </p>

        <h2 id="technique" className="text-2xl font-bold text-foreground pt-8">Physics of the Flywheel: Air Resistance Explained</h2>
        <p>
          Indoor rowing machines use air resistance. The resistance is generated by the fan blades moving through air. As you pull the handle, you accelerate the flywheel. When you slide back up the rail (the recovery), the flywheel spins freely and slows down due to air resistance.
        </p>

        <div className="p-4 bg-muted border-l-4 border-primary my-6">
          <p className="font-semibold">The Golden Rule of Air Resistance:</p>
          <p className="italic">Resistance increases exponentially with velocity.</p>
        </div>

        <p>
          This means the harder you pull, the more resistance you feel. You can get an incredible workout at a generic drag factor (like 120) simply by pulling faster and harder. You do not need to max out the damper lever to increase intensity. In fact, setting the damper too high can limit your ability to accelerate the wheel, reducing the cardiovascular benefit and turning the motion into a slow, grinding strength exercise rather than a rhythmic aerobic one.
        </p>

        <h2 id="optimal" className="text-2xl font-bold text-foreground pt-8">Finding Your Optimal Drag Factor</h2>
        <p>
          The "perfect" drag factor is subjective but falls within established ranges based on biomechanics and competition standards.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Standard Ranges</h3>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Heavyweight Men (75kg+):</strong> 125 - 140. This provides enough resistance for their mass without overloading the lower back. Most 2k tests are done around 130-135.</li>
          <li><strong>Lightweight Men (&lt;75kg):</strong> 120 - 135. Lightweights often rely on a faster stroke rate (cadence) to generate speed, which is easier at a slightly lower drag.</li>
          <li><strong>Heavyweight Women (61.5kg+):</strong> 115 - 130. Similar to lightweight men, prioritizing connection.</li>
          <li><strong>Lightweight Women (&lt;61.5kg):</strong> 105 - 120. A lighter setting allows for the high velocity required to be competitive.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">How to Display Drag Factor on Concept2</h3>
        <p>
          To see your actual drag factor on a Concept2 PM5 monitor:
        </p>
        <ol className="list-decimal ml-6 space-y-2 mt-2">
          <li>On the Main Menu, select <strong>More Options</strong>.</li>
          <li>Select <strong>Display Drag Factor</strong>.</li>
          <li>Row a few strokes. The number will appear on the screen.</li>
          <li>Adjust the damper lever up or down until the number reaches your target (e.g., 130).</li>
          <li>Once set, return to the workout screen. The machine will remember this calibration for the session.</li>
        </ol>

        <h2 id="myths" className="text-2xl font-bold text-foreground pt-8">Common Myths: The "Ego" Damper Setting</h2>
        <p>
          Walk into any commercial gym, and you will see the rowers with the damper lever pushed all the way up to 10. This is the "Ego Setting."
        </p>
        <p className="mt-4">
          The belief is that "more resistance = better workout." However, rowing at a drag factor of 200 (damper 10) is akin to riding a bicycle in high gear up a steep hill. It forces a slow, grinding cadence. While this has a place in specific strength intervals, it destroys rhythm and flow for general endurance training.
        </p>
        <p className="mt-4">
          <strong>The Cross-Training Misconception:</strong> Many functional fitness athletes use the highest setting to minimize the time it takes to "accumulate calories." While technically true that a heavy dampening *can* register calories slightly faster if strength is the limiting factor, it maximizes fatigue and injury risk, often leading to slower times in subsequent rounds of a workout.
        </p>

        <h2 id="risks" className="text-2xl font-bold text-foreground pt-8">Health Risks of Incorrect Drag Factors</h2>
        <p>
          Setting the drag factor too high is the leading cause of lower back injuries in indoor rowing.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Lumbar Spine Mechanics</h3>
        <p>
          At the "catch" (the beginning of the stroke), your body is compressed. If the resistance is too heavy (high drag), your leg drive may push your hips back before the handle moves significantly. This disconnect causes your lower back to round and take the entire load of the stroke. This is known as "shooting the slide."
        </p>
        <p className="mt-4">
          Over time, this repeated shearing force can lead to herniated discs or severe muscular strain. Lowering the drag factor allows the handle to move *with* the seat, engaging the glutes and legs—the strongest muscles in the body—protecting the spine.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Rib Stress Fractures</h3>
        <p>
          While less common in recreational rowers, elite athletes training at drag factors that are too high for their bone density risk rib stress fractures. The interplay of the serratus anterior and latissimus dorsi muscles pulling on the rib cage during a heavy "opening" of the back can crack ribs if the load is consistently too high.
        </p>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>
          Drag factor is the great equalizer of indoor rowing. It ensures that a workout done in London on a new machine is comparable to one done in Tokyo on an old one. By ignoring the damper number and focusing on the Drag Factor value, you ensure training consistency, protect your back, and optimize your transfer of power.
        </p>
        <p className="mt-4 font-medium text-primary">
          Start with a drag factor of 115-125 for women and 125-135 for men. Adjust strictly based on "boat feel" and split maintenance, not ego.
        </p>
      </section>

      {/* FAQ Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Expert answers to common rowing configuration queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">What is the difference between Drag Factor and Damper Setting?</h4>
              <p className="text-muted-foreground">
                The damper setting (1-10 lever) just controls air flow volume. The Drag Factor is the calculated resistance based on flywheel deceleration. A damper of 5 on a clean machine might be Drag 130, while on a dusty machine, you might need a damper of 7 to hit Drag 130. Drag Factor is the true metric; damper is just the tool to adjust it.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Is a higher drag factor better for building muscle?</h4>
              <p className="text-muted-foreground">
                Slightly, but at a cost. While a higher drag (150+) requires more peak force per stroke, it functions more like weightlifting than rowing. Logic dictates that you can produce more <em>power</em> (Watts) at a moderate drag where you can maintain high velocity. True muscle building is better achieved with traditional weights, while rowing builds endurance and power-endurance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">What drag factor do Olympic rowers use?</h4>
              <p className="text-muted-foreground">
                Surprisingly low! Most National Teams train men around 130-135 and women around 110-120. This replicates the feel of a racing shell moving at speed. They only go higher for specific low-rate power drills.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Why does my drag factor change from machine to machine?</h4>
              <p className="text-muted-foreground">
                Dust build-up inside the flywheel cage blocks airflow. A machine clogged with dust generates less resistance. Therefore, on an old machine, you might need to set the damper to 10 just to get a drag factor of 120. On a new machine, a damper of 3 might give you 120.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Can drag factor cause back pain?</h4>
              <p className="text-muted-foreground">
                Yes. If the drag is too high, the handle feels "heavy" at the catch. If your core isn't strong enough to support this load, your lower back can round or arch excessively, leading to injury. Lowering the drag reduces this initial shock load.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Should I change my drag factor for a 2000m test?</h4>
              <p className="text-muted-foreground">
                Stick to what you train with. Changing drag factor right before a test disrupts your rhythm. If you train at 130, test at 130. Your muscles have calibrated their firing sequence to that specific deceleration rate.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">Does drag factor affect calorie counting?</h4>
              <p className="text-muted-foreground">
                Technically, the calculation of calories is based on watts produced. You can produce 300 watts at Drag 110 (fast spinning) or Drag 150 (slow grinding). The monitor accounts for the drag. However, efficiency varies from person to person; some find it easier to hold high watts at lower drag, and vice versa.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">I am tall. Should I use a higher drag factor?</h4>
              <p className="text-muted-foreground">
                Not necessarily. While taller rowers (longer levers) can often handle higher loads, the ideal drag is more about weight and strength-to-weight ratio. A tall, skinny rower might still prefer a lower drag to keep the rate up, whereas a shorter, stockier rower might prefer a heavier load.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">How do I verify the drag factor on a WaterRower?</h4>
              <p className="text-muted-foreground">
                WaterRowers use water level for resistance. You physically add or subtract water from the tank to change the "drag rule." The "Rule of 17" or "Rule of 19" often applies to water level markings, but water dynamics differ from air. Concept2 drag factors don't directly translate perfectly to water levels.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-2">What is the "Drag Factor 100" challenge?</h4>
              <p className="text-muted-foreground">
                Some coaches use a "Drag 100" workout where athletes must row at maximum intensity with very low resistance. This forces the athlete to be extremely fast at the catch and connect immediately, otherwise, they spin the wheels with no power. It's excellent for technique training.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">CrossFit Athletes</strong>
                <span className="text-sm text-muted-foreground">To find the efficiency "sweet spot" that allows for fast calorie accumulation without blowing up the lower back during high-volume WODs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">On-Water Rowers</strong>
                <span className="text-sm text-muted-foreground">To sustain winter training that accurately mimics the hydrodynamic load of a single scull or eight, maintaining sport-specific mechanics.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Home Fitness Enthusiasts</strong>
                <span className="text-sm text-muted-foreground">To ensure safety and effectiveness on personal machines, avoiding the common mistake of rowing at the "Max (10)" setting.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Physiotherapists</strong>
                <span className="text-sm text-muted-foreground">To prescribe low-load (low drag) rehabilitation protocols for patients recovering from lumbar or knee injuries.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* When it might be inaccurate */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Machine Condition:</strong> A dusty flywheel cage will require a higher damper setting to achieve the target drag factor compared to a clean machine.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Elevation/Altitude:</strong> At high altitude, air is thinner. You may need to raise the damper lever higher to achieve the same drag factor felt at sea level.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Static vs. Dynamic:</strong> The static ergometer (Concept2 Model D) feels heavier at the catch (turnover) than a dynamic ergometer (RP3 or C2 on Slides) or a boat, even at the same drag factor.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: The Olympic Lightweight Male</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  Trains at <strong>128 Drag Factor</strong>. He is exceptionally strong but needs quick connection speed. If the drag were 150, the handle would feel too heavy to accelerate instantly, slowing his stroke rate (cadence) below race pace (36-38 spm).
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: The Strongman Competitor</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Uses <strong>max damper (Drag 200+)</strong> effectively but only for very short bursts (e.g., 100m sprint or 10-cal max effort). The goal is pure peak force application, not aerobic efficiency or rhythm.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Rowing Drag Factor Calculator determines the optimal resistance setting for indoor rowing based on body composition and training goals.</p>
          <p>It helps prevent injury, optimize technique, and ensure training consistency across different machines.</p>
          <p>Use this tool to find your personalized "water feel" and stop guessing with the damper lever.</p>
        </CardContent>
      </Card>

    </div>
  );
}
