'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
  protocol: z.enum(['16:8', '18:6', '20:4']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
});

type FormValues = z.infer<typeof formSchema>;

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function IntermittentFastingCalculator() {
  const [result, setResult] = useState<{ eatingWindow: string; fastingWindow: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      protocol: '16:8',
      startTime: '12:00',
    },
  });

  const onSubmit = (values: FormValues) => {
    const { protocol, startTime } = values;
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    const windowHours = parseInt(protocol.split(':')[1]);
    endDate.setHours(startDate.getHours() + windowHours);

    setResult({
        eatingWindow: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        fastingWindow: `${formatTime(endDate)} - ${formatTime(startDate)}`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Intermittent Fasting Schedule
          </CardTitle>
          <CardDescription>
            Select your desired fasting protocol and when you'd like your eating window to start
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="protocol" render={({ field }) => (
                    <FormItem>
                        <FormLabel>IF Protocol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="16:8">16:8 (16hr fast, 8hr eating)</SelectItem>
                                <SelectItem value="18:6">18:6 (18hr fast, 6hr eating)</SelectItem>
                                <SelectItem value="20:4">20:4 (20hr fast, 4hr eating)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )} />
                <FormField control={form.control} name="startTime" render={({ field }) => (
                    <FormItem><FormLabel>Eating Window Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
          <Button type="submit">Calculate Schedule</Button>
        </form>
      </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Intermittent Fasting Schedule</CardTitle>
                  <CardDescription>Daily eating and fasting windows</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <p className="font-bold text-lg text-green-700 dark:text-green-300">Eating Window</p>
                        <p className="text-xl font-bold">{result.eatingWindow}</p>
                    </div>
                     <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <p className="font-bold text-lg text-red-700 dark:text-red-300">Fasting Window</p>
                        <p className="text-xl font-bold">{result.fastingWindow}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">IF Protocol</h4>
              <p className="text-muted-foreground">
                The intermittent fasting protocol determines how many hours you'll fast versus eat each day. Common protocols include 16:8 (16 hours fasting, 8 hours eating), 18:6 (18 hours fasting, 6 hours eating), and 20:4 (20 hours fasting, 4 hours eating). Start with 16:8 as it's easiest to maintain and adjust based on your lifestyle and goals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Eating Window Start Time</h4>
              <p className="text-muted-foreground">
                This is when your daily eating window begins. Choose a time that fits your schedule—many people prefer starting around noon (12:00 PM) for the 16:8 protocol, which means eating between 12 PM and 8 PM. Consider your work schedule, training times, and social commitments when choosing your start time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other nutrition and health calculators to optimize your wellness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">
                    Daily Calorie Needs Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your total daily energy expenditure to ensure you meet your calorie needs during your eating window.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">
                    Macro Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine your optimal macronutrient distribution to maximize results with intermittent fasting.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">
                    Protein Intake Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Ensure you're getting enough protein to preserve muscle mass while fasting.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/keto-macro-calculator" className="text-primary hover:underline">
                    Keto Macro Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Combine keto with intermittent fasting for enhanced metabolic benefits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Complete Guide to Intermittent Fasting
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">How to Use Intermittent Fasting Successfully</h2>
            <p>Pick a schedule you can sustain, then structure meals to meet your protein, fiber, and micronutrient needs within the eating window.</p>

        <h3 className="font-semibold text-foreground mt-6">Choosing a Protocol</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>16:8:</strong> balanced for most people; 2–3 meals fits well.</li>
          <li><strong>18:6:</strong> shorter window, useful for appetite control if lifestyle allows.</li>
          <li><strong>20:4:</strong> advanced; ensure meals remain nutrient‑dense.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Performance & Recovery</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Place higher‑carb, protein‑rich meals <strong>before/after training</strong> when possible.</li>
          <li>Stay hydrated; include electrolytes on hot days or long fasts.</li>
          <li>Sleep matters—late‑night eating may affect sleep quality for some.</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">What to Consume While Fasting</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Water, black coffee, plain tea, non‑caloric electrolytes typically fit most protocols.</li>
          <li>Zero‑calorie sweeteners are individual—test tolerance and appetite response.</li>
        </ul>
        
        <h3 className="font-semibold text-foreground mt-6">Benefits & Considerations</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Simplicity:</strong> fewer eating decisions may improve dietary adherence.</li>
          <li><strong>Appetite rhythm:</strong> many find hunger consolidates to the eating window after 1–2 weeks.</li>
          <li><strong>Training schedule:</strong> if you train early, consider a window that includes your post‑workout meal.</li>
        </ul>

            <p className="italic mt-6">Medical note: IF is not appropriate for everyone (e.g., pregnancy, certain metabolic or eating disorders). Consult a clinician if unsure.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about intermittent fasting and meal timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Does coffee break a fast?</h4>
              <p className="text-muted-foreground">
                Plain black coffee generally fits most practical IF approaches. The key is avoiding calories—so black coffee, plain tea, and water are fine. Adding cream, milk, sugar, or sweeteners with calories will break your fast. Some people tolerate zero-calorie sweeteners, but they may trigger an insulin response in some individuals, so it's best to test your personal tolerance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I build muscle on intermittent fasting?</h4>
              <p className="text-muted-foreground">
                Yes—ensure adequate protein and progressive training; distribute protein across meals in the window. Muscle building is possible with IF as long as you meet your daily calorie and protein targets during your eating window. Many people find it helpful to consume a protein-rich meal shortly before or after training. Timing matters less than total daily intake, but spreading protein across 2-3 meals helps maximize muscle protein synthesis.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I fast daily?</h4>
              <p className="text-muted-foreground">
                Many do; others cycle IF 3–5 days/week. Choose what fits your routine and recovery. Daily fasting works well for many people and becomes easier with time. However, if you find it too restrictive or it's affecting your training performance, consider fasting 3-5 days per week. Listen to your body—some people thrive with daily fasting, while others do better with occasional flexibility.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Will intermittent fasting slow my metabolism?</h4>
              <p className="text-muted-foreground">
                Short-term intermittent fasting (16-20 hours) typically doesn't slow metabolism. In fact, it may improve metabolic flexibility. However, very extended fasts (24+ hours) or chronic severe calorie restriction can slow metabolism. The key is ensuring you meet your calorie needs during your eating window. If you're consistently undereating, your metabolism will slow regardless of eating pattern.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What should I eat during my eating window?</h4>
              <p className="text-muted-foreground">
                Focus on whole, nutrient-dense foods: lean proteins, vegetables, fruits, whole grains, and healthy fats. Since you have a shorter window, make every meal count. Prioritize protein (aim for your daily target), include plenty of vegetables for fiber and micronutrients, and don't skimp on healthy fats for satiety. Meal prepping can help ensure you're hitting your macro and micronutrient targets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I exercise while fasting?</h4>
              <p className="text-muted-foreground">
                Yes, many people exercise in a fasted state, especially in the morning. Light to moderate cardio and resistance training are generally fine. For high-intensity workouts or long endurance sessions, you may perform better if you can include a meal before or soon after training. Experiment to see what works best for your energy levels and performance—many people adapt well to fasted training.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does it take to see results from intermittent fasting?</h4>
              <p className="text-muted-foreground">
                Most people start noticing benefits within 1-2 weeks: improved energy, better appetite control, and possibly some weight loss. Significant body composition changes typically take 4-8 weeks or longer, depending on your goals. Remember that IF is just one tool—results also depend on what you eat during your window, your activity level, sleep, and stress management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is intermittent fasting safe for women?</h4>
              <p className="text-muted-foreground">
                IF can work for many women, but some may experience hormonal disruptions, especially with very long fasts (20+ hours) or aggressive protocols. Women are generally advised to start with shorter fasts (14-16 hours) and consider fasting 3-5 days per week rather than daily. If you notice changes in your menstrual cycle, increased stress, or other hormonal symptoms, scale back or consult a healthcare provider.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What if I feel dizzy or lightheaded during fasting?</h4>
              <p className="text-muted-foreground">
                This often indicates electrolyte imbalance or dehydration. Make sure you're drinking plenty of water and consider adding electrolytes (sodium, potassium, magnesium) during longer fasts. If symptoms persist, you may need to shorten your fasting window, ensure you're eating enough during your eating window, or consult a healthcare provider. IF should make you feel energized, not unwell.
              </p>
        </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I combine intermittent fasting with other diets?</h4>
              <p className="text-muted-foreground">
                Absolutely. IF is compatible with many eating patterns, including keto, Mediterranean, plant-based, and others. The key is ensuring your chosen diet provides adequate nutrition within your eating window. Some combinations, like keto + IF, are particularly popular for enhanced results. However, be careful not to combine multiple restrictive approaches if it makes meeting your nutritional needs difficult.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
