'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoonStar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  timeInBedHours: z.number().positive().max(24),
  totalSleepHours: z.number().nonnegative().max(24),
  sleepOnsetLatency: z.number().min(0).max(300).optional(), // minutes
  wakeAfterSleepOnset: z.number().min(0).max(300).optional(), // minutes
  age: z.number().min(1).max(120).optional(),
  sleepIssues: z.array(z.enum(['insomnia', 'frequent_waking', 'early_waking', 'difficulty_falling_asleep', 'none'])).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateSleepEfficiency = (values: FormValues) => {
  const efficiency = (values.totalSleepHours / values.timeInBedHours) * 100;
  
  // Determine sleep quality status
  let status = 'excellent';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;
  let statusText = 'Excellent Sleep Efficiency';
  
  if (efficiency < 85) {
    status = 'poor';
    statusColor = 'text-red-600';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    icon = XCircle;
    statusText = 'Poor Sleep Efficiency';
  } else if (efficiency < 90) {
    status = 'fair';
    statusColor = 'text-orange-600';
    bgColor = 'bg-orange-50';
    borderColor = 'border-orange-200';
    icon = AlertTriangle;
    statusText = 'Fair Sleep Efficiency';
  } else if (efficiency >= 90 && efficiency < 95) {
    status = 'good';
    statusColor = 'text-blue-600';
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-200';
    icon = CheckCircle;
    statusText = 'Good Sleep Efficiency';
  } else {
    status = 'excellent';
    statusColor = 'text-green-600';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    icon = CheckCircle;
    statusText = 'Excellent Sleep Efficiency';
  }

  // Calculate additional metrics
  const timeAwake = values.timeInBedHours - values.totalSleepHours;
  const timeAwakeMinutes = timeAwake * 60;
  
  return {
    efficiency,
    status,
    statusColor,
    bgColor,
    borderColor,
    icon,
    statusText,
    timeAwake,
    timeAwakeMinutes,
    timeInBed: values.timeInBedHours,
    totalSleep: values.totalSleepHours
  };
};

const getDetailedInterpretation = (result: ReturnType<typeof calculateSleepEfficiency>, values: FormValues) => {
  const interpretations = [];
  
  if (result.efficiency < 85) {
    interpretations.push('Your sleep efficiency is below the clinical threshold for healthy sleep (85%)');
    interpretations.push('This indicates significant time spent awake in bed, which may suggest insomnia or poor sleep hygiene');
    interpretations.push('Consider implementing sleep restriction therapy or consulting a sleep specialist');
  } else if (result.efficiency < 90) {
    interpretations.push('Your sleep efficiency is approaching the healthy range but could be improved');
    interpretations.push('You may benefit from better sleep hygiene practices');
    interpretations.push('Focus on reducing time spent awake in bed');
  } else if (result.efficiency >= 90 && result.efficiency < 95) {
    interpretations.push('Your sleep efficiency is within the healthy range');
    interpretations.push('You have good sleep quality with room for minor improvements');
    interpretations.push('Maintain your current sleep habits');
  } else {
    interpretations.push('Your sleep efficiency is excellent');
    interpretations.push('You are using your time in bed very effectively for sleep');
    interpretations.push('Continue maintaining your healthy sleep habits');
  }

  // Add specific insights based on time awake
  if (result.timeAwakeMinutes > 60) {
    interpretations.push(`You spent ${result.timeAwakeMinutes.toFixed(0)} minutes awake in bed, which significantly impacts sleep quality`);
  } else if (result.timeAwakeMinutes > 30) {
    interpretations.push(`You spent ${result.timeAwakeMinutes.toFixed(0)} minutes awake in bed, which is moderate and could be improved`);
  } else {
    interpretations.push(`You spent only ${result.timeAwakeMinutes.toFixed(0)} minutes awake in bed, indicating very efficient sleep`);
  }

  return interpretations;
};

const getPersonalizedRecommendations = (result: ReturnType<typeof calculateSleepEfficiency>, values: FormValues) => {
  const recommendations = [];
  
  if (result.efficiency < 85) {
    recommendations.push('Implement the 20-minute rule: If you cannot fall asleep within 20 minutes, get out of bed');
    recommendations.push('Use the bed only for sleep and intimacy - avoid reading, working, or watching TV in bed');
    recommendations.push('Consider sleep restriction therapy: reduce time in bed to match your actual sleep time');
    recommendations.push('Maintain a consistent wake-up time every day, even on weekends');
    recommendations.push('Avoid caffeine, alcohol, and large meals close to bedtime');
    recommendations.push('Create a relaxing bedtime routine to signal your body it is time to sleep');
  } else if (result.efficiency < 90) {
    recommendations.push('Focus on improving sleep hygiene to reach optimal efficiency');
    recommendations.push('Ensure your bedroom is cool, dark, and quiet');
    recommendations.push('Limit screen time before bed and use blue light filters');
    recommendations.push('Practice relaxation techniques like deep breathing or meditation');
  } else if (result.efficiency >= 90 && result.efficiency < 95) {
    recommendations.push('Your sleep efficiency is good - maintain current habits');
    recommendations.push('Consider minor optimizations like consistent sleep schedule');
    recommendations.push('Monitor your sleep patterns to prevent any decline');
  } else {
    recommendations.push('Excellent sleep efficiency - continue your current sleep habits');
    recommendations.push('Maintain your consistent sleep schedule and bedtime routine');
    recommendations.push('Consider sharing your sleep hygiene tips with others');
  }

  // Add age-specific recommendations
  if (values.age && values.age > 65) {
    recommendations.push('Older adults may need slightly more time to fall asleep - this is normal');
    recommendations.push('Consider a brief afternoon nap if needed, but keep it under 30 minutes');
  }

  // Add issue-specific recommendations
  if (values.sleepIssues && values.sleepIssues.includes('insomnia')) {
    recommendations.push('For insomnia, consider cognitive behavioral therapy for insomnia (CBT-I)');
    recommendations.push('Keep a sleep diary to track patterns and identify triggers');
  }
  if (values.sleepIssues && values.sleepIssues.includes('frequent_waking')) {
    recommendations.push('Address potential causes of frequent waking: noise, light, temperature, or stress');
    recommendations.push('Consider using earplugs or a white noise machine');
  }
  if (values.sleepIssues && values.sleepIssues.includes('early_waking')) {
    recommendations.push('For early waking, ensure you are getting enough total sleep time');
    recommendations.push('Consider if you are going to bed too early or have underlying stress');
  }

  return recommendations;
};

const getSleepQualityInsights = (result: ReturnType<typeof calculateSleepEfficiency>, values: FormValues) => {
  const insights = [];
  
  // Time in bed vs sleep time analysis
  if (result.timeInBed > 9) {
    insights.push('You are spending more than 9 hours in bed - consider if this is necessary');
    insights.push('Excessive time in bed can actually reduce sleep efficiency');
  } else if (result.timeInBed < 7) {
    insights.push('You are spending less than 7 hours in bed - ensure you are getting enough sleep');
    insights.push('Most adults need 7-9 hours of sleep per night');
  }

  // Sleep efficiency analysis
  if (result.efficiency > 95) {
    insights.push('Very high efficiency may indicate you are not spending enough time in bed');
    insights.push('Consider if you have sleep debt and need more total sleep time');
  }

  // Age-specific insights
  if (values.age && values.age < 18) {
    insights.push('Teenagers typically need 8-10 hours of sleep per night');
    insights.push('Your sleep needs may be higher than adults');
  } else if (values.age && values.age > 65) {
    insights.push('Older adults may experience more fragmented sleep, which is normal');
    insights.push('Focus on total sleep time rather than continuous sleep');
  }

  return insights;
};

export default function SleepEfficiencyCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateSleepEfficiency> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timeInBedHours: undefined,
      totalSleepHours: undefined,
      sleepOnsetLatency: undefined,
      wakeAfterSleepOnset: undefined,
      age: undefined,
      sleepIssues: [],
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateSleepEfficiency(values);
    setResult(calculation);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="timeInBedHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Time in Bed (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    placeholder="e.g., 8.5"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Total time from getting into bed until getting out of bed</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="totalSleepHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Sleep Time (hours)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                    placeholder="e.g., 7.2"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Actual time spent asleep</p>
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sleepOnsetLatency" render={({ field }) => (
              <FormItem>
                <FormLabel>Time to Fall Asleep (minutes) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                    placeholder="e.g., 15"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">How long it takes to fall asleep after getting into bed</p>
              </FormItem>
            )} />
            
            <FormField control={form.control} name="wakeAfterSleepOnset" render={({ field }) => (
              <FormItem>
                <FormLabel>Time Awake During Night (minutes) - Optional</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                    placeholder="e.g., 20"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-muted-foreground">Total time awake during the night</p>
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="age" render={({ field }) => (
            <FormItem>
              <FormLabel>Age (years) - Optional</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  value={field.value ?? ''} 
                  onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                  placeholder="e.g., 35"
                />
              </FormControl>
              <FormMessage />
              <p className="text-sm text-muted-foreground">Age affects sleep needs and patterns</p>
            </FormItem>
          )} />

          <Button type="submit" className="w-full">
            <MoonStar className="mr-2 h-4 w-4" />
            Calculate Sleep Efficiency
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <result.icon className={`h-5 w-5 ${result.statusColor}`} />
              Sleep Efficiency Analysis
            </CardTitle>
            <CardDescription>
              Your sleep quality assessment and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
              <div className="text-center space-y-4">
                <div>
                  <p className="text-4xl font-bold">{result.efficiency.toFixed(1)}%</p>
                  <p className={`text-lg font-semibold ${result.statusColor}`}>{result.statusText}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time in Bed</p>
                    <p className="font-semibold">{result.timeInBed.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Sleep</p>
                    <p className="font-semibold">{result.totalSleep.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Time Awake</p>
                    <p className="font-semibold">{result.timeAwake.toFixed(1)} hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Detailed Interpretation</h3>
              <ul className="space-y-2">
                {getDetailedInterpretation(result, form.getValues()).map((interpretation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <MoonStar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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

            {getSleepQualityInsights(result, form.getValues()).length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Sleep Quality Insights</h3>
                <ul className="space-y-2">
                  {getSleepQualityInsights(result, form.getValues()).map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <SeGuide />
      
      <EmbedWidget calculatorSlug="sleep-efficiency-calculator" calculatorName="Sleep Efficiency Calculator" />
    </div>
  );
}

function SeGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Calculator">
    {/* SEO & SCHEMA METADATA (CORRECTED VOID ELEMENTS) */}
    <meta itemProp="name" content="Sleep Efficiency (SE) Calculator | TST / TIB" />
    <meta itemProp="description" content="Calculate your Sleep Efficiency percentage (Time Asleep vs. Time in Bed). This key clinical metric is used in CBT-I to diagnose sleep quality and determine optimal bedtime schedules." />
    <meta itemProp="keywords" content="sleep efficiency calculator, calculate sleep efficiency, TST TIB formula, good sleep efficiency percentage, insomnia diagnosis tool, sleep quality metric" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/sleep-efficiency-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Sleep Efficiency Calculator: Measure Your Sleep Quality (TST/TIB)</h1>
    
    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#what-is-se" className="hover:underline">What is Sleep Efficiency and the TST/TIB Formula?</a></li>
        <li><a href="#formula-breakdown" className="hover:underline">Key Components: TST, TIB, SOL, WASO</a></li>
        <li><a href="#threshold" className="hover:underline">The 85% Threshold: Diagnosing Insomnia</a></li>
        <li><a href="#cbti" className="hover:underline">How Sleep Restriction Therapy Uses Your SE</a></li>
        <li><a href="#improve" className="hover:underline">Actionable Steps to Increase Your Sleep Efficiency</a></li>
        <li><a href="#faq" className="hover:underline">Sleep Efficiency Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: DEFINITION AND FORMULA */}
    <h2 id="what-is-se" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Sleep Efficiency and the TST/TIB Formula?</h2>
    <p>**Sleep Efficiency (SE)** is a critical metric that measures how effectively you use your time spent in bed for actual sleep. It is the gold standard for quantifying sleep quality, especially in the diagnosis and treatment of insomnia.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Sleep Efficiency Formula</h3>
    <p>SE is calculated as a percentage using the ratio of **Total Sleep Time (TST)** to **Time in Bed (TIB)**:</p>
    <pre className="bg-gray-200 p-3 rounded-md my-4"><code>Sleep Efficiency (%) = [ Total Sleep Time (TST) &divide; Total Time in Bed (TIB) ] &times; 100</code></pre>
    
    <p>A score near 100% means that almost all the time you dedicate to sleep is spent asleep, indicating excellent sleep quality.</p>

<hr />
    {/* SECTION 2: COMPONENTS */}
    <h2 id="formula-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Components: TST, TIB, SOL, and WASO</h2>
    <p>To accurately use the calculator, you must precisely track four core metrics that comprise the TST and TIB values:</p>

    <ul className="list-disc ml-6 space-y-3">
        <li className="font-semibold text-foreground">
            Total Time in Bed (TIB): 
            <p className="font-normal text-muted-foreground ml-4">The total duration from the time you **first attempt to fall asleep** until the time you **finally get out of bed** for the day. TIB includes all time awake spent in bed.</p>
        </li>
        <li className="font-semibold text-foreground">
            Sleep Onset Latency (SOL): 
            <p className="font-normal text-muted-foreground ml-4">The amount of time it takes to **fall asleep** after getting into bed. For good sleep efficiency, SOL should ideally be under 20 minutes.</p>
        </li>
        <li className="font-semibold text-foreground">
            Wake After Sleep Onset (WASO): 
            <p className="font-normal text-muted-foreground ml-4">The cumulative time spent **awake during the night** after initially falling asleep, but before the final morning awakening.</p>
        </li>
        <li className="font-semibold text-foreground">
            Total Sleep Time (TST): 
            <p className="font-normal text-muted-foreground ml-4">The total minutes actually spent asleep. Calculated as: TST = TIB &minus; (Time to Fall Asleep + Total WASO).</p>
        </li>
    </ul>

<hr />
    {/* SECTION 3: THRESHOLD */}
    <h2 id="threshold" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 85% Threshold: Diagnosing Insomnia</h2>
    <p>In clinical settings, a person's average Sleep Efficiency is used to determine the severity of sleep issues, particularly Chronic Insomnia Disorder.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Efficiency Standards</h3>
    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SE Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interpretation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinical Context</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**90% & Higher**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Optimal Sleep Quality</td>
                    <td className="px-6 py-4 whitespace-nowrap">Excellent sleep hygiene and drive.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**85% & Higher**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Normal/Healthy Sleep Efficiency</td>
                    <td className="px-6 py-4 whitespace-nowrap">The standard minimum for healthy adults (ACSM/AASM).</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**Below 85%**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Impaired Sleep Quality</td>
                    <td className="px-6 py-4 whitespace-nowrap">May indicate underlying insomnia or sleep restriction is needed.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 4: CBTI APPLICATION */}
    <h2 id="cbti" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Sleep Restriction Therapy Uses Your SE</h2>
    <p>For those with low sleep efficiency (below 85%), a technique called **Sleep Restriction Therapy (SRT)**—a key component of Cognitive Behavioral Therapy for Insomnia (CBT-I)—is often prescribed. The goal is counter-intuitive: to spend *less* time in bed to increase your sleep drive.</p>
    
    <h3 className="text-xl font-semibold text-foreground mt-6">The Mechanism: Building Sleep Drive</h3>
    <p>By restricting the TIB (Time in Bed) to be closer to your actual TST (Total Sleep Time), you increase the pressure to sleep. This forces your body to use the time in bed much more efficiently, eventually pushing your SE back toward the ideal 85% or higher range. The Sleep Efficiency Calculator is used weekly to monitor progress and adjust your prescribed TIB.</p>

<hr />
    {/* SECTION 5: IMPROVEMENT */}
    <h2 id="improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Actionable Steps to Increase Your Sleep Efficiency</h2>
    <p>If your SE score is below 85%, focus on habits that condition your brain to associate the bed with immediate sleep, not wakefulness.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Essential Sleep Hygiene Tips for High SE</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**The 20-Minute Rule:** If you cannot fall asleep within **20 minutes**, get out of bed. Go to another room and do a relaxing activity (e.g., read a book by dim light) until you feel sleepy, then return to bed. This breaks the association between the bed and wakeful frustration.</li>
        <li>**Use the Bed for Sleep Only:** Avoid reading, working, watching TV, or using electronic devices in bed. The bed should be a strong trigger for sleep and sex only.</li>
        <li>**Maintain Consistency:** Stick to a consistent **wake-up time** every day (even weekends) to solidify your circadian rhythm.</li>
    </ul>

<hr />
    {/* SECTION 6: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sleep Efficiency Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is it possible to have a Sleep Efficiency over 95%?</h3>
    <p>Yes, but a score consistently above 95% can be a sign that you are **not spending enough time in bed**. Your sleep drive is so high that you fall asleep instantly and wake up without spending any time awake. While this sounds efficient, it often indicates you have a significant **Sleep Debt** and need to go to bed earlier to meet your full 7-9 hour requirement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">How long should my TST (Total Sleep Time) be?</h3>
    <p>While the SE measures *quality*, the TST measures *quantity*. For healthy adults, the goal for TST should be **7 to 9 hours**. You should use the SE calculator to confirm that the 7-9 hours you budget is time spent sleeping, not time spent lying awake.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">I have low SE because I wake up too much. What is WASO?</h3>
    <p>**WASO** stands for **Wake After Sleep Onset** (the time spent awake during the night). High WASO dramatically lowers your SE. Common causes include noise, light, needing the restroom, and stress. If WASO is consistently high, it is a key target for improvement via better sleep hygiene or clinical intervention.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This tool is provided by mycalculating.com. If your SE remains below 85% despite practicing good sleep hygiene, please consult a sleep specialist.</p>
    </div>
</section>
  );
}