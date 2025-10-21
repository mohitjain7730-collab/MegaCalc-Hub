'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Brain } from 'lucide-react';
import Link from 'next/link';

const items = [
  'Feeling unable to control important things',
  'Confidence in handling personal problems',
  'Things going your way',
  'Difficulties piling up too high to overcome',
  'Feeling stressed by unexpected events',
];

const formSchema = z.object({ scores: z.array(z.number().min(0).max(4)).length(items.length) });
type FormValues = z.infer<typeof formSchema>;

export default function StressLevelSelfAssessmentCalculator() {
  const [score, setScore] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { scores: Array(items.length).fill(undefined) } as unknown as FormValues });

  const onSubmit = (v: FormValues) => {
    const total = v.scores.reduce((s, x) => s + (x ?? 0), 0);
    setScore(total);
    let text = 'Moderate stress—use basic coping strategies and routines.';
    if (total <= 6) text = 'Low stress—keep healthy habits.';
    else if (total >= 14) text = 'High stress—consider speaking with a professional and adjusting workload.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {items.map((label, i) => (
              <FormField key={i} control={form.control} name={`scores.${i}` as const} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">{label}</FormLabel>
                  <FormControl>
                    <Slider min={0} max={4} step={1} defaultValue={[0]} value={[field.value ?? 0]} onValueChange={(v) => field.onChange(v[0])} />
                  </FormControl>
                </FormItem>
              )} />
            ))}
          </div>
          <Button type="submit">Get Stress Score</Button>
        </form>
      </Form>

      {score !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Brain className="h-8 w-8 text-primary" /><CardTitle>Stress Self‑Assessment</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">Score: {score} / 20</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <StressGuide />
    </div>
  );
}

function StressGuide() {
  return (
    <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HealthAssessmentTool">
    {/* SEO & SCHEMA METADATA (E-E-A-T FOCUS) */}
    <meta itemProp="name" content="Perceived Stress Scale (PSS-10) Calculator" />
    <meta itemProp="description" content="Use the clinically validated PSS-10 to assess your stress level score based on feelings of unpredictability, uncontrollability, and overload in the past month. (Not a diagnosis)." />
    <meta itemProp="keywords" content="stress level calculator, perceived stress scale PSS-10, PSS score interpretation, stress self-assessment, clinical stress tool, measure my stress level" />
    
    <div itemProp="potentialAction" itemScope itemType="https://schema.org/PerformAction">
        <meta itemProp="target" content="/stress-level-calculator" />
    </div>

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Perceived Stress Scale (PSS-10) Calculator: Assess Your Stress Score</h1>
    
    <p className="text-lg italic text-primary">This self-assessment uses the **Perceived Stress Scale (PSS-10)**, the most widely used clinical tool, to quantify how overloaded, uncontrollable, or unpredictable you felt in the last month.</p>
    
    <div className="border border-red-500 bg-red-50 p-3 rounded-md text-sm font-medium text-red-700">
        **Disclaimer:** This calculator is an informational self-assessment tool based on the PSS. It is **not a substitute for a professional diagnosis** by a licensed mental health clinician. If you are in crisis, please seek professional help immediately.
    </div>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#pss-validated" className="hover:underline">The PSS-10: The Gold Standard for Measuring Stress</a></li>
        <li><a href="#scoring" className="hover:underline">Scoring & Interpretation of Your PSS Score (0-40)</a></li>
        <li><a href="#health-risks" className="hover:underline">The Hidden Health Risks of Chronic Stress</a></li>
        <li><a href="#coping" className="hover:underline">Actionable Strategies for Stress Reduction</a></li>
        <li><a href="#faq" className="hover:underline">Stress Level Calculator FAQs</a></li>
    </ul>
<hr />
    {/* SECTION 1: VALIDATION */}
    <h2 id="pss-validated" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The PSS-10: The Gold Standard for Measuring Stress</h2>
    <p>The **Perceived Stress Scale (PSS)** is the most widely used psychological instrument for measuring subjective stress. Developed by Sheldon Cohen in 1983, the 10-item version (PSS-10) assesses how unpredictable, uncontrollable, and overloaded a person feels, specifically focusing on thoughts and feelings over the **last month**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Measuring Perceived Stress</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Subjective Experience:** The PSS measures your *perception* of stress, which is often a better predictor of health outcomes than measuring objective stressors (like divorce or job loss) alone.</li>
        <li>**Clinical Use:** It is a core screening tool used by psychologists and researchers worldwide due to its strong validation and easy-to-understand question format.</li>
        <li>**Assessment Period:** All questions should be answered quickly, reflecting your experience over the past month (or 30 days).</li>
    </ul>

<hr />
    {/* SECTION 2: SCORING & INTERPRETATION */}
    <h2 id="scoring" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Scoring & Interpretation of Your PSS Score (0-40)</h2>
    <p>Your final score can range from 0 to 40. A higher score directly correlates to a higher level of perceived stress. The scoring process involves **reverse-scoring** four specific items (Questions 4, 5, 7, and 8) to ensure that the total score accurately reflects stress level.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">General PSS Score Interpretation (Adults)</h3>
    <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score Range (0-40)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stress Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommendation</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**0 - 13**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Low Stress</td>
                    <td className="px-6 py-4 whitespace-nowrap">Maintain effective coping strategies.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**14 - 26**</td>
                    <td className="px-6 py-4 whitespace-nowrap">Moderate Stress</td>
                    <td className="px-6 py-4 whitespace-nowrap">Time to increase self-care and stress management techniques.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">**27 - 40**</td>
                    <td className="px-6 py-4 whitespace-nowrap">High Stress</td>
                    <td className="px-6 py-4 whitespace-nowrap">Strongly consider consulting a mental health professional.</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr />
    {/* SECTION 3: HEALTH RISKS */}
    <h2 id="health-risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hidden Health Risks of Chronic Stress (YMYL Focus)</h2>
    <p>A high PSS score is a serious warning sign. Chronic stress does not just affect your mood; it creates physiological damage by keeping the body in a prolonged state of emergency (sympathetic dominance).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Physiological Effects of High Perceived Stress</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Immune Suppression:** Elevated cortisol suppresses the immune system, making you more vulnerable to common colds, infections, and inflammation.</li>
        <li>**Cardiovascular Strain:** Chronic stress is linked to increased blood pressure, heart rate, and an elevated risk of cardiovascular events.</li>
        <li>**Metabolic Issues:** Stress disrupts the balance of glucose and insulin, contributing to the risk of Type 2 diabetes and increased abdominal fat storage.</li>
        <li>**Cognitive Decline:** Long-term stress can damage the hippocampus, impairing memory, focus, and executive function.</li>
    </ul>

<hr />
    {/* SECTION 4: COPING STRATEGIES */}
    <h2 id="coping" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Actionable Strategies for Stress Reduction</h2>
    <p>If your PSS score indicates moderate or high stress, incorporating clinically supported stress resets can begin the process of calming the nervous system.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Mindfulness and Vagal Tone Exercises</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**4-7-8 Breathing:** Inhale slowly for 4 seconds, hold for 7 seconds, and exhale slowly for 8 seconds. This is a direct method for stimulating the **Vagus Nerve** to initiate the parasympathetic response.</li>
        <li>**Mindfulness Practice:** Dedicate 5-10 minutes daily to meditation or body scanning to anchor your mind in the present moment, reducing rumination about future unpredictability.</li>
        <li>**Physical Activity:** Regular, moderate aerobic exercise (like brisk walking or jogging) is a highly effective way to metabolize stress hormones and improve mood.</li>
        <li>**Sleep Prioritization:** Address any existing **Sleep Debt** (use our calculator!) as poor sleep drastically reduces your ability to cope with daily stress.</li>
    </ul>

<hr />
    {/* SECTION 5: FAQ & LONG-TAIL KEYWORDS */}
    <h2 id="faq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Level Calculator FAQs</h2>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why does the PSS use reverse-scored questions?</h3>
    <p>The PSS uses both negatively worded questions (e.g., feeling nervous) and positively worded questions (e.g., feeling confident). Reverse-scoring the positive questions ensures that a high number always reflects high stress, while also helping to minimize a common testing error called **response bias**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Is the PSS-10 a diagnostic tool for anxiety or depression?</h3>
    <p>No. The PSS-10 measures general **perceived stress** only. While high stress scores are strongly associated with and predictive of mental health issues like anxiety and depression, the scale itself is **not a formal diagnostic instrument**. Only a qualified mental health professional can provide a diagnosis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Can I take this assessment frequently?</h3>
    <p>It is best to take the PSS **monthly** to track trends, as the questions are designed to reflect feelings over the last 30 days. Taking it too frequently may introduce day-to-day noise and reduce the accuracy of the long-term trend analysis.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This self-assessment is intended for informational use and is not medical advice. For persistent high stress, please seek consultation with a licensed professional.</p>
    </div>
</section>
  );
}