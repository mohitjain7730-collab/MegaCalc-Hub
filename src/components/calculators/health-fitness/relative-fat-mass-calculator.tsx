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
import { User, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  sex: z.enum(['male', 'female']),
  height: z.number().positive(),
  waist: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

export default function RelativeFatMassCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: 'male',
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    let rfm;
    if (values.sex === 'male') {
      rfm = 64 - (20 * (values.height / values.waist));
    } else {
      rfm = 76 - (20 * (values.height / values.waist));
    }
    setResult(rfm);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Relative Fat Mass
          </CardTitle>
          <CardDescription>
            Estimate your body fat percentage using height and waist circumference (weight-independent method)
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
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
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
                  <CardTitle>Relative Fat Mass (RFM)</CardTitle>
                  <CardDescription>Estimated body fat percentage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
                    <CardDescription>This is your estimated body fat percentage based on the RFM formula.</CardDescription>
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
                The RFM formula uses different constants for men (64) and women (76) because women naturally have higher body fat percentages due to reproductive and hormonal needs. This physiological difference is built into the formula, making RFM more accurate than metrics that use the same thresholds for both sexes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Measure your height without shoes, standing straight against a wall. Use the same units (cm or inches) as your waist measurement. Height provides the reference frame—taller people naturally have larger waists, so the formula adjusts for this by using the height-to-waist ratio. This makes RFM applicable across all heights.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Waist Circumference</h4>
              <p className="text-muted-foreground">
                Measure at the narrowest point between the bottom of your ribs and the top of your hip bone (iliac crest), usually just above the navel. Stand straight, exhale gently, and use a flexible tape measure that's snug but doesn't compress the skin. Waist measurement reflects central/visceral fat, which is strongly correlated with total body fat and metabolic risk.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why RFM is Weight-Independent</h4>
              <p className="text-muted-foreground">
                RFM doesn't require body weight, making it useful when weight measurement is unavailable. More importantly, by excluding weight, RFM avoids the BMI problem of misclassifying muscular individuals. RFM focuses on the height-to-waist ratio, which directly relates to central adiposity (the dangerous visceral fat) that drives metabolic disease risk.
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
                  Compare RFM results with other methods of estimating body fat percentage.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate BMI to see how RFM compares and why RFM may be more accurate for some individuals.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">
                    Waist-to-Height Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Another excellent metric for assessing metabolic risk using waist measurements.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-adiposity-index-calculator" className="text-primary hover:underline">
                    Body Adiposity Index Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare with BAI, another weight-independent method for estimating body fat.
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
              Complete Guide to Relative Fat Mass
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Ultimate Relative Fat Mass (RFM) Calculator Guide: Your True Body Fat Estimator</h2>
            
            <p><em><strong>Disclaimer:</strong> This guide provides educational information based on scientific studies regarding the Relative Fat Mass (RFM) index. RFM is an estimate and should not replace clinical body composition assessments (like DEXA) or professional medical advice. Consult a healthcare provider for any health concerns.</em></p>

            <h3 className="font-semibold text-foreground mt-6">What is Relative Fat Mass (RFM)?</h3>
            <p>The **Relative Fat Mass (RFM)** is a simple, non-invasive method developed in 2018 to estimate the percentage of **whole-body fat** using only two measurements: **height** and **waist circumference**. RFM was created to directly address the acknowledged limitations of the Body Mass Index (BMI), which often misclassifies individuals—especially those with high muscle mass—because it uses weight without considering body composition or fat distribution.</p>

            <p>The beauty of RFM lies in its simplicity and accuracy. By incorporating waist circumference, RFM targets central adiposity (visceral fat), which is the primary driver of metabolic risk. The resulting RFM score is designed to be approximately equal to your actual body fat percentage (%BF), giving you a far more insightful health metric than a raw BMI number.</p>

            <h3 className="font-semibold text-foreground mt-6">The Sex-Specific RFM Formula and Calculation</h3>
            <p>The RFM index is calculated using a linear equation that is adjusted based on biological sex (a crucial distinction, as women naturally have a higher body fat percentage than men).</p>

            <h4 className="font-semibold text-foreground mt-4">The RFM Formulas (Measurements in Centimeters)</h4>
            <p>The formulas below require both height and waist circumference to be in **centimeters (cm)** for accurate results:</p>
            <p className="font-mono bg-muted p-2 rounded">RFM (Men) = 64 − (20 × (Height / Waist Circumference))</p>
            <p className="font-mono bg-muted p-2 rounded mt-2">RFM (Women) = 76 − (20 × (Height / Waist Circumference))</p>

            <h4 className="font-semibold text-foreground mt-4">Anatomy of the Formula</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**The Base Constant (64 or 76):** These constants serve as sex-specific "starting points" designed to align the formula's output with the average physiological differences in body fat between men and women.</li>
                <li>**Height / Waist Circumference:** This ratio is the core input, reflecting the inverse relationship between height and adiposity relative to the waistline.</li>
            </ul>
            <p>The final RFM number is an estimate of your body fat percentage. For example, an RFM result of 25 means your estimated body fat is 25%.</p>

            <h3 className="font-semibold text-foreground mt-6">Accurate Measurement Protocol for RFM Inputs</h3>
            <p>The accuracy of the RFM calculator is highly dependent on precise measurement of the waist circumference. Follow these guidelines for consistency:</p>

            <h4 className="font-semibold text-foreground mt-4">Measuring Waist Circumference (WC)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Location:** Measure at the **narrowest point between the bottom of your ribs and the top of your hip bone (iliac crest)**. This location is often *above* the navel and is the clinically validated spot for assessing visceral fat.</li>
                <li>**Technique:** Use a flexible tape measure. Measure at the **end of a normal exhalation**. The tape must be snug against the skin but must **not compress** the underlying tissue.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">Measuring Height</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Position:** Measure height without shoes, standing straight with your back against a wall.</li>
                <li>**Consistency:** For all body composition metrics, measure at the same time of day (preferably in the morning) and under the same conditions to track progress accurately.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">RFM vs. BMI: Why RFM is a Better Predictor of Adiposity</h3>
            <p>The primary scientific finding supporting RFM is its superior correlation with fat mass compared to BMI. Studies involving gold-standard methods like DXA (Dual-Energy X-ray Absorptiometry) have validated RFM as a stronger predictor of whole-body fat percentage.</p>

            <h4 className="font-semibold text-foreground mt-4">RFM Resolves the Muscle Mass Misclassification</h4>
            <p>The key issue with BMI is its inclusion of **total body weight**, meaning it cannot distinguish between the weight of fat and the weight of metabolically protective muscle. RFM, by excluding weight and focusing on the ratio of height to the central fat store (waist), significantly reduces the misclassification error for two groups:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Muscular Individuals/Athletes:** RFM is less likely to incorrectly label a highly muscled person as "obese," as their lean mass does not inflate the calculation.</li>
                <li>**Older Adults:** Older adults often have a "normal" BMI due to sarcopenia (muscle loss) but can carry high levels of dangerous visceral fat. RFM is better at identifying this **"normal weight obesity"** risk.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">RFM and Sex-Based Physiology</h4>
            <p>RFM aligns better with physiological reality. Women, for reproductive reasons, maintain higher body fat percentages than men. While the BMI standard for obesity ($\ge 30$) is the same for both sexes, the RFM formula incorporates this physiological difference, resulting in higher healthy ranges for women (see table below).</p>

            <h3 className="font-semibold text-foreground mt-6">RFM Classification: Estimated Body Fat Ranges by Sex</h3>
            <p>The following chart summarizes the generally accepted categories for adults. These values represent the estimated percentage of body fat (%BF).</p>
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                    <thead>
                        <tr className="bg-muted text-left">
                            <th className="border p-2">Body Fat Category</th>
                            <th className="border p-2">RFM (Men)</th>
                            <th className="border p-2">RFM (Women)</th>
                            <th className="border p-2">Health Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2"><strong>Underweight/Low</strong></td>
                            <td className="border p-2">Below 8%</td>
                            <td className="border p-2">Below 21%</td>
                            <td className="border p-2">Potential for nutrient deficiency, hormonal issues</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Healthy / Normal</strong></td>
                            <td className="border p-2">8% – 20%</td>
                            <td className="border p-2">21% – 33%</td>
                            <td className="border p-2">Optimal health range</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Overweight/Increased Risk</strong></td>
                            <td className="border p-2">20% – 25%</td>
                            <td className="border p-2">33% – 39%</td>
                            <td className="border p-2">Increased risk of metabolic syndrome, diabetes</td>
                        </tr>
                        <tr>
                            <td className="border p-2"><strong>Obese</strong></td>
                            <td className="border p-2">Above 25%</td>
                            <td className="border p-2">Above 39%</td>
                            <td className="border p-2">Significantly increased risk of CVD and mortality</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h3 className="font-semibold text-foreground mt-6">RFM and Metabolic Risk: Heart Disease and Diabetes Prediction</h3>
            <p>RFM's power as a health predictor comes from its focus on the waist circumference, which is highly correlated with **visceral fat**. Visceral fat is metabolically active and directly drives most obesity-related complications.</p>

            <h4 className="font-semibold text-foreground mt-4">RFM's Superiority in Predicting Disease</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Diabetes:** Long-term prospective studies have shown RFM to be a **superior predictor of incident Type 2 Diabetes** compared to BMI, especially in women and younger adults.</li>
                <li>**Dyslipidemia and Metabolic Syndrome:** RFM has demonstrated better predictability for unhealthy lipid profiles (low HDL, high triglycerides) and the overall diagnosis of Metabolic Syndrome than BMI.</li>
                <li>**Mortality:** Research has indicated that RFM is a stronger predictor of all-cause mortality than BMI, and its use helps eliminate the confounding effect of muscle mass often seen in the misleading "obesity paradox."</li>
                <li>**Heart Failure (HF):** Recent findings suggest RFM is a robust predictor of incident HF, making it a valuable tool in cardiovascular screening.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Actionable Strategies to Optimize Your RFM</h3>
            <p>Since a high RFM score is a sign of excess body fat, the primary goal is to **reduce fat mass while preserving or building lean muscle mass**. This requires a strategic approach combining diet and exercise.</p>

            <h4 className="font-semibold text-foreground mt-4">Targeting Visceral Fat for Lower RFM</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Calorie Deficit:** Achieving a net loss of fat mass requires a sustained calorie deficit.</li>
                <li>**Consistent Aerobic Exercise:** Cardio (e.g., brisk walking, jogging, cycling) is highly effective at mobilizing and burning **visceral fat**, the most dangerous component of central adiposity, directly impacting the waist circumference input of the RFM formula.</li>
                <li>**Resistance Training:** This is essential to prevent the loss of lean muscle mass during dieting, ensuring that your weight loss is fat-driven, thus achieving a better body composition and a lower, healthier RFM.</li>
                <li>**Dietary Control:** Minimize refined sugars, trans fats, and processed foods. Prioritize lean protein and high-fiber foods to support metabolism and satiety.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Limitations and the Future of Body Composition Measurement</h3>
            <p>While RFM offers a significant improvement over BMI, it is still an estimation based on a mathematical formula and has limitations:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Ethnicity:** RFM was developed primarily on American populations (European, African, and Mexican descent) and may need minor adjustments or further validation for other ethnic groups (e.g., certain Asian populations).</li>
                <li>**Extremes:** Like most indices, RFM's accuracy can decrease at the extremes of body composition (very low body fat or morbid obesity).</li>
            </ul>
            
            <p>For the most complete health assessment, RFM should be used as a simple **screening and progress tracking tool**. Clinicians will use it in combination with other direct measurements, such as blood pressure, lipid panels, and potentially a **DEXA scan**, to create a comprehensive picture of your metabolic health.</p>

            <div className="text-sm italic text-center mt-8 pt-4 border-t">
                <p>This guide is compiled using evidence from studies published in *Scientific Reports*, *The International Journal of Obesity*, and clinical resources from MDCalc and the American Heart Association, supporting RFM's role as a key anthropometric index.</p>
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
              Common questions about Relative Fat Mass and body fat estimation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a good RFM score?</h4>
              <p className="text-muted-foreground">
                Healthy RFM ranges are 8-20% for men and 21-33% for women. Overweight ranges are 20-25% (men) and 33-39% (women), with values above these considered obese. These ranges account for physiological differences between sexes—women naturally have higher body fat percentages due to reproductive needs. RFM directly estimates body fat percentage, making it more intuitive than BMI.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is RFM more accurate than BMI?</h4>
              <p className="text-muted-foreground">
                Yes, RFM is generally more accurate than BMI for estimating body fat percentage and predicting health risks. RFM excludes weight (avoiding the muscle mass confusion), focuses on waist circumference (visceral fat indicator), and uses sex-specific formulas. Research shows RFM is better at predicting diabetes, metabolic syndrome, and mortality risk than BMI, especially for muscular individuals and older adults.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why does RFM use different formulas for men and women?</h4>
              <p className="text-muted-foreground">
                Women naturally have higher body fat percentages than men due to reproductive, hormonal, and physiological needs. The base constants (64 for men, 76 for women) in the RFM formula account for these biological differences. This makes RFM more accurate than metrics like BMI that use the same thresholds for both sexes, better reflecting the reality that a "healthy" body fat percentage differs between men and women.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I use RFM if I'm very muscular?</h4>
              <p className="text-muted-foreground">
                Yes, RFM is actually better for muscular individuals than BMI because it doesn't use total body weight. However, if you have very low body fat and high muscle mass, RFM might still slightly underestimate your actual body fat percentage in some cases. For extremely lean athletes, DEXA scan provides the most accurate measurement, but RFM is still useful for regular tracking and is far superior to BMI for this population.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I improve my RFM score?</h4>
              <p className="text-muted-foreground">
                Lower your RFM by reducing waist circumference through fat loss. Focus on a calorie deficit, regular cardio exercise (especially effective for visceral fat reduction), strength training to preserve muscle mass, adequate sleep, and stress management. Since RFM is based on waist size relative to height, reducing abdominal fat directly improves your score. Track changes monthly for meaningful progress.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does RFM work for all ethnicities?</h4>
              <p className="text-muted-foreground">
                RFM was developed and validated primarily on American populations (European, African, and Mexican descent). While the formula works well for these groups, some research suggests it may need minor adjustments for certain Asian populations, who may have different body fat distribution patterns. However, RFM still generally performs better than BMI across ethnic groups. When possible, use RFM alongside other health markers for a complete assessment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does RFM compare to DEXA scan?</h4>
              <p className="text-muted-foreground">
                DEXA (Dual-Energy X-ray Absorptiometry) is the gold standard for body composition measurement, providing precise breakdowns of fat mass, lean mass, and bone density. RFM is a simple estimation method that can't match DEXA's accuracy, but research shows RFM correlates well with DEXA-measured body fat percentage. RFM's advantages are that it's free, requires no special equipment, and can be done at home, making it excellent for regular tracking when DEXA isn't available.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is waist measurement so important for RFM?</h4>
              <p className="text-muted-foreground">
                Waist circumference reflects central/visceral fat—the dangerous fat stored around internal organs. Visceral fat is metabolically active, secreting inflammatory chemicals and driving insulin resistance, diabetes, and cardiovascular disease. The waist measurement is the key component that makes RFM better than BMI at identifying metabolic risk. The height-to-waist ratio directly relates to how much dangerous central fat you carry relative to your body size.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I track RFM over time to monitor progress?</h4>
              <p className="text-muted-foreground">
                Absolutely! RFM is excellent for tracking progress because it focuses on waist circumference, which is highly responsive to fat loss. Measure at the same time of day (morning is ideal), using the same technique, monthly for meaningful trends. As you lose abdominal fat, your waist circumference decreases, and your RFM score improves. This makes RFM a practical tool for monitoring the effectiveness of your diet and exercise program.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is RFM or waist-to-height ratio better?</h4>
              <p className="text-muted-foreground">
                Both are excellent metrics with similar purposes. RFM provides a direct body fat percentage estimate, while WHtR focuses on metabolic risk assessment. RFM is slightly more complex (requires sex input) but gives you a percentage number. WHtR is simpler (just waist divided by height) but less intuitive. Both are superior to BMI. For most purposes, you can use either—RFM if you want a body fat percentage, WHtR if you want a simple risk indicator. Many experts use both for a complete picture.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
