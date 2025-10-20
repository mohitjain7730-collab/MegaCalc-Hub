'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  systolic: z.number().positive(),
  diastolic: z.number().positive(),
  age: z.number().positive(),
  gender: z.enum(['male', 'female']),
  smoking: z.enum(['yes', 'no']),
  diabetes: z.enum(['yes', 'no'])
});
type FormValues = z.infer<typeof formSchema>;

export default function BloodPressureRiskCalculator() {
  const [risk, setRisk] = useState<{ category: string; riskLevel: string; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      systolic: undefined, 
      diastolic: undefined, 
      age: undefined, 
      gender: 'male', 
      smoking: 'no', 
      diabetes: 'no' 
    } 
  });

  const onSubmit = (v: FormValues) => {
    let category = 'Normal';
    let riskLevel = 'Low';
    let recommendations: string[] = [];
    
    // Blood pressure categories
    if (v.systolic < 120 && v.diastolic < 80) {
      category = 'Normal';
      riskLevel = 'Low';
    } else if (v.systolic < 130 && v.diastolic < 80) {
      category = 'Elevated';
      riskLevel = 'Low-Moderate';
    } else if ((v.systolic >= 130 && v.systolic < 140) || (v.diastolic >= 80 && v.diastolic < 90)) {
      category = 'Stage 1 Hypertension';
      riskLevel = 'Moderate';
    } else if (v.systolic >= 140 || v.diastolic >= 90) {
      category = 'Stage 2 Hypertension';
      riskLevel = 'High';
    }
    
    // Additional risk factors
    let riskScore = 0;
    if (v.age > 65) riskScore += 1;
    if (v.gender === 'male') riskScore += 1;
    if (v.smoking === 'yes') riskScore += 2;
    if (v.diabetes === 'yes') riskScore += 2;
    
    if (riskScore >= 4) riskLevel = 'Very High';
    else if (riskScore >= 2) riskLevel = 'High';
    else if (riskScore >= 1) riskLevel = 'Moderate';
    
    // Generate recommendations
    if (category.includes('Hypertension')) {
      recommendations.push('Consult with a healthcare provider for blood pressure management');
      recommendations.push('Consider lifestyle modifications including diet and exercise');
      recommendations.push('Monitor blood pressure regularly at home');
    }
    if (v.smoking === 'yes') {
      recommendations.push('Quit smoking to reduce cardiovascular risk');
    }
    if (v.diabetes === 'yes') {
      recommendations.push('Work with healthcare team to manage blood sugar levels');
    }
    if (v.age > 65) {
      recommendations.push('Consider regular cardiovascular health screenings');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current healthy lifestyle habits');
      recommendations.push('Continue regular health checkups');
    }
    
    let opinion = 'Your blood pressure appears to be in a healthy range. Continue maintaining a healthy lifestyle.';
    if (category.includes('Hypertension')) {
      opinion = 'Your blood pressure readings indicate hypertension. Please consult with a healthcare provider for proper evaluation and treatment.';
    } else if (category === 'Elevated') {
      opinion = 'Your blood pressure is slightly elevated. Focus on lifestyle modifications to prevent progression to hypertension.';
    }
    
    setRisk({ category, riskLevel, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="systolic" render={({ field }) => (
              <FormItem><FormLabel>Systolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diastolic" render={({ field }) => (
              <FormItem><FormLabel>Diastolic BP (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Gender</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="smoking" render={({ field }) => (
              <FormItem><FormLabel>Current Smoker</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="diabetes" render={({ field }) => (
              <FormItem><FormLabel>Diabetes</FormLabel><FormControl><Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Assess Risk</Button>
        </form>
      </Form>

      {risk && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Blood Pressure Risk Assessment</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{risk.category}</p><p className="text-sm text-muted-foreground">Category</p></div>
              <div><p className="text-2xl font-bold">{risk.riskLevel}</p><p className="text-sm text-muted-foreground">Risk Level</p></div>
            </div>
            <CardDescription className="text-center mb-4">{risk.opinion}</CardDescription>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">Recommendations:</p>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                {risk.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <BloodPressureGuide />
        <EmbedWidget calculatorSlug="blood-pressure-risk-calculator" calculatorName="Blood Pressure Risk Calculator" />
      </div>
    </div>
  );
}

function RelatedCalculators() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Calculators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/category/health-fitness/cardiovascular-disease-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cardiovascular Disease Risk Calculator
          </Link>
          <Link href="/category/health-fitness/heart-attack-framingham-risk-calculator" className="text-primary underline hover:text-primary/80">
            Heart Attack (Framingham) Risk Calculator
          </Link>
          <Link href="/category/health-fitness/stroke-risk-calculator" className="text-primary underline hover:text-primary/80">
            Stroke Risk Calculator
          </Link>
          <Link href="/category/health-fitness/cholesterol-risk-calculator" className="text-primary underline hover:text-primary/80">
            Cholesterol Risk Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function BloodPressureGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Blood Pressure Risk Calculator Guide: Understanding Hypertension Stages and ASCVD Risk" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to interpreting blood pressure readings (systolic and diastolic), the official AHA/ACC stages of hypertension, how high blood pressure contributes to cardiovascular risk (ASCVD/PREVENT), and essential steps to lower blood pressure." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Blood Pressure Risk Calculator Guide: Staging Hypertension and Assessing Heart Risk</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information based on clinical guidelines (AHA, ACC, WHO). It is not a substitute for medical diagnosis or treatment. Consult a healthcare provider for any blood pressure concerns or before making changes to medication or lifestyle.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">The Silent Killer: Why Blood Pressure Risk is Critical</a></li>
        <li><a href="#staging">Interpreting Your Numbers: Official Blood Pressure Stages (AHA/ACC)</a></li>
        <li><a href="#calculator-role">The Calculator's Role: BP in Comprehensive Cardiovascular Risk Scores</a></li>
        <li><a href="#risk-factors">Key Risk Factors for Hypertension and Complications</a></li>
        <li><a href="#actionable">Actionable Strategies to Achieve an Optimal Blood Pressure</a></li>
        <li><a href="#hypertensive-crisis">Hypertensive Crisis: Know When to Seek Emergency Care</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">The Silent Killer: Why Blood Pressure Risk is Critical</h2>
    <p itemProp="description">Blood pressure is the force of your blood against the walls of your arteries. When this pressure is chronically too high, a condition called **hypertension**, it is the most prevalent and modifiable risk factor for serious cardiovascular events globally. Hypertension, often called the "silent killer" because it rarely presents symptoms in its early stages, causes damage by forcing the heart to work harder and weakening and narrowing the arteries over time.</p>

    <p>A **Blood Pressure Risk Calculator** helps translate your readings (Systolic and Diastolic) into a clearer risk profile, serving as an essential screening and motivational tool for intervention. High blood pressure is a leading cause of heart attack, stroke, heart failure, chronic kidney disease, and cognitive decline.</p>

    <h3 className="font-semibold text-foreground mt-6">Understanding the Two Numbers</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Systolic Pressure (Top Number):** The pressure in your arteries when your heart beats (contracts). This number is the main focus for risk assessment, especially for people over 50.</li>
        <li>**Diastolic Pressure (Bottom Number):** The pressure in your arteries when your heart rests between beats.</li>
    </ul>

    <h2 id="staging" className="text-xl font-bold text-foreground mt-8">Interpreting Your Numbers: Official Blood Pressure Stages (AHA/ACC)</h2>
    <p>The 2017/2025 guidelines from the American Heart Association (AHA) and American College of Cardiology (ACC) define five key blood pressure categories based on multiple, consistent readings. **Your goal is to be in the Normal range.**</p>

    <h3 className="font-semibold text-foreground mt-6">Blood Pressure Categories (mg/dL)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Systolic (Top Number)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">AND/OR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Diastolic (Bottom Number)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Action Recommended</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Normal</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Less than 120</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">and</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Less than 80</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Maintain a healthy lifestyle.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Elevated (Pre-Hypertension)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">120 – 129</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">and</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Less than 80</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Lifestyle changes required.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Stage 1 Hypertension</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">130 – 139</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">or</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">80 – 89</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Lifestyle change + medication may be considered based on overall risk.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Stage 2 Hypertension</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">140 or Higher</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">or</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">90 or Higher</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Lifestyle change + medication strongly recommended (often 2 agents).</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p className="citation"><em>Source: American Heart Association/American College of Cardiology Guidelines. Diagnosis requires an average of two or more office-based measurements taken on two separate occasions.</em></p>
    
    <h3 className="font-semibold text-foreground mt-6">The Importance of Accuracy</h3>
    <p>A true assessment of risk starts with proper measurement. Factors like the "white coat effect" (higher readings in a medical setting), improper cuff size, or a lack of rest before reading can skew results. Home blood pressure monitoring, when done correctly, is a vital tool for confirming a diagnosis and tracking the effectiveness of treatment.</p>

    <h2 id="calculator-role" className="text-xl font-bold text-foreground mt-8">The Calculator's Role: BP in Comprehensive Cardiovascular Risk Scores</h2>
    <p>Your blood pressure reading is not assessed in isolation. It is a critical input in advanced calculators that predict your overall risk of a heart event.</p>

    <h3 className="font-semibold text-foreground mt-6">The ASCVD and PREVENT Equations</h3>
    <p>The standard tools used by physicians—the **Atherosclerotic Cardiovascular Disease (ASCVD) Risk Estimator** and the newer **AHA PREVENT™ Equation**—use systolic blood pressure as a primary variable, alongside the following factors, to calculate your **10-year and 30-year risk** of heart attack, stroke, or heart failure:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Age, Sex, and Race/Ethnicity**</li>
        <li>**Total and HDL Cholesterol Levels**</li>
        <li>**Systolic Blood Pressure (Treated or Untreated)**</li>
        <li>**Diabetes Status**</li>
        <li>**Smoking Status**</li>
        <li>**Medication Use (for Hypertension/Statins)**</li>
    </ul>

    <p>The output of these calculators determines if a patient with Stage 1 Hypertension (130-139/80-89 mm Hg) requires immediate medication or can proceed with a 3- to 6-month trial of lifestyle change first. If your 10-year risk is estimated to be **7.5% or higher**, medication alongside lifestyle changes is often recommended.</p>

    <h2 id="risk-factors" className="text-xl font-bold text-foreground mt-8">Key Risk Factors for Hypertension and Complications</h2>
    <p>While blood pressure itself is the focus, understanding the factors that cause it to rise is the key to prevention and management. These factors are heavily weighted in any comprehensive risk calculator.</p>

    <h3 className="font-semibold text-foreground mt-6">Modifiable Risk Factors (Areas for Intervention)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Dietary Sodium (Salt):** High salt intake causes the body to retain fluid, significantly increasing blood volume and, consequently, blood pressure.</li>
        <li>**Obesity/Excess Weight:** Being overweight increases cardiac output and peripheral resistance, raising BP. Weight loss is one of the most effective non-drug therapies.</li>
        <li>**Physical Inactivity:** Lack of regular exercise weakens the heart and prevents the natural relaxation of blood vessels.</li>
        <li>**Excessive Alcohol Consumption:** Heavy and regular alcohol consumption is known to raise blood pressure.</li>
        <li>**Smoking:** Tobacco damages the arterial lining, causing them to stiffen and narrow (atherosclerosis), which chronically elevates BP and dramatically increases risk.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Complications: The Damage of Uncontrolled BP</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Heart Attack and Heart Failure:** Chronic strain weakens the heart muscle (failure) and damages the arteries, leading to plaque rupture and blockages (attack).</li>
        <li>**Stroke:** High pressure can cause an artery supplying the brain to burst (hemorrhagic stroke) or be blocked by a clot (ischemic stroke).</li>
        <li>**Chronic Kidney Disease (CKD):** High pressure damages the small blood vessels in the kidneys, impairing their ability to filter blood over time.</li>
        <li>**Dementia and Cognitive Decline:** Sustained high BP damages the brain's tiny blood vessels, which is now strongly linked to an increased risk of dementia.</li>
    </ul>

    <h2 id="actionable" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Achieve an Optimal Blood Pressure</h2>
    <p>Achieving a target BP of **less than 130/80 mm Hg** requires a multi-faceted approach. Lifestyle changes are the foundation of treatment, often proving as effective as a single medication.</p>

    <h3 className="font-semibold text-foreground mt-6">Dietary Approaches to Stop Hypertension (DASH Diet Principles)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sodium Reduction:** Aim for less than 1,500 mg per day, or at least no more than 2,300 mg (about one teaspoon of salt). Avoid processed and restaurant foods.</li>
        <li>**Increase Potassium and Magnesium:** These minerals counteract the effects of sodium. Focus on high-potassium foods like bananas, sweet potatoes, and spinach, and utilize salt substitutes where appropriate (unless contraindicated by kidney disease).</li>
        <li>**Eat More Fiber:** A high-fiber diet, rich in fruits, vegetables, and whole grains, is protective and contributes to overall cardiovascular health.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Lifestyle and Habit Control</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Regular Aerobic Exercise:** Aim for at least 150 minutes per week of moderate-intensity exercise (e.g., brisk walking). Consistent exercise strengthens the heart and makes blood vessels more flexible.</li>
        <li>**Quit Smoking Completely:** Smoking cessation is a non-negotiable step for BP control and overall risk reduction.</li>
        <li>**Stress Management:** Chronic stress elevates blood pressure through hormonal release (cortisol, adrenaline). Practice deep breathing, meditation, or mindfulness to manage daily pressure spikes.</li>
    </ul>

    <h2 id="hypertensive-crisis" className="text-xl font-bold text-foreground mt-8">Hypertensive Crisis: Know When to Seek Emergency Care</h2>
    <p>A severely elevated blood pressure reading is a medical emergency. While a calculator alerts you to long-term risk, recognizing the signs of a crisis is vital.</p>

    <h3 className="font-semibold text-foreground mt-6">What Constitutes a Hypertensive Crisis?</h3>
    <p>A reading of **higher than 180 mm Hg Systolic and/or higher than 120 mm Hg Diastolic** is dangerously high.</p>

    <h3 className="font-semibold text-foreground mt-6">Hypertensive Urgency vs. Emergency</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Hypertensive Urgency:** BP is above 180/120 mm Hg, but you have **NO** immediate symptoms of organ damage. **Action:** Call your doctor immediately for advice on safely lowering BP.</li>
        <li>**Hypertensive Emergency:** BP is above 180/120 mm Hg, AND you are experiencing symptoms like **chest pain, shortness of breath, sudden severe headache, numbness/weakness, or difficulty speaking.** **Action:** Call 911 or emergency services immediately. This signals ongoing damage to the brain, heart, or kidneys.</li>
    </ul>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using the latest clinical recommendations from the American College of Cardiology (ACC), the American Heart Association (AHA), and the World Health Organization (WHO).</p>
    </div>
</section>
  );
}
