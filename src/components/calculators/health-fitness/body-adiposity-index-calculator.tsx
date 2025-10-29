'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

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
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Body Adiposity Index
          </CardTitle>
          <CardDescription>
            Estimate your body fat percentage using hip circumference and height (weight-independent method)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <User className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Body Adiposity Index (BAI)</CardTitle>
                  <CardDescription>Estimated body fat percentage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
                    <CardDescription>This is your estimated body fat percentage based on the BAI formula.</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Hip Circumference</h4>
              <p className="text-muted-foreground">
                Measure around the widest part of your buttocks and hip region, with feet close together. Use a flexible tape measure, ensuring it's level with the floor and snug against the skin (not compressing). The hip area is highly correlated with overall fat mass, making it a critical component of the BAI formula. Measure consistently at the same location for accurate tracking.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Measure your height without shoes, standing straight against a wall. The formula uses height raised to the 1.5 power (height^1.5) to account for variations in body frame and create a stronger correlation with actual body fat percentage. This non-linear adjustment helps normalize the index across different body sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why BAI Doesn't Require Weight</h4>
              <p className="text-muted-foreground">
                Unlike BMI, BAI doesn't need body weight—just hip circumference and height. This makes it useful in settings where weight measurement is unavailable or unreliable. The formula was developed in 2011 as an alternative to BMI, utilizing the strong correlation between hip fat and total body fat mass, though it's generally considered a complementary tool rather than a replacement for BMI or WHtR.
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
              Explore other body composition and health assessment calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare BAI results with other methods of estimating body fat percentage.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate BMI to compare with BAI and get a more complete body composition picture.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">
                    Waist-to-Height Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Assess metabolic risk with WHtR, which may be superior to BAI for predicting health outcomes.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/relative-fat-mass-calculator" className="text-primary hover:underline">
                    Relative Fat Mass Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Another weight-independent method for estimating body fat percentage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section - All original content preserved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete Guide to Body Adiposity Index
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Ultimate Body Adiposity Index (BAI) Calculator Guide: Estimating Your Body Fat</h2>
            
            <p><em><strong>Disclaimer:</strong> This guide provides educational information based on scientific studies regarding the Body Adiposity Index (BAI). BAI is an estimate and should not replace clinical assessments like DEXA scans or professional medical advice. Consult a healthcare provider before making health decisions.</em></p>

            <h3 className="font-semibold text-foreground mt-6">What is the Body Adiposity Index (BAI)?</h3>
            <p>The **Body Adiposity Index (BAI)** is a newer method for estimating **body fat percentage** without requiring a measurement of body weight. Introduced by researchers in 2011, the BAI was developed as a potential alternative to the often-criticized Body Mass Index (BMI). It utilizes the relationship between a person's **hip circumference** and their **height** to predict their overall adiposity (body fat). The core advantage of BAI is its independence from a weighing scale, making it particularly useful in clinical settings or remote areas where access to accurate weight measurement is limited.</p>
            
            <p>The resulting BAI value is designed to directly correlate with a person's estimated percentage of body fat (%BF), a crucial metric for assessing metabolic health and chronic disease risk. Understanding this index provides a deeper look into body composition beyond simple weight status.</p>

            <h3 className="font-semibold text-foreground mt-6">The BAI Formula: Hip Circumference and Height</h3>
            <p>The calculation for the Body Adiposity Index is more complex than BMI, involving an exponential factor, but its components are easy to measure at home.</p>

            <h4 className="font-semibold text-foreground mt-4">The Calculation</h4>
            <p>The BAI formula requires hip circumference to be measured in centimeters (cm) and height in meters (m).</p>
            <p className="font-mono bg-muted p-2 rounded">Body Adiposity Index (BAI) = [ (Hip Circumference in cm) ÷ (Height in m)¹·⁵ ] − 18</p>

            <h4 className="font-semibold text-foreground mt-4">Why the Formula Uses These Metrics</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Hip Circumference:** The hip area is recognized as one of the body regions most highly correlated with overall fat mass, making it a critical input for estimating adiposity.</li>
                <li>**Height Raised to the 1.5 Power:** This non-linear adjustment was derived statistically to account for variations in height and body frame, providing a stronger correlation to body fat percentage as measured by the "gold standard" **Dual-Energy X-ray Absorptiometry (DXA) scans**.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Accurate Measurement Protocol for BAI</h3>
            <p>Accurate results depend entirely on precise measurement. Errors in hip circumference are the most common source of inaccuracy for BAI.</p>

            <h4 className="font-semibold text-foreground mt-4">Measuring Hip Circumference (HC)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Position:** Stand upright with your feet close together.</li>
                <li>**Location:** Measure the circumference around the **widest part of the buttocks and hip region**.</li>
                <li>**Technique:** Use a flexible tape measure, ensuring it is level with the floor and snug against the skin but not compressing the tissue.</li>
                <li>**Units:** The measurement must be converted to **centimeters** for the formula.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Measuring Height (Ht)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Position:** Stand against a wall without shoes, with heels, buttocks, and upper back touching the surface.</li>
                <li>**Technique:** Use a straight edge (like a ruler or book) placed flat on the head, perpendicular to the wall. Mark the point.</li>
                <li>**Units:** The measurement must be converted to **meters** for the formula.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">BAI Classification: Body Fat Percentage by Age and Sex</h3>
            <p>Unlike BMI, which uses a single number (kg/m²) for all adults, the resulting BAI score is treated as an estimated percentage of body fat (%BF). These estimated percentages are then categorized by age and sex, reflecting known biological differences in body composition.</p>

            <h4 className="font-semibold text-foreground mt-4">BAI Classification Chart (Estimated % Body Fat)</h4>
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                    <thead>
                        <tr className="bg-muted text-left">
                            <th className="border p-2">Category</th>
                            <th className="border p-2">Women (Ages 20-39)</th>
                            <th className="border p-2">Men (Ages 20-39)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2"><strong>Underweight/Low Fat</strong></td>
                            <td className="border p-2">Below 21%</td>
                            <td className="border p-2">Below 8%</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Healthy / Normal</strong></td>
                            <td className="border p-2">21% – 33%</td>
                            <td className="border p-2">8% – 21%</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Overweight</strong></td>
                            <td className="border p-2">33% – 39%</td>
                            <td className="border p-2">21% – 26%</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Obese</strong></td>
                            <td className="border p-2">Above 39%</td>
                            <td className="border p-2">Above 26%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold text-foreground mt-6">BAI vs. BMI: Strengths, Weaknesses, and the Scientific Debate</h3>
            <p>The introduction of BAI sparked a debate in the medical community regarding which simple anthropometric measure is the "best" predictor of health risk.</p>

            <h4 className="font-semibold text-foreground mt-4">BAI's Proposed Strengths</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Weight-Independent:** Does not require a scale, making it accessible everywhere.</li>
                <li>**Direct Adiposity Estimate:** The index value is intended to approximate the actual percentage of body fat, a feature BMI lacks.</li>
                <li>**Less Sex/Ethnicity Adjustment:** Initially proposed as a single formula suitable for both men and women across different ethnicities, simplifying large-scale data comparison.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">BAI's Limitations and Current Scientific Consensus</h4>
            <p>Despite its promise, subsequent validation studies have shown BAI has significant limitations:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Inaccurate Extremes:** BAI tends to **overestimate** body fat in muscular individuals (high lean mass) and **underestimate** fat in people with very low muscle mass (e.g., the elderly).</li>
                <li>**Risk Correlation:** Many studies have concluded that BAI **does not outperform** other simple measures like BMI, Waist Circumference (WC), or Waist-to-Height Ratio (WHtR) in predicting cardiometabolic risk factors (e.g., hypertension, dyslipidemia).</li>
                <li>**The Hip Paradox:** While the hip measurement is strongly correlated with total fat mass, abdominal measures like WC and WHtR are often **better predictors of dangerous visceral fat**, which is the primary driver of metabolic disease.</li>
            </ul>
            <p className="text-sm italic mt-2">**Conclusion:** Currently, clinical consensus views BAI as a **useful complementary tool** for estimating body fat when weight is unknown or unreliable, but generally **not superior** to WHtR or a comprehensive BMI/WC assessment.</p>

            <h3 className="font-semibold text-foreground mt-6">Health Implications of a High BAI Score</h3>
            <p>Since a high BAI indicates excess body fat, the associated health risks are similar to those of high BMI and high abdominal circumference. These risks include those linked to both the quantity and the metabolic effect of excess adiposity:</p>

            <h4 className="font-semibold text-foreground mt-4">Increased Risk Factors for Chronic Disease</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Type 2 Diabetes and Insulin Resistance:** Excess fat, particularly around the core, drives the body's resistance to insulin.</li>
                <li>**Cardiovascular Disease (CVD):** Higher adiposity is linked to dyslipidemia (unhealthy cholesterol levels) and inflammation, increasing the risk of heart attack and stroke.</li>
                <li>**Hypertension (High Blood Pressure):** A high percentage of body fat is a major contributing factor to elevated blood pressure.</li>
                <li>**Joint Stress:** Excess mass contributes to mechanical load on joints, worsening conditions like osteoarthritis and chronic joint pain.</li>
                <li>**Metabolic Syndrome:** High BAI values are often associated with the presence of multiple risk factors that define metabolic syndrome (high blood sugar, high blood pressure, unhealthy lipid levels, and central obesity).</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Actionable Steps to Optimize Your Body Adiposity</h3>
            <p>Regardless of which metric you use (BAI, BMI, or WHtR), the intervention strategies for reducing excess body fat and improving body composition are universal and focused on sustained lifestyle changes.</p>

            <h4 className="font-semibold text-foreground mt-4">Strategies for Fat Reduction and Muscle Preservation</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Sustained Calorie Deficit:** Fat loss requires consuming fewer calories than the body burns. Use a Basal Metabolic Rate (BMR) calculator to estimate your energy needs.</li>
                <li>**Prioritize Strength Training:** Resistance exercise is essential for **preserving or increasing lean muscle mass**, which is critical for raising your metabolism and ensuring that weight loss is primarily fat mass, improving the accuracy of your BAI over time.</li>
                <li>**High-Protein Diet:** Adequate protein intake is vital for supporting muscle tissue during calorie restriction, ensuring that weight loss is fat-driven.</li>
                <li>**Consistent Aerobic Exercise:** Regular cardio burns calories and helps mobilize stored fat.</li>
                <li>**Sleep and Stress Management:** Chronic lack of sleep and high stress levels elevate cortisol, which promotes fat storage and inhibits muscle growth.</li>
            </ul>

            <div className="text-sm italic text-center mt-8 pt-4 border-t">
                <p>This guide is compiled using evidence from studies published in *Obesity (Silver Spring)* and *PLOS One*, reflecting the scientific consensus on the Body Adiposity Index and its relationship to cardiovascular and metabolic health risk.</p>
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
              Common questions about Body Adiposity Index and body fat estimation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a good BAI score?</h4>
              <p className="text-muted-foreground">
                BAI scores are interpreted as estimated body fat percentages. For women ages 20-39, healthy ranges are 21-33%, while for men, healthy ranges are 8-21%. Overweight ranges are 33-39% (women) and 21-26% (men), with values above these considered obese. However, BAI has limitations and should be used alongside other metrics like BMI and waist measurements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is BAI more accurate than BMI?</h4>
              <p className="text-muted-foreground">
                Research shows BAI doesn't consistently outperform BMI in predicting health risks. While BAI provides a direct body fat percentage estimate (which BMI doesn't), studies have found that BMI, waist circumference, and waist-to-height ratio often perform as well or better for predicting metabolic disease risk. BAI's main advantage is not requiring weight measurement, making it useful in certain clinical settings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why doesn't BAI require body weight?</h4>
              <p className="text-muted-foreground">
                BAI was specifically designed to work without weight because it uses the correlation between hip circumference and total body fat. Hip fat is highly correlated with overall fat mass, and when combined with height (raised to 1.5 power), it can estimate body fat percentage. This makes BAI useful in settings where scales aren't available, though accuracy may be reduced compared to methods that include weight.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can BAI be inaccurate for certain people?</h4>
              <p className="text-muted-foreground">
                Yes, BAI has known inaccuracies. It tends to overestimate body fat in very muscular individuals (because hip circumference includes muscle, not just fat) and underestimate fat in people with low muscle mass (like the elderly with sarcopenia). People with different body shapes (apple vs. pear) or those who store fat primarily in the abdomen (not hips) may also get less accurate BAI readings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use BAI or waist-to-height ratio?</h4>
              <p className="text-muted-foreground">
                Waist-to-height ratio (WHtR) is generally considered superior to BAI for predicting metabolic risk because it focuses on abdominal/visceral fat, which is more dangerous than hip fat. However, BAI can provide useful information about overall adiposity. Use both metrics together for a more complete picture—BAI for total fat estimation, WHtR for metabolic risk assessment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I improve my BAI score?</h4>
              <p className="text-muted-foreground">
                Lower your BAI by reducing overall body fat through a sustained calorie deficit (eating fewer calories than you burn), regular aerobic exercise to burn fat, and strength training to preserve muscle mass. Since BAI is based on hip circumference, reducing overall body fat will decrease your hip measurement and improve your score. Focus on sustainable lifestyle changes rather than quick fixes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does BAI work for all ethnicities?</h4>
              <p className="text-muted-foreground">
                BAI was initially proposed as a universal formula suitable for all ethnicities, but subsequent validation studies suggest it may need adjustments for different populations. Some research indicates BAI may be less accurate for certain Asian populations compared to European, African, or Mexican populations. When possible, use BAI alongside other metrics and consult with healthcare providers familiar with population-specific considerations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I track BAI over time to monitor progress?</h4>
              <p className="text-muted-foreground">
                Yes, you can track BAI over time, but do it consistently—measure at the same time of day, using the same measurement technique. BAI changes will reflect changes in hip circumference relative to height. However, since you're measuring hip fat specifically, if you lose fat primarily from other areas (like the abdomen), BAI might not change as dramatically as waist measurements would. For best results, track multiple metrics.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is hip circumference used instead of waist?</h4>
              <p className="text-muted-foreground">
                Hip circumference is strongly correlated with total body fat mass, making it useful for estimating overall adiposity. However, waist circumference is better for assessing metabolic risk because abdominal fat (visceral fat) is more dangerous. BAI uses hip because it's more representative of total fat stores, but this means BAI is less sensitive to the metabolically dangerous central fat that waist measurements capture.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is BAI better than DEXA scan for body fat measurement?</h4>
              <p className="text-muted-foreground">
                No, DEXA (Dual-Energy X-ray Absorptiometry) is the gold standard for accurate body composition measurement, providing precise breakdowns of fat mass, lean mass, and bone density. BAI is a simple estimation method that can't match DEXA's accuracy. However, BAI is free, accessible, and doesn't require special equipment, making it a useful screening tool. For the most accurate body composition assessment, DEXA is superior, but BAI can be valuable for regular tracking when DEXA isn't available.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
