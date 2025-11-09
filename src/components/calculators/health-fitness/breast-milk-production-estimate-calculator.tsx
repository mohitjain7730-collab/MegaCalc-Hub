'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Zap, Droplets, Baby, Calendar, Scale, Info, HeartPulse } from 'lucide-react';

const formSchema = z.object({
  babyAgeWeeks: z.number().min(0).max(104).optional(),
  babyWeightKg: z.number().min(2).max(20).optional(),
  feedingsPerDay: z.number().min(6).max(20).optional(),
  milkPerFeedingMl: z.number().min(30).max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreastMilkProductionEstimateCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { babyAgeWeeks: undefined, babyWeightKg: undefined, feedingsPerDay: undefined, milkPerFeedingMl: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.babyAgeWeeks != null) {
      if (v.babyAgeWeeks < 4) msgs.push('Early postpartum period; milk production is establishing and may vary.');
      else if (v.babyAgeWeeks <= 12) msgs.push('Milk production typically stabilizes around 6-12 weeks postpartum.');
      else if (v.babyAgeWeeks <= 26) msgs.push('Established milk supply; production adjusts based on demand.');
      else msgs.push('Older infant period; milk intake may decrease as solid foods are introduced.');
    }
    if (v.babyWeightKg != null && v.feedingsPerDay != null) {
      const estimatedDailyMl = v.babyWeightKg * 150;
      const currentDailyMl = (v.milkPerFeedingMl || 0) * v.feedingsPerDay;
      if (currentDailyMl > 0) {
        if (currentDailyMl < estimatedDailyMl * 0.8) msgs.push('Milk intake may be below typical range; monitor baby\'s growth and feeding cues.');
        else if (currentDailyMl > estimatedDailyMl * 1.2) msgs.push('Milk intake is above average; ensure baby is satisfied and gaining weight appropriately.');
        else msgs.push('Milk intake appears within typical range for baby\'s weight.');
      }
    }
    return msgs.join(' ') || 'Enter baby\'s information to estimate milk production needs.';
  };

  const recommendations = (v: FormValues) => [
    'Feed on demand and watch for hunger cues; frequent feeding supports milk production',
    'Ensure adequate hydration and nutrition; breastfeeding requires approximately 500 extra calories daily',
    'Monitor baby\'s weight gain, wet diapers, and feeding patterns to assess milk supply adequacy',
  ];

  const warnings = (v: FormValues) => [
    'Consult a lactation consultant or healthcare provider if concerned about milk supply or baby\'s feeding',
    'Signs of inadequate milk supply may include poor weight gain, fewer wet diapers, or constant feeding',
    'Avoid supplementing without medical guidance, as this can further decrease milk production',
  ];

  const plan = () => ([
    { week: 1, focus: 'Establish frequent feeding schedule; aim for 8-12 feeds per 24 hours' },
    { week: 2, focus: 'Monitor milk supply and baby\'s weight gain; ensure proper latch' },
    { week: 3, focus: 'Continue frequent feeds; milk production should be increasing' },
    { week: 4, focus: 'Milk supply typically stabilizes; reassess feeding patterns' },
    { week: 5, focus: 'Continue monitoring baby\'s growth and feeding satisfaction' },
    { week: 6, focus: 'Establish routine while maintaining responsive feeding' },
    { week: 7, focus: 'Milk production adjusts to baby\'s needs; maintain adequate nutrition' },
    { week: 8, focus: 'Continue monitoring and adjusting based on baby\'s development and feeding cues' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Estimated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Droplets className="h-5 w-5" /> Breast Milk Production Estimate</CardTitle>
          <CardDescription>Estimate breast milk production needs based on baby's age and weight</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="babyAgeWeeks" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Baby's Age (weeks)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="babyWeightKg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Baby's Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="feedingsPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4" /> Feedings Per Day</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="milkPerFeedingMl" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Milk Per Feeding (ml)</FormLabel>
                <FormControl>
                  <Input type="number" step="5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Estimate Milk Production</Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Breast Milk Production Estimate</CardTitle>
              </div>
              <CardDescription>Estimated milk production needs and feeding assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{result.interpretation}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Status</p><p className="text-xl font-semibold">{result.status}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Note</p><p className="text-sm">Always follow clinician guidance</p></div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead><tbody>{result.plan.map(p=> (<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody></table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Pregnancy & parenting tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/postpartum-calorie-needs-calculator" className="text-primary hover:underline">Postpartum Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate calorie needs for breastfeeding.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/parenting/baby-feeding-amount-calculator" className="text-primary hover:underline">Baby Feeding Amount</Link></h4><p className="text-sm text-muted-foreground">Estimate daily feeding needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary hover:underline">Pregnancy Weight Gain</Link></h4><p className="text-sm text-muted-foreground">Track recommended weight gain.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary hover:underline">Protein Intake</Link></h4><p className="text-sm text-muted-foreground">Postpartum protein requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Breast Milk Production</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Breast milk production is a dynamic process that adjusts based on supply and demand. Understanding your baby's milk intake needs helps ensure adequate nutrition and supports successful breastfeeding. Milk production typically increases during the first few weeks postpartum and stabilizes around 6-12 weeks.</p>
          <p>Average milk intake ranges from approximately 120-150 ml per kilogram of baby's body weight per day during the first 6 months. This means a 4 kg baby would typically consume about 480-600 ml daily. However, individual needs vary, and frequent feeding on demand helps establish and maintain adequate milk supply.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How much breast milk does a baby need per day?', 'Breast milk intake varies by baby\'s age and weight. Generally, babies need approximately 120-150 ml per kilogram of body weight per day during the first 6 months. For example, a 4 kg baby typically needs 480-600 ml daily. However, individual needs vary, and feeding on demand ensures adequate intake. Monitor baby\'s weight gain, wet diapers, and feeding satisfaction to assess adequacy.'],
            ['How often should I breastfeed my baby?', 'Newborns typically feed 8-12 times per 24 hours, with feeds occurring every 2-3 hours. As babies grow, feeding frequency may decrease to 6-8 times per day by 3-4 months. However, feeding on demand is recommended, as it supports milk production and ensures baby gets enough nutrition. Watch for hunger cues such as rooting, hand-to-mouth movements, and increased alertness.'],
            ['How do I know if my baby is getting enough breast milk?', 'Signs of adequate milk intake include steady weight gain (following growth curves), 6+ wet diapers per day after the first week, regular bowel movements, baby appears satisfied after feeds, and baby is alert and active when awake. If concerned about milk supply, consult with a lactation consultant or healthcare provider for assessment and support.'],
            ['What affects breast milk production?', 'Milk production is primarily driven by supply and demand. Frequent, effective feeding stimulates production. Other factors include maternal nutrition (adequate calories and hydration), rest, stress levels, hormonal factors, and baby\'s latch and feeding effectiveness. Ensuring proper latch, frequent feeds, and adequate maternal nutrition supports optimal milk production.'],
            ['Can I increase my breast milk supply?', 'Yes, several strategies can help increase milk supply: feed more frequently (every 2-3 hours), ensure proper latch, offer both breasts at each feeding, pump after feeds if needed, ensure adequate hydration and nutrition, get sufficient rest, and reduce stress. Consulting with a lactation consultant can provide personalized strategies and support for increasing milk production.'],
            ['How does baby\'s age affect milk production needs?', 'Milk production needs change as babies grow. In the first few weeks, production increases rapidly to meet growing demands. By 6-12 weeks, production typically stabilizes. As babies start solid foods around 6 months, milk intake may gradually decrease, but breast milk remains an important part of nutrition. Production adjusts naturally based on baby\'s feeding patterns and intake.'],
            ['What if my milk supply seems low?', 'If concerned about low milk supply, consult with a lactation consultant or healthcare provider for assessment. Common causes include infrequent feeding, poor latch, supplementing with formula, stress, fatigue, or medical issues. Strategies to increase supply include more frequent feeding, proper latch, pumping, adequate nutrition and hydration, and addressing any underlying issues. Early intervention is key to resolving supply concerns.'],
            ['How long should each breastfeeding session last?', 'Breastfeeding session length varies by baby and age. Newborns may feed for 20-45 minutes per session, while older babies may feed more efficiently in 10-20 minutes. Let baby finish the first breast before offering the second, as the hindmilk (higher in fat) comes later in the feeding. Feeding duration typically decreases as babies become more efficient at extracting milk.'],
            ['Does pumping affect milk production?', 'Pumping can help maintain or increase milk production, especially when done regularly and effectively. Pumping after feeds can stimulate additional production, and exclusive pumping can sustain milk supply. However, pumping output may not always reflect actual milk production, as babies are typically more efficient at removing milk than pumps. Consistent, frequent pumping sessions help maintain supply.'],
            ['When should I be concerned about milk production?', 'Concern is warranted if baby shows signs of inadequate intake: poor weight gain or weight loss, fewer than 6 wet diapers per day after the first week, constant feeding without satisfaction, excessive sleepiness or lethargy, or signs of dehydration. Additionally, if you experience persistent pain, engorgement that doesn\'t resolve, or other breastfeeding difficulties, consult with a lactation consultant or healthcare provider for assessment and support.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
