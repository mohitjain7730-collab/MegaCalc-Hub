'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HandHeart, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().int().positive().optional(),
  sex: z.enum(['female', 'male']).optional(),
  bmi: z.number().positive().optional(),
  familyHistory: z.enum(['yes', 'no']).optional(),
  smoker: z.enum(['yes', 'no']).optional(),
  priorJointInjury: z.enum(['yes', 'no']).optional(),
  repetitiveOccupationalUse: z.enum(['yes', 'no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function compute(values: FormValues) {
  let score = 0;
  if (values.age && values.age >= 60) score += 3; else if (values.age && values.age >= 45) score += 2;
  if (values.sex === 'female') score += 1;
  if (values.bmi && values.bmi >= 30) score += 2; else if (values.bmi && values.bmi >= 25) score += 1;
  if (values.familyHistory === 'yes') score += 2;
  if (values.smoker === 'yes') score += 1;
  if (values.priorJointInjury === 'yes') score += 2;
  if (values.repetitiveOccupationalUse === 'yes') score += 1;
  let category: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 7) category = 'High'; else if (score >= 4) category = 'Moderate';
  return { score, category };
}

export default function ArthritisRiskScoreCalculator() {
  const [result, setResult] = useState<{ score: number; category: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: undefined, bmi: undefined, familyHistory: undefined, smoker: undefined, priorJointInjury: undefined, repetitiveOccupationalUse: undefined } });
  const onSubmit = (v: FormValues) => setResult(compute(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="female">Female</option><option value="male">Male</option></select></FormItem>)} />
            <FormField control={form.control} name="bmi" render={({ field }) => (<FormItem><FormLabel>BMI</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (<FormItem><FormLabel>Family History of Arthritis</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="smoker" render={({ field }) => (<FormItem><FormLabel>Current or Former Smoker</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="priorJointInjury" render={({ field }) => (<FormItem><FormLabel>Previous Joint Injury</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="repetitiveOccupationalUse" render={({ field }) => (<FormItem><FormLabel>Repetitive Occupational Use</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4"><HandHeart className="h-8 w-8 text-primary" /><CardTitle>Arthritis Risk</CardTitle></div>
            <CardDescription>Screening score based on common risk factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2"><p className="text-4xl font-bold">{result.score}</p><p className="text-xl font-semibold">{result.category} Risk</p></div>
            <div className="mt-4 p-4 rounded-md border"><div className="flex items-center gap-2 text-foreground"><Info className="h-4 w-4" /><span className="font-semibold">Interpretation</span></div><p className="mt-2 text-sm text-muted-foreground">{result.category === 'High' ? 'Multiple risk factors present. Consider weight management, joint-friendly activity, and a clinician visit for tailored guidance.' : result.category === 'Moderate' ? 'Some risk factors identified. Focus on strength, mobility, and body weight to support joint health.' : 'Few risk factors detected. Maintain regular activity, good sleep, and balanced nutrition.'}</p></div>
          </CardContent>
        </Card>
      )}

<section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Arthritis Risk Score Calculators: Assessing Your Risk for Joint Disease and Associated Heart Health" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to arthritis risk scores, including factors for Osteoarthritis and Rheumatoid Arthritis, the link to cardiovascular disease (CVD), and actionable prevention strategies." />

    <h1 className="text-2xl font-bold text-foreground mb-4">Arthritis Risk Score Calculators: Understanding Your Joint Health and Future Risk</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide is for informational and educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a rheumatologist or healthcare provider for diagnosis and personalized advice.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is an Arthritis Risk Score Calculator?</a></li>
        <li><a href="#types">Understanding the Major Types of Arthritis Risk</a></li>
        <li><a href="#components">Core Risk Factors Used in Arthritis Calculators</a></li>
        <li><a href="#ra-cvd">The Critical Link: Rheumatoid Arthritis and Cardiovascular Risk Scores</a></li>
        <li><a href="#prevention">Actionable Steps to Lower Your Arthritis Risk</a></li>
        <li><a href="#consult">When to Consult a Specialist</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is an Arthritis Risk Score Calculator?</h2>
    <p itemProp="description">An Arthritis Risk Score Calculator is a predictive tool designed to estimate an individual's likelihood of developing a specific form of arthritis, most commonly **Rheumatoid Arthritis (RA)**, over a defined period (e.g., 5 or 10 years). Unlike diagnostics, these calculators are primarily educational, using a combination of **genetic, demographic, and lifestyle factors** to provide a personalized risk profile.</p>
    
    <p>The output of these tools should be used not as a definitive diagnosis, but as a motivation to pursue proactive monitoring and lifestyle changes, especially for individuals with a strong family history of autoimmune disease.</p>

    <h2 id="types" className="text-xl font-bold text-foreground mt-8">Understanding the Major Types of Arthritis Risk</h2>
    <p>The term 'arthritis' covers over 100 conditions. Risk calculators often focus on the two most common types, which are driven by distinct sets of risk factors.</p>

    <h3 className="font-semibold text-foreground mt-6">1. Osteoarthritis (OA) Risk Factors (Wear and Tear)</h3>
    <p>OA is the most common form of arthritis, resulting from the wear and tear of cartilage cushioning the ends of bones. Its risk factors are primarily mechanical and metabolic:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Age:** The risk increases significantly after age 50.</li>
        <li>**Obesity/Excess Weight:** Extra body weight places immense pressure on weight-bearing joints (knees, hips) and also increases systemic **inflammation** due to fat tissue.</li>
        <li>**Joint Injury/Trauma:** Previous joint injuries (sports, accidents) drastically increase the risk of developing OA in that specific joint later in life.</li>
        <li>**Occupational Stress:** Jobs requiring repetitive motion, heavy lifting, or prolonged kneeling/squatting.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">2. Rheumatoid Arthritis (RA) Risk Factors (Autoimmune)</h3>
    <p>RA is a chronic inflammatory autoimmune disorder where the immune system mistakenly attacks the joint lining. The risk factors are a complex mix of genetics and environmental triggers:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Genetics/Family History:** A strong familial link, particularly with the presence of specific genes like HLA-DR4.</li>
        <li>**Biological Sex:** Women are 2-3 times more likely to develop RA than men.</li>
        <li>**Smoking:** Smoking is the strongest known **environmental trigger** for RA, increasing risk and often leading to more severe disease.</li>
        <li>**Exposure to Silica or Mineral Oil:** Certain environmental or occupational exposures.</li>
        <li>**Autoantibodies:** The presence of specific biomarkers like Anti-citrullinated protein antibodies (ACPAs) or Rheumatoid Factor (RF), often detected years before symptoms appear.</li>
    </ul>

    <h2 id="components" className="text-xl font-bold text-foreground mt-8">Core Risk Factors Used in Arthritis Calculators</h2>
    <p>A typical, personalized arthritis risk estimator (such as the Personalized Risk Estimator for Rheumatoid Arthritis - PRE-RA) pools several data points to generate a score. Users often need to input the following categories of information:</p>

    <h3 className="font-semibold text-foreground mt-6">Risk Input Components</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Demographic Data:** Age, Sex, and Ethnicity.</li>
        <li>**Family History:** History of RA or other autoimmune diseases in first-degree relatives (parents, siblings).</li>
        <li>**Biomarkers:** The presence of **Rheumatoid Factor (RF)** or **Anti-CCP (ACPA)** antibodies. These indicate a pre-clinical phase of RA, even without current symptoms.</li>
        <li>**Lifestyle Factors:** Current or past smoking status, Body Mass Index (BMI).</li>
        <li>**General Health Markers (for prediction):** The presence of other inflammatory conditions like **periodontal disease** (gum disease) which is linked to RA risk.</li>
    </ul>

    <h2 id="ra-cvd" className="text-xl font-bold text-foreground mt-8">The Critical Link: Rheumatoid Arthritis and Cardiovascular Risk Scores</h2>
    <p>One of the most critical reasons for assessing arthritis risk is its direct impact on **heart health**. Rheumatoid Arthritis is recognized as an independent, significant risk factor for **Atherosclerotic Cardiovascular Disease (ASCVD)**, heart attack, and stroke.</p>

    <h3 className="font-semibold text-foreground mt-6">Arthritis in Heart Risk Calculators (QRISK3 & ASCVD)</h3>
    <p>Standard cardiovascular risk calculators developed for the general population often **underestimate** the true heart risk in RA patients. For this reason, RA is a specific input in many advanced risk scores:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**QRISK3 (UK-based):** The QRISK3 risk calculator includes **Rheumatoid Arthritis** as a specific checkbox input, recognizing that systemic inflammation is a major contributor to heart disease.</li>
        <li>**ACC/AHA Guidelines (US-based):** The American College of Cardiology/American Heart Association guidelines identify RA as a **"risk enhancer"**—a chronic inflammatory condition that warrants more aggressive lipid management (e.g., statin therapy) even if the patient's traditional cholesterol scores are only borderline.</li>
        <li>**The 1.5 Multiplier:** The European League Against Rheumatism (EULAR) often recommends applying a **1.5 multiplier** to a patient's standard cardiovascular risk score if they have RA, to account for the hidden inflammatory risk.</li>
    </ul>
    <p>This inflammatory nature means that patients with RA can have a heart attack or stroke risk comparable to, or even higher than, patients with Type 2 Diabetes.</p>

    <h2 id="prevention" className="text-xl font-bold text-foreground mt-8">Actionable Steps to Lower Your Arthritis Risk</h2>
    <p>Regardless of the score generated by a calculator, specific, evidence-based lifestyle modifications can significantly reduce both the risk of onset and the severity of existing arthritis, while simultaneously improving heart health.</p>

    <h3 className="font-semibold text-foreground mt-6">Prevention Strategies: Diet and Weight Management</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Maintain a Healthy Weight:** Weight loss is arguably the most effective measure for **Osteoarthritis** by reducing joint load. For **Rheumatoid Arthritis**, weight loss reduces the number of inflammatory proteins (cytokines) released by fat cells.</li>
        <li>**Heart-Healthy Diet:** Emphasize an **anti-inflammatory diet** rich in fruits, vegetables, whole grains, and lean proteins, similar to the Mediterranean diet.</li>
        <li>**Increase Omega-3s:** Add more fatty fish (salmon, mackerel) to your diet. Omega-3 fatty acids are potent **anti-inflammatory agents** that help reduce joint swelling and systemic inflammation linked to RA.</li>
        <li>**Reduce Environmental Triggers:** Limit consumption of highly processed foods, sugar-sweetened beverages, and high-salt foods, which are known to promote inflammation.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Activity and Habit Modification</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Regular, Low-Impact Exercise:** At least 150 minutes of moderate activity weekly (swimming, walking, yoga). Exercise strengthens muscles supporting the joints and reduces overall body inflammation.</li>
        <li>**Quit Smoking:** Cessation is the single most important lifestyle change for reducing **RA risk** and preventing the disease from worsening.</li>
        <li>**Prioritize Oral Health:** Maintain excellent dental hygiene. Poor oral health, specifically **periodontal disease (gum disease)**, is strongly linked to RA onset due to shared inflammatory pathways.</li>
        <li>**Optimize Vitamin D Intake:** Ensure adequate Vitamin D levels through sun exposure or supplementation, as deficiency is linked to an increased risk of autoimmune diseases like RA.</li>
    </ul>

    <h2 id="consult" className="text-xl font-bold text-foreground mt-8">Beyond the Score: When to Consult a Specialist</h2>
    <p>A risk calculator is a screening tool, not a diagnostic one. If your score is elevated, or if you experience persistent symptoms, professional medical evaluation is necessary. Consult a rheumatologist or healthcare provider if you experience any of the following:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Persistent Joint Pain:** Pain that lasts for more than a few weeks.</li>
        <li>**Morning Stiffness:** Joint stiffness that lasts for **30 minutes or longer** after waking up (a hallmark of inflammatory arthritis like RA).</li>
        <li>**Symmetrical Swelling:** Swelling or tenderness that affects the same joint on both sides of the body (e.g., both wrists).</li>
        <li>**Redness, Heat, and Severe Fatigue:** Signs of systemic inflammation often associated with autoimmune arthritis.</li>
        <li>**A Family History:** If you have a first-degree relative with RA, early screening for autoantibodies may be recommended.</li>
    </ul>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using evidence from the Centers for Disease Control and Prevention (CDC), the American College of Cardiology (ACC), and key rheumatology research on risk prediction and prevention.</p>
    </div>
</section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/bmi-calculator">BMI</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength‑to‑Weight</Link></p>
      </div>
    </div>
  );
}


