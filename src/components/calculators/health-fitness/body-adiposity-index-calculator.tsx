
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  hip: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BodyAdiposityIndexCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    let heightInM = values.height;
    let hipInCm = values.hip;

    if (values.unit === 'in') {
      heightInM = values.height * 0.0254;
      hipInCm = values.hip * 2.54;
    } else {
      // User entered height in cm, convert to meters for the formula
      heightInM = values.height / 100;
    }

    const bai = (hipInCm / Math.pow(heightInM, 1.5)) - 18;
    setResult(bai);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Units</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cm">Centimeters (cm)</SelectItem>
                      <SelectItem value="in">Inches (in)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="hip" render={({ field }) => (<FormItem><FormLabel>Hip Circumference ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Body Adiposity Index (BAI)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
                    <CardDescription>This is your estimated body fat percentage based on the BAI formula.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Body Adiposity Index (BAI) Calculator Guide: Estimating Body Fat Without Weight" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to the Body Adiposity Index (BAI), its formula (Hip Circ / Height^1.5 - 18), classification tables for men and women by age, comparison to BMI, and its role in estimating body fat percentage." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Body Adiposity Index (BAI) Calculator Guide: Estimating Your Body Fat</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information based on scientific studies regarding the Body Adiposity Index (BAI). BAI is an estimate and should not replace clinical assessments like DEXA scans or professional medical advice. Consult a healthcare provider before making health decisions.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is the Body Adiposity Index (BAI)?</a></li>
        <li><a href="#formula">The BAI Formula: Hip Circumference and Height</a></li>
        <li><a href="#measurement">Accurate Measurement Protocol for BAI</a></li>
        <li><a href="#interpretation">BAI Classification: Body Fat Percentage by Age and Sex</a></li>
        <li><a href="#comparison">BAI vs. BMI: Strengths, Weaknesses, and the Scientific Debate</a></li>
        <li><a href="#health-risks">Health Implications of a High BAI Score</a></li>
        <li><a href="#actionable">Actionable Steps to Optimize Your Body Adiposity</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is the Body Adiposity Index (BAI)?</h2>
    <p itemProp="description">The **Body Adiposity Index (BAI)** is a newer method for estimating **body fat percentage** without requiring a measurement of body weight. Introduced by researchers in 2011, the BAI was developed as a potential alternative to the often-criticized Body Mass Index (BMI). It utilizes the relationship between a person's **hip circumference** and their **height** to predict their overall adiposity (body fat). The core advantage of BAI is its independence from a weighing scale, making it particularly useful in clinical settings or remote areas where access to accurate weight measurement is limited.</p>
    
    <p>The resulting BAI value is designed to directly correlate with a person's estimated percentage of body fat (%BF), a crucial metric for assessing metabolic health and chronic disease risk. Understanding this index provides a deeper look into body composition beyond simple weight status.</p>

    <h2 id="formula" className="text-xl font-bold text-foreground mt-8">The BAI Formula: Hip Circumference and Height</h2>
    <p>The calculation for the Body Adiposity Index is more complex than BMI, involving an exponential factor, but its components are easy to measure at home.</p>

    <h3 className="font-semibold text-foreground mt-6">The Calculation</h3>
    <p>The BAI formula requires hip circumference to be measured in centimeters (cm) and height in meters (m).</p>
    <pre><code>Body Adiposity Index (BAI) = [ (Hip Circumference in cm) &divide; (Height in m)¹·⁵ ] &minus; 18</code></pre>

    <h3 className="font-semibold text-foreground mt-6">Why the Formula Uses These Metrics</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Hip Circumference:** The hip area is recognized as one of the body regions most highly correlated with overall fat mass, making it a critical input for estimating adiposity.</li>
        <li>**Height Raised to the 1.5 Power:** This non-linear adjustment was derived statistically to account for variations in height and body frame, providing a stronger correlation to body fat percentage as measured by the "gold standard" **Dual-Energy X-ray Absorptiometry (DXA) scans**.</li>
    </ul>

    <h2 id="measurement" className="text-xl font-bold text-foreground mt-8">Accurate Measurement Protocol for BAI</h2>
    <p>Accurate results depend entirely on precise measurement. Errors in hip circumference are the most common source of inaccuracy for BAI.</p>

    <h3 className="font-semibold text-foreground mt-6">Measuring Hip Circumference (HC)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand upright with your feet close together.</li>
        <li>**Location:** Measure the circumference around the **widest part of the buttocks and hip region**.</li>
        <li>**Technique:** Use a flexible tape measure, ensuring it is level with the floor and snug against the skin but not compressing the tissue.</li>
        <li>**Units:** The measurement must be converted to **centimeters** for the formula.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Measuring Height (Ht)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand against a wall without shoes, with heels, buttocks, and upper back touching the surface.</li>
        <li>**Technique:** Use a straight edge (like a ruler or book) placed flat on the head, perpendicular to the wall. Mark the point.</li>
        <li>**Units:** The measurement must be converted to **meters** for the formula.</li>
    </ul>

    <h2 id="interpretation" className="text-xl font-bold text-foreground mt-8">BAI Classification: Body Fat Percentage by Age and Sex</h2>
    <p>Unlike BMI, which uses a single number (kg/m²) for all adults, the resulting BAI score is treated as an estimated percentage of body fat (%BF). These estimated percentages are then categorized by age and sex, reflecting known biological differences in body composition.</p>

    <h3 className="font-semibold text-foreground mt-6">BAI Classification Chart (Estimated % Body Fat)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Women (Ages 20-39)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Men (Ages 20-39)</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Underweight/Low Fat</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 21%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 8%</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Healthy / Normal</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">21% &ndash; 33%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">8% &ndash; 21%</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Overweight</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">33% &ndash; 39%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">21% &ndash; 26%</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Obese</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 39%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 26%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="comparison" className="text-xl font-bold text-foreground mt-8">BAI vs. BMI: Strengths, Weaknesses, and the Scientific Debate</h2>
    <p>The introduction of BAI sparked a debate in the medical community regarding which simple anthropometric measure is the "best" predictor of health risk.</p>

    <h3 className="font-semibold text-foreground mt-6">BAI's Proposed Strengths</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Weight-Independent:** Does not require a scale, making it accessible everywhere.</li>
        <li>**Direct Adiposity Estimate:** The index value is intended to approximate the actual percentage of body fat, a feature BMI lacks.</li>
        <li>**Less Sex/Ethnicity Adjustment:** Initially proposed as a single formula suitable for both men and women across different ethnicities, simplifying large-scale data comparison.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">BAI's Limitations and Current Scientific Consensus</h3>
    <p>Despite its promise, subsequent validation studies have shown BAI has significant limitations:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Inaccurate Extremes:** BAI tends to **overestimate** body fat in muscular individuals (high lean mass) and **underestimate** fat in people with very low muscle mass (e.g., the elderly).</li>
        <li>**Risk Correlation:** Many studies have concluded that BAI **does not outperform** other simple measures like BMI, Waist Circumference (WC), or Waist-to-Height Ratio (WHtR) in predicting cardiometabolic risk factors (e.g., hypertension, dyslipidemia).</li>
        <li>**The Hip Paradox:** While the hip measurement is strongly correlated with total fat mass, abdominal measures like WC and WHtR are often **better predictors of dangerous visceral fat**, which is the primary driver of metabolic disease.</li>
    </ul>
    <p className="citation">**Conclusion:** Currently, clinical consensus views BAI as a **useful complementary tool** for estimating body fat when weight is unknown or unreliable, but generally **not superior** to WHtR or a comprehensive BMI/WC assessment.</p>

    <h2 id="health-risks" className="text-xl font-bold text-foreground mt-8">Health Implications of a High BAI Score</h2>
    <p>Since a high BAI indicates excess body fat, the associated health risks are similar to those of high BMI and high abdominal circumference. These risks include those linked to both the quantity and the metabolic effect of excess adiposity:</p>

    <h3 className="font-semibold text-foreground mt-6">Increased Risk Factors for Chronic Disease</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Type 2 Diabetes and Insulin Resistance:** Excess fat, particularly around the core, drives the body's resistance to insulin.</li>
        <li>**Cardiovascular Disease (CVD):** Higher adiposity is linked to dyslipidemia (unhealthy cholesterol levels) and inflammation, increasing the risk of heart attack and stroke.</li>
        <li>**Hypertension (High Blood Pressure):** A high percentage of body fat is a major contributing factor to elevated blood pressure.</li>
        <li>**Joint Stress:** Excess mass contributes to mechanical load on joints, worsening conditions like osteoarthritis and chronic joint pain.</li>
        <li>**Metabolic Syndrome:** High BAI values are often associated with the presence of multiple risk factors that define metabolic syndrome (high blood sugar, high blood pressure, unhealthy lipid levels, and central obesity).</li>
    </ul>

    <h2 id="actionable" className="text-xl font-bold text-foreground mt-8">Actionable Steps to Optimize Your Body Adiposity</h2>
    <p>Regardless of which metric you use (BAI, BMI, or WHtR), the intervention strategies for reducing excess body fat and improving body composition are universal and focused on sustained lifestyle changes.</p>

    <h3 className="font-semibold text-foreground mt-6">Strategies for Fat Reduction and Muscle Preservation</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Sustained Calorie Deficit:** Fat loss requires consuming fewer calories than the body burns. Use a Basal Metabolic Rate (BMR) calculator to estimate your energy needs.</li>
        <li>**Prioritize Strength Training:** Resistance exercise is essential for **preserving or increasing lean muscle mass**, which is critical for raising your metabolism and ensuring that weight loss is primarily fat mass, improving the accuracy of your BAI over time.</li>
        <li>**High-Protein Diet:** Adequate protein intake is vital for supporting muscle tissue during calorie restriction, ensuring that weight loss is fat-driven.</li>
        <li>**Consistent Aerobic Exercise:** Regular cardio burns calories and helps mobilize stored fat.</li>
        <li>**Sleep and Stress Management:** Chronic lack of sleep and high stress levels elevate cortisol, which promotes fat storage and inhibits muscle growth.</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using evidence from studies published in *Obesity (Silver Spring)* and *PLOS One*, reflecting the scientific consensus on the Body Adiposity Index and its relationship to cardiovascular and metabolic health risk.</p>
    </div>
</section>
    </div>
  );
}
