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
import { Ruler, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

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
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Waist-to-Hip Ratio
          </CardTitle>
          <CardDescription>
            Assess your body fat distribution and metabolic health risk using waist and hip measurements
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                    <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">Centimeters (cm)</SelectItem><SelectItem value="in">Inches (in)</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Ruler className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Waist-to-Hip Ratio (WHR)</CardTitle>
                  <CardDescription>Body fat distribution assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.whr.toFixed(2)}</p>
                    <p className={`text-2xl font-semibold ${result.category.color}`}>{result.category.name}</p>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {result.category.name === 'Low Risk' 
                          ? 'This indicates a healthier fat distribution pattern (pear shape), associated with lower metabolic risk.'
                          : result.category.name === 'Moderate Risk'
                          ? 'This suggests increased abdominal fat. Consider lifestyle changes to reduce central adiposity.'
                          : 'This indicates high abdominal fat (apple shape), significantly increasing risk of metabolic disease.'}
                      </p>
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
              <h4 className="font-semibold text-foreground mb-2">Sex</h4>
              <p className="text-muted-foreground">
                WHR risk categories differ by sex because men and women naturally store fat in different patterns. Men typically store more fat in the abdominal area (android/apple shape), while women often store more in the hips and thighs (gynoid/pear shape). The healthy ranges account for these biological differences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Waist Measurement</h4>
              <p className="text-muted-foreground">
                Measure at the midpoint between the bottom of your last rib and the top of your hip bone (iliac crest), usually just above the navel. Stand straight, exhale gently, and use a flexible tape measure that's snug but not compressing the skin. This measurement reflects central/abdominal fat, which is metabolically active and linked to health risks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Hip Measurement</h4>
              <p className="text-muted-foreground">
                Measure around the widest part of your buttocks and hips, with feet together. Ensure the tape is level and parallel to the floor. This measurement represents hip/thigh fat, which is generally less metabolically risky than abdominal fat. The ratio between waist and hip helps assess fat distribution patterns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why WHR Matters</h4>
              <p className="text-muted-foreground">
                Where you store fat matters more than how much you weigh. Abdominal fat (high WHR) is associated with increased risk of heart disease, diabetes, and metabolic syndrome because it's more metabolically active and can affect organ function. WHR is often a better predictor of health risk than BMI alone.
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
              Explore other body composition and health risk calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">
                    Waist-to-Height Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Another excellent indicator of abdominal fat and metabolic risk.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your overall body fat to complement your WHR assessment.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare your BMI with your WHR for a more complete health assessment.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/calorie-deficit-calculator" className="text-primary hover:underline">
                    Calorie Deficit Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the calorie deficit needed to reduce abdominal fat and improve WHR.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Complete Guide to Waist-to-Hip Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Definitive Guide to the Waist-to-Hip Ratio (WHR) Calculator</h2>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on WHO and major health organization guidelines. It is not a diagnostic tool. Consult a healthcare provider for any health concerns or before starting a weight management program.</em></p>

            <h3 className="font-semibold text-foreground mt-6">WHR Explained: Why Fat Distribution Matters More Than Weight</h3>
            <p>The **Waist-to-Hip Ratio (WHR)** is a simple, yet powerful anthropometric measurement used to assess the distribution of body fat. Unlike the Body Mass Index (BMI), which measures total body mass against height, WHR focuses specifically on **central adiposity**—the fat stored around the abdomen and visceral organs. Research has definitively shown that where you carry your fat is a stronger predictor of disease risk than simply how much you weigh overall.</p>
    
    <p>A high WHR indicates an **"apple" body shape** (more weight carried around the middle), which is associated with a significantly increased risk of metabolic and cardiovascular diseases. Conversely, a lower WHR indicates a **"pear" body shape** (more weight carried around the hips and thighs), which is generally linked to better metabolic health.</p>
    
    <p>This calculator guide will equip you with the precise knowledge needed to measure your WHR correctly, interpret the World Health Organization's (WHO) risk categories, and understand why this ratio is a vital metric in preventing conditions like **Type 2 Diabetes**, **heart disease**, and **stroke**.</p>

            <h3 className="font-semibold text-foreground mt-6">How to Measure Your Waist and Hips Accurately (WHO Protocol)</h3>
    <p>Accurate measurement is critical, as a few centimeters can drastically change your risk category. Follow the established WHO protocol for precision:</p>

            <h4 className="font-semibold text-foreground mt-4">Step 1: Measuring Waist Circumference (WC)</h4>
    <p>The waist measurement should be taken at the anatomical midpoint to capture true abdominal fat, not just the narrowest point of the body.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand upright, feet shoulder-width apart, and breathe out gently.</li>
        <li>**Location:** Find the **midpoint between the bottom of your last palpable rib** and the **top of your hip bone (iliac crest)**. This point is often just above the naval.</li>
        <li>**Technique:** Wrap a non-stretchable tape measure snugly around this point, ensuring the tape is parallel to the floor. Do not pull the tape tight enough to compress the skin.</li>
        <li>**Record:** Note the measurement in either inches or centimeters.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">Step 2: Measuring Hip Circumference (HC)</h4>
    <p>The hip measurement is taken at the widest point of the buttocks and hip region.</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand upright with your feet together.</li>
        <li>**Location:** Measure the circumference around the **widest part of your buttocks**.</li>
        <li>**Technique:** Ensure the tape measure is level and parallel to the floor all the way around.</li>
        <li>**Record:** Note the measurement using the **same units** (inches or centimeters) as the waist measurement.</li>
    </ul>

            <h3 className="font-semibold text-foreground mt-6">The WHR Formula and Interpretation for Men and Women</h3>
    <p>The WHR calculator executes a simple division, but the resulting number must be interpreted differently based on biological sex due to natural differences in fat storage (gynoid vs. android distribution).</p>

            <h4 className="font-semibold text-foreground mt-4">The Calculation Formula</h4>
            <p className="font-mono bg-muted p-2 rounded">Waist-to-Hip Ratio (WHR) = Waist Circumference ÷ Hip Circumference</p>

            <h4 className="font-semibold text-foreground mt-4">Interpreting Your WHR</h4>
    <p>A lower ratio is strongly correlated with a lower risk of cardiovascular disease. The classification is gender-specific:</p>
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                    <thead>
                        <tr className="bg-muted text-left">
                            <th className="border p-2">Health Risk Category</th>
                            <th className="border p-2">Women (WHR)</th>
                            <th className="border p-2">Men (WHR)</th>
                </tr>
            </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2"><strong>Low Risk (Healthy)</strong></td>
                            <td className="border p-2">0.80 or Lower</td>
                            <td className="border p-2">0.90 or Lower</td>
                </tr>
                <tr>
                            <td className="border p-2"><strong>Moderate Risk</strong></td>
                            <td className="border p-2">0.81 – 0.85</td>
                            <td className="border p-2">0.91 – 0.99</td>
                </tr>
                <tr>
                            <td className="border p-2"><strong>High Risk (Abdominal Obesity)</strong></td>
                            <td className="border p-2">0.86 or Higher</td>
                            <td className="border p-2">1.00 or Higher</td>
                </tr>
            </tbody>
        </table>
    </div>
            <p className="text-xs italic"><em>Source: Adapted from World Health Organization (WHO) Guidelines on abdominal obesity. A WHR of 1.0 or higher is considered a major health concern for both sexes.</em></p>

            <h3 className="font-semibold text-foreground mt-6">WHR vs. BMI: Which is the Better Risk Predictor?</h3>
    <p>WHR is often considered superior to **BMI (Body Mass Index)** for predicting metabolic risks because it addresses the dangerous nature of **visceral fat**—the fat stored deep inside the abdomen that surrounds the organs (liver, pancreas, kidneys). This visceral fat is metabolically active, secreting inflammatory chemicals that lead to insulin resistance, high blood pressure, and dyslipidemia (unhealthy cholesterol levels).</p>

            <h4 className="font-semibold text-foreground mt-4">The Protective Nature of Hip/Gluteal Fat</h4>
    <p>Studies have shown that carrying fat around the hips and thighs (subcutaneous fat) may actually be **metabolically protective**. Conversely, WHR is specifically designed to highlight the high-risk "apple" shape, making it a more direct indicator of cardiovascular and diabetic risk than BMI, especially for athletes or older adults whose muscle mass skews their BMI readings.</p>

            <h4 className="font-semibold text-foreground mt-4">The Emerging Metric: Waist-to-Height Ratio (WHtR)</h4>
    <p>Some newer research suggests the **Waist-to-Height Ratio (WHtR)**, where your waist should be less than half your height (W/H &lt; 0.5), is even simpler and potentially a better indicator of risk than WHR. Regardless, both WHR and WHtR emphasize that **abdominal circumference is the most critical measurement.**</p>

            <h3 className="font-semibold text-foreground mt-6">Targeted Strategies to Improve a High WHR (Reducing Central Fat)</h3>
    <p>Improving a high WHR is achievable, but it requires a targeted focus on reducing central/abdominal fat, as fat loss is rarely spot-specific.</p>

            <h4 className="font-semibold text-foreground mt-4">Dietary Strategies for Visceral Fat Reduction</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Calorie Deficit is King:** Overall weight loss is necessary, achieved by consistently consuming fewer calories than you burn.</li>
        <li>**Prioritize Soluble Fiber:** Increase intake of foods like oats, beans, and vegetables. Fiber helps regulate blood sugar and insulin levels, which are key drivers of visceral fat storage.</li>
        <li>**Eliminate Sugar and Refined Carbs:** Excess sugar (especially fructose) is preferentially converted to visceral fat in the liver. Cut back on sugary drinks and processed foods.</li>
        <li>**Boost Protein and Healthy Fats:** A diet high in lean protein and monounsaturated fats (like olive oil and avocados) promotes satiety and supports fat loss over muscle loss.</li>
    </ul>

            <h4 className="font-semibold text-foreground mt-4">Exercise and Lifestyle Interventions</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Aerobic Exercise:** Regular cardio (brisk walking, jogging, cycling) is highly effective at mobilizing and burning **visceral fat**, even more so than subcutaneous fat. Aim for at least 150 minutes of moderate activity weekly.</li>
        <li>**High-Intensity Interval Training (HIIT):** Short bursts of intense activity followed by rest periods can be very effective at reducing abdominal fat.</li>
        <li>**Manage Chronic Stress:** High levels of the stress hormone **cortisol** are directly linked to increased fat storage around the abdomen. Implement stress-reduction techniques like deep breathing, meditation, or mindfulness to manage daily pressure spikes.</li>
        <li>**Improve Sleep Quality:** Poor sleep (less than 7 hours) disrupts hormones (ghrelin and leptin) that regulate appetite, leading to increased hunger and visceral fat gain.</li>
    </ul>

            <h3 className="font-semibold text-foreground mt-6">Monitoring and Professional Consultation</h3>
    <p>WHR is an excellent metric for tracking progress. If your WHR is in the **Moderate or High Risk** category, or if you have other existing conditions (e.g., high blood pressure, elevated glucose), it is essential to involve a healthcare professional.</p>

            <h4 className="font-semibold text-foreground mt-4">Next Steps for a High WHR</h4>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Consult Your Doctor:** Discuss your WHR, BMI, and other health markers to determine your overall metabolic risk.</li>
        <li>**Targeted Testing:** Your doctor may recommend blood tests for **glucose/HbA1c** (diabetes risk), **lipid profile** (cholesterol), and **blood pressure** to get a complete picture of your health.</li>
        <li>**Work with a Dietitian:** A registered dietitian can provide a tailored nutrition plan that specifically targets the reduction of visceral fat while ensuring adequate nutrient intake.</li>
    </ul>
    
            <div className="text-sm italic text-center mt-8 pt-4 border-t">
        <p>This guide is compiled using evidence and guidelines from the World Health Organization (WHO), the American Heart Association (AHA), and major clinical studies on obesity and metabolic health risk prediction.</p>
    </div>
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
              Common questions about waist-to-hip ratio and abdominal fat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a good waist-to-hip ratio?</h4>
              <p className="text-muted-foreground">
                For women, a WHR of 0.80 or below is considered healthy (low risk). For men, 0.90 or below is healthy. Moderate risk ranges are 0.81-0.85 for women and 0.91-0.99 for men. High risk (abdominal obesity) is 0.86+ for women and 1.00+ for men. These ranges are based on WHO guidelines and reflect the increased metabolic risk associated with central fat storage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is WHR different for men and women?</h4>
              <p className="text-muted-foreground">
                Men and women naturally store fat in different patterns due to hormonal differences. Men typically store more fat in the abdominal area (android/apple pattern), while women often store more in the hips and thighs (gynoid/pear pattern). Women's bodies are designed to store fat in these areas for reproductive health, so healthy WHR ranges are higher for women. The risk categories account for these biological differences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I reduce my WHR by spot reducing fat from my waist?</h4>
              <p className="text-muted-foreground">
                Spot reduction (losing fat from a specific area through targeted exercises) is largely a myth. However, overall fat loss through calorie deficit, cardio exercise, and strength training will reduce waist circumference over time. Since you can't control where fat comes off, focus on overall body fat reduction, which will eventually reduce abdominal fat and improve your WHR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is WHR or waist-to-height ratio better?</h4>
              <p className="text-muted-foreground">
                Both are excellent predictors of metabolic risk. WHR compares waist to hip (assessing fat distribution), while WHtR compares waist to height (assessing central adiposity relative to body size). Some research suggests WHtR might be slightly better for predicting cardiovascular risk, but both provide valuable information. Consider using both metrics for a complete picture of your health risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How quickly can I improve my WHR?</h4>
              <p className="text-muted-foreground">
                Improvement depends on your starting point and consistency. With a proper calorie deficit, regular exercise, and lifestyle changes, you may see improvements in 2-3 months. However, significant changes typically take 6-12 months of consistent effort. Focus on sustainable changes rather than quick fixes—permanent improvements in WHR come from long-term lifestyle modifications.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I have a healthy BMI but high WHR?</h4>
              <p className="text-muted-foreground">
                Yes, this is called "normal weight obesity" or being "skinny fat." You can have a BMI in the normal range but carry excess abdominal fat, which still increases metabolic risk. This is why WHR is so valuable—it catches risks that BMI might miss. If your BMI is normal but WHR is high, you still need to focus on reducing central fat through diet and exercise.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does genetics affect WHR?</h4>
              <p className="text-muted-foreground">
                Yes, genetics play a role in fat distribution patterns. Some people are genetically predisposed to store more fat in the abdomen (apple shape) or hips (pear shape). However, lifestyle factors (diet, exercise, sleep, stress) also significantly influence where fat is stored and can override genetic tendencies to some extent. Even with genetic predispositions, you can improve your WHR through lifestyle changes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I measure WHR at different times of day?</h4>
              <p className="text-muted-foreground">
                For consistency, measure at the same time of day under similar conditions. Morning measurements (before eating) are ideal because your stomach is likely to be in a consistent state. Measure in the same way each time—same position, same tightness of tape measure. Consistency is more important than the specific time—what matters is tracking changes over time using the same measurement protocol.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can exercise alone improve WHR, or do I need to change my diet?</h4>
              <p className="text-muted-foreground">
                Both are important, but diet changes typically have a bigger impact on reducing waist circumference and improving WHR. Exercise helps burn calories, builds muscle (which can improve body composition), and specifically helps mobilize visceral fat. However, you can't out-exercise a poor diet—creating a calorie deficit through dietary changes is usually the primary driver of fat loss. Combine both for best results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I measure my WHR?</h4>
              <p className="text-muted-foreground">
                Monthly measurements are sufficient for tracking progress. WHR changes slowly (unlike daily weight fluctuations), so measuring too frequently isn't necessary and can lead to frustration. Measure at the same time of day, using the same technique, monthly for meaningful trends. Focus on long-term improvements rather than week-to-week changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
