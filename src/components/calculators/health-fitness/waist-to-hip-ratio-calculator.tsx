
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
import { Ruler } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  waist: z.number().positive(),
  hip: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

const getWhrCategory = (whr: number, sex: 'male' | 'female') => {
  const categories = sex === 'female' ? 
    { low: 0.80, moderate: 0.85 } :
    { low: 0.90, moderate: 0.99 };

  if (whr < categories.low) return { name: 'Low Risk', color: 'text-green-500' };
  if (whr <= categories.moderate) return { name: 'Moderate Risk', color: 'text-yellow-500' };
  return { name: 'High Risk', color: 'text-red-500' };
};

export default function WaistToHipRatioCalculator() {
  const [result, setResult] = useState<{ whr: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    const whr = values.waist / values.hip;
    setResult({ whr, category: getWhrCategory(whr, values.sex) });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Waist-to-Hip Ratio (WHR)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.whr.toFixed(2)}</p>
                    <p className={`text-2xl font-semibold ${result.category.color}`}>{result.category.name}</p>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Waist-to-Hip Ratio Calculator Guide: Assessing Abdominal Fat and Metabolic Disease Risk" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to calculating the Waist-to-Hip Ratio (WHR), understanding WHO-defined risk cut-offs for men and women, comparing WHR to BMI, and strategies to reduce central body fat to lower the risk of heart disease and Type 2 Diabetes." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Definitive Guide to the Waist-to-Hip Ratio (WHR) Calculator</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on WHO and major health organization guidelines. It is not a diagnostic tool. Consult a healthcare provider for any health concerns or before starting a weight management program.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">WHR Explained: Why Fat Distribution Matters More Than Weight</a></li>
        <li><a href="#measurement">How to Measure Your Waist and Hips Accurately (WHO Protocol)</a></li>
        <li><a href="#calculation">The WHR Formula and Interpretation for Men and Women</a></li>
        <li><a href="#risk-levels">Official Health Risk Cut-Offs (Low, Moderate, High)</a></li>
        <li><a href="#comparison">WHR vs. BMI: Which is the Better Risk Predictor?</a></li>
        <li><a href="#intervention">Targeted Strategies to Improve a High WHR</a></li>
        <li><a href="#consult">Monitoring and Professional Consultation</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">WHR Explained: Why Fat Distribution Matters More Than Weight</h2>
    <p itemProp="description">The **Waist-to-Hip Ratio (WHR)** is a simple, yet powerful anthropometric measurement used to assess the distribution of body fat. Unlike the Body Mass Index (BMI), which measures total body mass against height, WHR focuses specifically on **central adiposity**—the fat stored around the abdomen and visceral organs. Research has definitively shown that where you carry your fat is a stronger predictor of disease risk than simply how much you weigh overall.</p>
    
    <p>A high WHR indicates an **"apple" body shape** (more weight carried around the middle), which is associated with a significantly increased risk of metabolic and cardiovascular diseases. Conversely, a lower WHR indicates a **"pear" body shape** (more weight carried around the hips and thighs), which is generally linked to better metabolic health.</p>
    
    <p>This calculator guide will equip you with the precise knowledge needed to measure your WHR correctly, interpret the World Health Organization's (WHO) risk categories, and understand why this ratio is a vital metric in preventing conditions like **Type 2 Diabetes**, **heart disease**, and **stroke**.</p>

    <h2 id="measurement" className="text-xl font-bold text-foreground mt-8">How to Measure Your Waist and Hips Accurately (WHO Protocol)</h2>
    <p>Accurate measurement is critical, as a few centimeters can drastically change your risk category. Follow the established WHO protocol for precision:</p>

    <h3 className="font-semibold text-foreground mt-6">Step 1: Measuring Waist Circumference (WC)</h3>
    <p>The waist measurement should be taken at the anatomical midpoint to capture true abdominal fat, not just the narrowest point of the body.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand upright, feet shoulder-width apart, and breathe out gently.</li>
        <li>**Location:** Find the **midpoint between the bottom of your last palpable rib** and the **top of your hip bone (iliac crest)**. This point is often just above the naval.</li>
        <li>**Technique:** Wrap a non-stretchable tape measure snugly around this point, ensuring the tape is parallel to the floor. Do not pull the tape tight enough to compress the skin.</li>
        <li>**Record:** Note the measurement in either inches or centimeters.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Step 2: Measuring Hip Circumference (HC)</h3>
    <p>The hip measurement is taken at the widest point of the buttocks and hip region.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand upright with your feet together.</li>
        <li>**Location:** Measure the circumference around the **widest part of your buttocks**.</li>
        <li>**Technique:** Ensure the tape measure is level and parallel to the floor all the way around.</li>
        <li>**Record:** Note the measurement using the **same units** (inches or centimeters) as the waist measurement.</li>
    </ul>

    <h2 id="calculation" className="text-xl font-bold text-foreground mt-8">The WHR Formula and Interpretation for Men and Women</h2>
    <p>The WHR calculator executes a simple division, but the resulting number must be interpreted differently based on biological sex due to natural differences in fat storage (gynoid vs. android distribution).</p>

    <h3 className="font-semibold text-foreground mt-6">The Calculation Formula</h3>
    <pre><code>Waist-to-Hip Ratio (WHR) = Waist Circumference &divide; Hip Circumference</code></pre>

    <h3 className="font-semibold text-foreground mt-6">Interpreting Your WHR</h3>
    <p>A lower ratio is strongly correlated with a lower risk of cardiovascular disease. The classification is gender-specific:</p>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Health Risk Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Women (WHR)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Men (WHR)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Low Risk (Healthy)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">0.80 or Lower</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">0.90 or Lower</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Moderate Risk</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">0.81 – 0.85</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">0.91 – 0.99</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>High Risk (Abdominal Obesity)</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">0.86 or Higher</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">1.00 or Higher</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p class="citation"><em>Source: Adapted from World Health Organization (WHO) Guidelines on abdominal obesity. A WHR of 1.0 or higher is considered a major health concern for both sexes.</em></p>

    <h2 id="comparison" className="text-xl font-bold text-foreground mt-8">WHR vs. BMI: Which is the Better Risk Predictor?</h2>
    <p>WHR is often considered superior to **BMI (Body Mass Index)** for predicting metabolic risks because it addresses the dangerous nature of **visceral fat**—the fat stored deep inside the abdomen that surrounds the organs (liver, pancreas, kidneys). This visceral fat is metabolically active, secreting inflammatory chemicals that lead to insulin resistance, high blood pressure, and dyslipidemia (unhealthy cholesterol levels).</p>

    <h3 className="font-semibold text-foreground mt-6">The Protective Nature of Hip/Gluteal Fat</h3>
    <p>Studies have shown that carrying fat around the hips and thighs (subcutaneous fat) may actually be **metabolically protective**. Conversely, WHR is specifically designed to highlight the high-risk "apple" shape, making it a more direct indicator of cardiovascular and diabetic risk than BMI, especially for athletes or older adults whose muscle mass skews their BMI readings.</p>

    <h3 className="font-semibold text-foreground mt-6">The Emerging Metric: Waist-to-Height Ratio (WHtR)</h3>
    <p>Some newer research suggests the **Waist-to-Height Ratio (WHtR)**, where your waist should be less than half your height (W/H &lt; 0.5), is even simpler and potentially a better indicator of risk than WHR. Regardless, both WHR and WHtR emphasize that **abdominal circumference is the most critical measurement.**</p>

    <h2 id="intervention" className="text-xl font-bold text-foreground mt-8">Targeted Strategies to Improve a High WHR (Reducing Central Fat)</h2>
    <p>Improving a high WHR is achievable, but it requires a targeted focus on reducing central/abdominal fat, as fat loss is rarely spot-specific.</p>

    <h3 className="font-semibold text-foreground mt-6">Dietary Strategies for Visceral Fat Reduction</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Calorie Deficit is King:** Overall weight loss is necessary, achieved by consistently consuming fewer calories than you burn.</li>
        <li>**Prioritize Soluble Fiber:** Increase intake of foods like oats, beans, and vegetables. Fiber helps regulate blood sugar and insulin levels, which are key drivers of visceral fat storage.</li>
        <li>**Eliminate Sugar and Refined Carbs:** Excess sugar (especially fructose) is preferentially converted to visceral fat in the liver. Cut back on sugary drinks and processed foods.</li>
        <li>**Boost Protein and Healthy Fats:** A diet high in lean protein and monounsaturated fats (like olive oil and avocados) promotes satiety and supports fat loss over muscle loss.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Exercise and Lifestyle Interventions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Aerobic Exercise:** Regular cardio (brisk walking, jogging, cycling) is highly effective at mobilizing and burning **visceral fat**, even more so than subcutaneous fat. Aim for at least 150 minutes of moderate activity weekly.</li>
        <li>**High-Intensity Interval Training (HIIT):** Short bursts of intense activity followed by rest periods can be very effective at reducing abdominal fat.</li>
        <li>**Manage Chronic Stress:** High levels of the stress hormone **cortisol** are directly linked to increased fat storage around the abdomen. Implement stress-reduction techniques like deep breathing, meditation, or mindfulness to manage daily pressure spikes.</li>
        <li>**Improve Sleep Quality:** Poor sleep (less than 7 hours) disrupts hormones (ghrelin and leptin) that regulate appetite, leading to increased hunger and visceral fat gain.</li>
    </ul>

    <h2 id="consult" className="text-xl font-bold text-foreground mt-8">Monitoring and Professional Consultation</h2>
    <p>WHR is an excellent metric for tracking progress. If your WHR is in the **Moderate or High Risk** category, or if you have other existing conditions (e.g., high blood pressure, elevated glucose), it is essential to involve a healthcare professional.</p>

    <h3 className="font-semibold text-foreground mt-6">Next Steps for a High WHR</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Consult Your Doctor:** Discuss your WHR, BMI, and other health markers to determine your overall metabolic risk.</li>
        <li>**Targeted Testing:** Your doctor may recommend blood tests for **glucose/HbA1c** (diabetes risk), **lipid profile** (cholesterol), and **blood pressure** to get a complete picture of your health.</li>
        <li>**Work with a Dietitian:** A registered dietitian can provide a tailored nutrition plan that specifically targets the reduction of visceral fat while ensuring adequate nutrient intake.</li>
    </ul>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using evidence and guidelines from the World Health Organization (WHO), the American Heart Association (AHA), and major clinical studies on obesity and metabolic health risk prediction.</p>
    </div>
</section>
    </div>
  );
}
