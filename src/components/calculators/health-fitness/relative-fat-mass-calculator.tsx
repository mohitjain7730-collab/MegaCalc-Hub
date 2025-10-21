
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
import { User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (
                <FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><User className="h-8 w-8 text-primary" /><CardTitle>Relative Fat Mass (RFM)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(1)}%</p>
                    <CardDescription>This is your estimated body fat percentage based on the RFM formula.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Relative Fat Mass (RFM) Calculator Guide: Formula, Interpretation, and BMI Comparison" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to the Relative Fat Mass (RFM) formula (Height/Waist Circ), its sex-specific calculation, cut-offs for obesity, and why it is scientifically considered a more accurate predictor of body fat percentage than BMI." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Relative Fat Mass (RFM) Calculator Guide: Your True Body Fat Estimator</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information based on scientific studies regarding the Relative Fat Mass (RFM) index. RFM is an estimate and should not replace clinical body composition assessments (like DEXA) or professional medical advice. Consult a healthcare provider for any health concerns.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is Relative Fat Mass (RFM)?</a></li>
        <li><a href="#formula">The Sex-Specific RFM Formula and Calculation</a></li>
        <li><a href="#measurement">Accurate Measurement Protocol for RFM Inputs</a></li>
        <li><a href="#rfm-vs-bmi">RFM vs. BMI: Why RFM is a Better Predictor of Adiposity</a></li>
        <li><a href="#risk-levels">RFM Classification: Estimated Body Fat Ranges by Sex</a></li>
        <li><a href="#health-risks">RFM and Metabolic Risk: Heart Disease and Diabetes Prediction</a></li>
        <li><a href="#actionable">Actionable Strategies to Optimize Your RFM</a></li>
        <li><a href="#limitations">Limitations and the Future of Body Composition Measurement</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is Relative Fat Mass (RFM)?</h2>
    <p itemProp="description">The **Relative Fat Mass (RFM)** is a simple, non-invasive method developed in 2018 to estimate the percentage of **whole-body fat** using only two measurements: **height** and **waist circumference**. RFM was created to directly address the acknowledged limitations of the Body Mass Index (BMI), which often misclassifies individuals—especially those with high muscle mass—because it uses weight without considering body composition or fat distribution.</p>

    <p>The beauty of RFM lies in its simplicity and accuracy. By incorporating waist circumference, RFM targets central adiposity (visceral fat), which is the primary driver of metabolic risk. The resulting RFM score is designed to be approximately equal to your actual body fat percentage (%BF), giving you a far more insightful health metric than a raw BMI number.</p>

    <h2 id="formula" className="text-xl font-bold text-foreground mt-8">The Sex-Specific RFM Formula and Calculation</h2>
    <p>The RFM index is calculated using a linear equation that is adjusted based on biological sex (a crucial distinction, as women naturally have a higher body fat percentage than men).</p>

    <h3 className="font-semibold text-foreground mt-6">The RFM Formulas (Measurements in Centimeters)</h3>
    <p>The formulas below require both height and waist circumference to be in **centimeters (cm)** for accurate results:</p>
    <pre><code>RFM (Men) = 64 &minus; (20 &times; (Height / Waist Circumference))
RFM (Women) = 76 &minus; (20 &times; (Height / Waist Circumference))</code></pre>

    <h3 className="font-semibold text-foreground mt-6">Anatomy of the Formula</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**The Base Constant (64 or 76):** These constants serve as sex-specific "starting points" designed to align the formula's output with the average physiological differences in body fat between men and women.</li>
        <li>**Height / Waist Circumference:** This ratio is the core input, reflecting the inverse relationship between height and adiposity relative to the waistline.</li>
    </ul>
    <p>The final RFM number is an estimate of your body fat percentage. For example, an RFM result of 25 means your estimated body fat is 25%.</p>

    <h2 id="measurement" className="text-xl font-bold text-foreground mt-8">Accurate Measurement Protocol for RFM Inputs</h2>
    <p>The accuracy of the RFM calculator is highly dependent on precise measurement of the waist circumference. Follow these guidelines for consistency:</p>

    <h3 className="font-semibold text-foreground mt-6">Measuring Waist Circumference (WC)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Location:** Measure at the **narrowest point between the bottom of your ribs and the top of your hip bone (iliac crest)**. This location is often *above* the navel and is the clinically validated spot for assessing visceral fat.</li>
        <li>**Technique:** Use a flexible tape measure. Measure at the **end of a normal exhalation**. The tape must be snug against the skin but must **not compress** the underlying tissue.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Measuring Height</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Measure height without shoes, standing straight with your back against a wall.</li>
        <li>**Consistency:** For all body composition metrics, measure at the same time of day (preferably in the morning) and under the same conditions to track progress accurately.</li>
    </ul>

    <h2 id="rfm-vs-bmi" className="text-xl font-bold text-foreground mt-8">RFM vs. BMI: Why RFM is a Better Predictor of Adiposity</h2>
    <p>The primary scientific finding supporting RFM is its superior correlation with fat mass compared to BMI. Studies involving gold-standard methods like DXA (Dual-Energy X-ray Absorptiometry) have validated RFM as a stronger predictor of whole-body fat percentage.</p>

    <h3 className="font-semibold text-foreground mt-6">RFM Resolves the Muscle Mass Misclassification</h3>
    <p>The key issue with BMI is its inclusion of **total body weight**, meaning it cannot distinguish between the weight of fat and the weight of metabolically protective muscle. RFM, by excluding weight and focusing on the ratio of height to the central fat store (waist), significantly reduces the misclassification error for two groups:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Muscular Individuals/Athletes:** RFM is less likely to incorrectly label a highly muscled person as "obese," as their lean mass does not inflate the calculation.</li>
        <li>**Older Adults:** Older adults often have a "normal" BMI due to sarcopenia (muscle loss) but can carry high levels of dangerous visceral fat. RFM is better at identifying this **"normal weight obesity"** risk.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">RFM and Sex-Based Physiology</h3>
    <p>RFM aligns better with physiological reality. Women, for reproductive reasons, maintain higher body fat percentages than men. While the BMI standard for obesity ($\ge 30$) is the same for both sexes, the RFM formula incorporates this physiological difference, resulting in higher healthy ranges for women (see table below).</p>

    <h2 id="risk-levels" className="text-xl font-bold text-foreground mt-8">RFM Classification: Estimated Body Fat Ranges by Sex</h2>
    <p>The following chart summarizes the generally accepted categories for adults. These values represent the estimated percentage of body fat (%BF).</p>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Body Fat Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">RFM (Men)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">RFM (Women)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Health Risk</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Underweight/Low</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 8%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Below 21%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Potential for nutrient deficiency, hormonal issues</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Healthy / Normal</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">8% &ndash; 20%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">21% &ndash; 33%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Optimal health range</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Overweight/Increased Risk</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">20% &ndash; 25%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">33% &ndash; 39%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increased risk of metabolic syndrome, diabetes</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300"><strong>Obese</strong></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 25%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Above 39%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Significantly increased risk of CVD and mortality</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h2 id="health-risks" className="text-xl font-bold text-foreground mt-8">RFM and Metabolic Risk: Heart Disease and Diabetes Prediction</h2>
    <p>RFM's power as a health predictor comes from its focus on the waist circumference, which is highly correlated with **visceral fat**. Visceral fat is metabolically active and directly drives most obesity-related complications.</p>

    <h3 className="font-semibold text-foreground mt-6">RFM's Superiority in Predicting Disease</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Diabetes:** Long-term prospective studies have shown RFM to be a **superior predictor of incident Type 2 Diabetes** compared to BMI, especially in women and younger adults.</li>
        <li>**Dyslipidemia and Metabolic Syndrome:** RFM has demonstrated better predictability for unhealthy lipid profiles (low HDL, high triglycerides) and the overall diagnosis of Metabolic Syndrome than BMI.</li>
        <li>**Mortality:** Research has indicated that RFM is a stronger predictor of all-cause mortality than BMI, and its use helps eliminate the confounding effect of muscle mass often seen in the misleading "obesity paradox."</li>
        <li>**Heart Failure (HF):** Recent findings suggest RFM is a robust predictor of incident HF, making it a valuable tool in cardiovascular screening.</li>
    </ul>

    <h2 id="actionable" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Optimize Your RFM</h2>
    <p>Since a high RFM score is a sign of excess body fat, the primary goal is to **reduce fat mass while preserving or building lean muscle mass**. This requires a strategic approach combining diet and exercise.</p>

    <h3 className="font-semibold text-foreground mt-6">Targeting Visceral Fat for Lower RFM</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Calorie Deficit:** Achieving a net loss of fat mass requires a sustained calorie deficit.</li>
        <li>**Consistent Aerobic Exercise:** Cardio (e.g., brisk walking, jogging, cycling) is highly effective at mobilizing and burning **visceral fat**, the most dangerous component of central adiposity, directly impacting the waist circumference input of the RFM formula.</li>
        <li>**Resistance Training:** This is essential to prevent the loss of lean muscle mass during dieting, ensuring that your weight loss is fat-driven, thus achieving a better body composition and a lower, healthier RFM.</li>
        <li>**Dietary Control:** Minimize refined sugars, trans fats, and processed foods. Prioritize lean protein and high-fiber foods to support metabolism and satiety.</li>
    </ul>

    <h2 id="limitations" className="text-xl font-bold text-foreground mt-8">Limitations and the Future of Body Composition Measurement</h2>
    <p>While RFM offers a significant improvement over BMI, it is still an estimation based on a mathematical formula and has limitations:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Ethnicity:** RFM was developed primarily on American populations (European, African, and Mexican descent) and may need minor adjustments or further validation for other ethnic groups (e.g., certain Asian populations).</li>
        <li>**Extremes:** Like most indices, RFM's accuracy can decrease at the extremes of body composition (very low body fat or morbid obesity).</li>
    </ul>
    
    <p>For the most complete health assessment, RFM should be used as a simple **screening and progress tracking tool**. Clinicians will use it in combination with other direct measurements, such as blood pressure, lipid panels, and potentially a **DEXA scan**, to create a comprehensive picture of your metabolic health.</p>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is compiled using evidence from studies published in *Scientific Reports*, *The International Journal of Obesity*, and clinical resources from MDCalc and the American Heart Association, supporting RFM's role as a key anthropometric index.</p>
    </div>
</section>
    </div>
  );
}
