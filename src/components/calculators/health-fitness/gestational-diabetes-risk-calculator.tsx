'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Zap, HeartPulse, Scale, Calendar, Baby, Info, Activity, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(50).optional(),
  prePregnancyBMI: z.number().min(15).max(50).optional(),
  familyHistory: z.enum(['none','parent','sibling','both']).optional(),
  previousGDM: z.enum(['no','yes']).optional(),
  previousMacrosomia: z.enum(['no','yes']).optional(),
  ethnicity: z.enum(['caucasian','hispanic','african_american','asian','pacific_islander','other']).optional(),
  currentPregnancyWeightGain: z.number().min(0).max(50).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GestationalDiabetesRiskCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, prePregnancyBMI: undefined, familyHistory: undefined, previousGDM: undefined, previousMacrosomia: undefined, ethnicity: undefined, currentPregnancyWeightGain: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    let riskFactors = 0;
    
    if (v.age != null && v.age >= 35) {
      riskFactors++;
      msgs.push('Age 35 or older is a risk factor for gestational diabetes.');
    }
    if (v.prePregnancyBMI != null) {
      if (v.prePregnancyBMI >= 30) {
        riskFactors += 2;
        msgs.push('Obesity (BMI ≥30) significantly increases gestational diabetes risk.');
      } else if (v.prePregnancyBMI >= 25) {
        riskFactors++;
        msgs.push('Overweight (BMI 25-29.9) increases gestational diabetes risk.');
      }
    }
    if (v.familyHistory === 'both' || v.familyHistory === 'parent') {
      riskFactors++;
      msgs.push('Family history of diabetes increases gestational diabetes risk.');
    }
    if (v.previousGDM === 'yes') {
      riskFactors += 2;
      msgs.push('Previous gestational diabetes is a strong risk factor for recurrence.');
    }
    if (v.previousMacrosomia === 'yes') {
      riskFactors++;
      msgs.push('Previous baby with macrosomia (large birth weight) increases risk.');
    }
    if (v.ethnicity === 'asian' || v.ethnicity === 'hispanic' || v.ethnicity === 'pacific_islander' || v.ethnicity === 'african_american') {
      riskFactors++;
      msgs.push('Certain ethnicities have higher gestational diabetes risk.');
    }
    
    if (riskFactors === 0) {
      msgs.push('Low to moderate risk based on provided factors.');
    } else if (riskFactors <= 2) {
      msgs.push('Moderate risk for gestational diabetes; routine screening recommended.');
    } else if (riskFactors <= 4) {
      msgs.push('Elevated risk for gestational diabetes; early screening may be recommended.');
    } else {
      msgs.push('High risk for gestational diabetes; discuss early screening and prevention strategies with your provider.');
    }
    
    return msgs.join(' ') || 'Enter your information to assess gestational diabetes risk.';
  };

  const recommendations = (v: FormValues) => [
    'Maintain a balanced diet with controlled carbohydrate intake and focus on whole grains, vegetables, and lean proteins',
    'Engage in regular, moderate physical activity as approved by your healthcare provider (typically 30 minutes most days)',
    'Attend all prenatal appointments and complete recommended glucose screening tests as scheduled',
  ];

  const warnings = (v: FormValues) => [
    'Gestational diabetes can affect both maternal and fetal health; early detection and management are essential',
    'If diagnosed with gestational diabetes, follow your healthcare provider\'s treatment plan, which may include diet, exercise, and possibly medication',
    'Untreated gestational diabetes can lead to complications including macrosomia, preterm birth, and increased cesarean delivery risk',
  ];

  const plan = () => ([
    { week: 1, focus: 'Discuss risk factors with healthcare provider and plan screening schedule' },
    { week: 2, focus: 'Begin or maintain healthy eating habits with balanced meals and snacks' },
    { week: 3, focus: 'Establish regular physical activity routine as approved by provider' },
    { week: 4, focus: 'Complete initial glucose screening if recommended by provider (typically 24-28 weeks)' },
    { week: 5, focus: 'Monitor weight gain and maintain healthy pregnancy weight' },
    { week: 6, focus: 'Continue healthy lifestyle habits and regular prenatal care' },
    { week: 7, focus: 'Follow up on screening results and implement management plan if needed' },
    { week: 8, focus: 'Maintain ongoing monitoring and management throughout pregnancy' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Assessed', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Gestational Diabetes Risk Assessment</CardTitle>
          <CardDescription>Assess risk factors for gestational diabetes during pregnancy</CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="prePregnancyBMI" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Pre-Pregnancy BMI</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Family History</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select history" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previousGDM" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4" /> Previous GDM</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previousMacrosomia" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Baby className="h-4 w-4" /> Previous Macrosomia</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ethnicity" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Ethnicity</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select ethnicity" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="caucasian">Caucasian</SelectItem>
                      <SelectItem value="hispanic">Hispanic</SelectItem>
                      <SelectItem value="african_american">African American</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="pacific_islander">Pacific Islander</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentPregnancyWeightGain" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Scale className="h-4 w-4" /> Weight Gain (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit" className="w-full md:w-auto">Assess Risk</Button>
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
                <CardTitle>Gestational Diabetes Risk Evaluation</CardTitle>
              </div>
              <CardDescription>Assessment of risk factors for gestational diabetes</CardDescription>
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
          <CardDescription>Pregnancy & health tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary hover:underline">Pregnancy Weight Gain</Link></h4><p className="text-sm text-muted-foreground">Track recommended weight gain.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/postpartum-calorie-needs-calculator" className="text-primary hover:underline">Postpartum Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate postpartum nutrition needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">BMI Calculator</Link></h4><p className="text-sm text-muted-foreground">Calculate body mass index.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4><p className="text-sm text-muted-foreground">Calculate daily calorie requirements.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Gestational Diabetes Risk</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Gestational diabetes mellitus (GDM) is a type of diabetes that develops during pregnancy, affecting approximately 2-10% of pregnancies. It occurs when the body cannot produce enough insulin to meet the increased demands of pregnancy, leading to elevated blood glucose levels. Understanding risk factors helps identify women who may benefit from early screening and preventive measures.</p>
          <p>Key risk factors include age (35 or older), pre-pregnancy BMI (overweight or obesity), family history of diabetes, previous gestational diabetes, previous macrosomia (large baby), certain ethnicities (Hispanic, African American, Asian, Pacific Islander), and polycystic ovary syndrome (PCOS). Early identification and management through diet, exercise, and possibly medication can help prevent complications for both mother and baby.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is gestational diabetes?', 'Gestational diabetes mellitus (GDM) is a type of diabetes that develops during pregnancy, typically around the 24th to 28th week. It occurs when the body cannot produce enough insulin to meet the increased demands of pregnancy, leading to elevated blood glucose levels. Unlike type 1 or type 2 diabetes, gestational diabetes usually resolves after delivery, though it increases the risk of developing type 2 diabetes later in life. Proper management during pregnancy is essential to prevent complications for both mother and baby.'],
            ['What are the risk factors for gestational diabetes?', 'Key risk factors include: age 35 or older, pre-pregnancy BMI of 25 or higher (especially BMI ≥30), family history of diabetes (particularly in a parent or sibling), previous gestational diabetes, previous baby with macrosomia (birth weight >4 kg or 8.8 lbs), certain ethnicities (Hispanic, African American, Asian, Pacific Islander), polycystic ovary syndrome (PCOS), and sedentary lifestyle. Having multiple risk factors increases the likelihood of developing gestational diabetes, but some women with no risk factors may still develop it.'],
            ['How is gestational diabetes diagnosed?', 'Gestational diabetes is typically diagnosed through glucose screening tests between 24-28 weeks of pregnancy. The process usually involves: a glucose challenge test (drinking a sugary solution and testing blood sugar after 1 hour), and if results are elevated, an oral glucose tolerance test (fasting, then drinking a sugary solution and testing blood sugar at 1, 2, and sometimes 3 hours). Some providers may recommend earlier screening for women with high-risk factors. Diagnosis is based on blood glucose levels exceeding established thresholds.'],
            ['Can gestational diabetes be prevented?', 'While not all cases can be prevented, lifestyle modifications before and during pregnancy can reduce risk. Strategies include: achieving a healthy weight before pregnancy, maintaining a balanced diet with controlled carbohydrates, engaging in regular physical activity (as approved by your provider), managing stress, and getting adequate sleep. For women at high risk, early lifestyle interventions and close monitoring may help prevent or delay onset. However, some risk factors like age, ethnicity, and family history cannot be changed.'],
            ['How is gestational diabetes treated?', 'Treatment typically involves: dietary modifications (balanced meals with controlled carbohydrates, focusing on whole grains, vegetables, and lean proteins), regular physical activity (30 minutes of moderate exercise most days, as approved by your provider), blood glucose monitoring (checking levels multiple times daily), and possibly medication (insulin or oral medications if diet and exercise alone don\'t control blood sugar). Regular prenatal care and monitoring are essential to ensure both maternal and fetal health.'],
            ['What are the complications of gestational diabetes?', 'If untreated or poorly managed, gestational diabetes can lead to complications including: macrosomia (large baby, increasing delivery complications), preterm birth, increased cesarean delivery risk, preeclampsia (high blood pressure during pregnancy), hypoglycemia in the baby after birth, increased risk of type 2 diabetes later in life for both mother and child, and respiratory distress syndrome in the baby. However, with proper management, most women with gestational diabetes have healthy pregnancies and babies.'],
            ['Does gestational diabetes go away after delivery?', 'Gestational diabetes typically resolves after delivery, as pregnancy-related hormonal changes that caused insulin resistance diminish. However, blood glucose levels are usually checked after delivery to confirm return to normal. Women with gestational diabetes have a significantly increased risk (up to 50-70%) of developing type 2 diabetes later in life. Regular follow-up screening, maintaining a healthy weight, eating a balanced diet, and staying physically active can help reduce this risk.'],
            ['How does gestational diabetes affect the baby?', 'Gestational diabetes can affect the baby in several ways: macrosomia (excessive growth, making delivery more difficult), hypoglycemia after birth (baby\'s blood sugar may drop as their body adjusts), respiratory distress syndrome, jaundice, and increased risk of obesity and type 2 diabetes later in life. However, with proper management of gestational diabetes during pregnancy, these risks are significantly reduced, and most babies are born healthy.'],
            ['What should I eat if I have gestational diabetes?', 'A gestational diabetes diet focuses on: balanced meals with controlled carbohydrates (spread throughout the day), whole grains (brown rice, whole wheat bread, oats), lean proteins (chicken, fish, legumes, eggs), plenty of vegetables (non-starchy vegetables are encouraged), healthy fats (avocado, nuts, olive oil), and limited refined sugars and processed foods. Meal timing and portion control are important. Many women benefit from working with a registered dietitian to develop a personalized meal plan.'],
            ['When should I be screened for gestational diabetes?', 'Routine screening is typically performed between 24-28 weeks of pregnancy for all women. However, early screening (first trimester or early second trimester) may be recommended if you have risk factors such as: previous gestational diabetes, strong family history of diabetes, obesity (BMI ≥30), previous baby with macrosomia, polycystic ovary syndrome (PCOS), or certain medical conditions. Your healthcare provider will determine the appropriate screening schedule based on your individual risk factors and medical history.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}
