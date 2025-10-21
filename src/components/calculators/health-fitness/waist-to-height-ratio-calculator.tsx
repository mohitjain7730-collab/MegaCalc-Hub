
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
  waist: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['cm', 'in']),
});

type FormValues = z.infer<typeof formSchema>;

const getWhtrCategory = (whtr: number) => {
  if (whtr < 0.5) return { name: 'Healthy', color: 'text-green-500' };
  return { name: 'Increased Risk', color: 'text-red-500' };
};

export default function WaistToHeightRatioCalculator() {
  const [result, setResult] = useState<{ whtr: number; category: { name: string; color: string } } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: 'cm',
    },
  });

  const onSubmit = (values: FormValues) => {
    const whtr = values.waist / values.height;
    setResult({ whtr, category: getWhtrCategory(whtr) });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="cm">cm</SelectItem><SelectItem value="in">inches</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="waist" render={({ field }) => (<FormItem><FormLabel>Waist ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Ruler className="h-8 w-8 text-primary" /><CardTitle>Waist-to-Height Ratio (WHtR)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.whtr.toFixed(2)}</p>
                    <p className={`text-2xl font-semibold ${result.category.color}`}>{result.category.name}</p>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Waist-to-Height Ratio (WHtR) Calculator: The 'Less Than Half Your Height' Rule for Health" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A definitive guide to calculating the Waist-to-Height Ratio (WHtR), understanding the universally accepted 0.5 cut-off point, why WHtR is a better predictor of metabolic syndrome and heart disease than BMI, and actionable steps to reduce abdominal fat." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Waist-to-Height Ratio (WHtR) Calculator Guide: The Simple Rule for Heart Health</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational content based on clinical guidelines (NICE, AHA). It is not a substitute for medical diagnosis or treatment. Consult a healthcare provider for any health concerns or before starting a weight management program.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">WHtR Explained: Why Your Waist Should Be Less Than Half Your Height</a></li>
        <li><a href="#wh-vs-bmi">WHTR vs. BMI: Why Central Adiposity is the Real Risk</a></li>
        <li><a href="#measurement">Accurate Measurement Protocol for WHtR</a></li>
        <li><a href="#calculation">The WHtR Calculation and the Universal 0.5 Cut-Off</a></li>
        <li><a href="#risk-levels">Interpreting Your WHtR: Risk Staging (Healthy, Take Care, Take Action)</a></li>
        <li><a href="#health-impact">Metabolic Risk: WHtR and Type 2 Diabetes/Heart Disease</a></li>
        <li><a href="#actionable">Actionable Strategies to Reduce Your WHtR</a></li>
        <li><a href="#conclusion">Monitoring and Professional Advice</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">WHtR Explained: Why Your Waist Should Be Less Than Half Your Height</h2>
    <p itemProp="description">The **Waist-to-Height Ratio (WHtR)** is rapidly gaining acceptance as a superior screening tool for health risk compared to the traditional Body Mass Index (BMI). The concept is simple: your waist circumference should be less than half your height. This translates to a single, universally accepted threshold of **0.5** for all adults, regardless of age, sex, or ethnicity.</p>

    <p>WHtR is a direct measure of **central adiposity** (abdominal fat), which includes the dangerous **visceral fat** surrounding internal organs. This type of fat is highly metabolically active, secreting inflammatory cytokines and driving risk for **Type 2 Diabetes**, **hypertension**, and **Cardiovascular Disease (CVD)**, even in individuals who may have a seemingly normal BMI.</p>
    
    <p>This guide delves into the robust scientific backing of the WHtR, provides step-by-step instructions for precise measurement, and outlines the simple, powerful strategies you can use to maintain a healthy ratio.</p>

    <h2 id="wh-vs-bmi" className="text-xl font-bold text-foreground mt-8">WHTR vs. BMI: Why Central Adiposity is the Real Risk</h2>
    <p>For decades, BMI has been the standard for classifying obesity. However, its major flaw is that it fails to distinguish between lean muscle mass and fat, or—more importantly—where the fat is stored. WHtR addresses this limitation directly.</p>

    <h3 className="font-semibold text-foreground mt-6">The Limitations of BMI</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Muscle Mass Bias:** Muscular individuals (like athletes) can be inaccurately classified as overweight due to their high lean mass.</li>
        <li>**Fat Distribution Blindness:** BMI cannot distinguish between fat carried safely in the hips and thighs (subcutaneous fat) and the riskier fat stored centrally (visceral fat).</li>
        <li>**The "Normal Weight Obese" Paradox:** Individuals who fall into the "normal" BMI range but carry excessive abdominal fat (high WHtR) are still at significantly elevated risk for metabolic disorders—a risk BMI entirely fails to flag.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Advantages of WHtR</h3>
    <p>WHtR has been shown to be a stronger predictor of mortality and cardiovascular risk factors than both BMI and even Waist Circumference (WC) alone, as it adjusts the dangerous WC measurement for the patient's height. This adjustment makes WHtR a more universally applicable and simplified indicator of risk.</p>

    <h2 id="measurement" className="text-xl font-bold text-foreground mt-8">Accurate Measurement Protocol for WHtR</h2>
    <p>To ensure your calculator reading is accurate, both your waist and height must be measured precisely. Any unit of measurement (centimeters or inches) is acceptable, as long as the same unit is used for both.</p>

    <h3 className="font-semibold text-foreground mt-6">Measuring Waist Circumference (WC)</h3>
    <p>This measurement is crucial, as it directly reflects central fat storage. Follow the established clinical guideline:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Location:** Find the **midpoint between the lowest rib** and the **top of the hip bone (iliac crest)**. This is the most accurate anatomical waistline.</li>
        <li>**Technique:** Use a flexible, non-stretchable tape measure. Measure the circumference after exhaling (not holding your breath). The tape should be snug but should not compress the skin.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Measuring Height</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Position:** Stand straight against a wall with your feet together, head level, and looking straight ahead.</li>
        <li>**Technique:** Use a square or flat object to create a right angle against the wall and the top of your head. Mark the spot and measure the distance from the floor.</li>
    </ul>

    <h2 id="calculation" className="text-xl font-bold text-foreground mt-8">The WHtR Calculation and the Universal 0.5 Cut-Off</h2>
    <p>The calculation is a straightforward division. The resulting number immediately indicates your health risk according to the consensus of major health bodies.</p>

    <h3 className="font-semibold text-foreground mt-6">The Calculation Formula</h3>
    <pre><code>Waist-to-Height Ratio (WHtR) = Waist Circumference &divide; Height</code></pre>
    <p><em>Example: A person with a 30-inch waist and a 60-inch height has a WHtR of 30 &divide; 60 = **0.50**.</em></p>

    <h3 className="font-semibold text-foreground mt-6">The "Keep Your Waist Less Than Half Your Height" Rule</h3>
    <p>The beauty of WHtR is its simplicity. The benchmark of **0.5** means your waist circumference is exactly half your height. Maintaining a ratio below 0.5 is associated with the lowest risk of developing obesity-related diseases.</p>

    <h2 id="risk-levels" className="text-xl font-bold text-foreground mt-8">Interpreting Your WHtR: Risk Staging (NICE Guidelines)</h2>
    <p>The UK's National Institute for Health and Care Excellence (NICE) recommends a clear staging system for adults with a BMI under 35, making the WHtR tool highly practical for identifying "early health risk."</p>

    <h3 className="font-semibold text-foreground mt-6">WHtR Health Risk Classification</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">WHtR Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Health Risk Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Recommended Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**&lt; 0.40**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Low Fat / Underweight Risk</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Potentially Low</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Maintain, or consult a doctor if underweight.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**0.40 to 0.49**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Healthy</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Not Increased</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Maintain lifestyle.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**0.50 to 0.59**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increased Risk</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increased</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">**Take Care:** Focus on diet and exercise; monitor other health markers.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**0.60 or More**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">High Risk</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Further Increased</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">**Take Action:** Consult a doctor for a full metabolic workup and intervention.</td>
                </tr>
            </tbody>
        </table>
    </div>
    <p className="citation"><em>Source: Adapted from National Institute for Health and Care Excellence (NICE) guidelines and associated consensus statements.</em></p>

    <h2 id="health-impact" className="text-xl font-bold text-foreground mt-8">Metabolic Risk: WHtR and Type 2 Diabetes/Heart Disease</h2>
    <p>The reason WHtR is such a powerful tool lies in the danger of **visceral fat**. This fat acts like an endocrine organ, pumping inflammatory signals and fatty acids directly into the bloodstream and liver, which leads to a cascade of metabolic problems:</p>

    <h3 className="font-semibold text-foreground mt-6">Key Health Implications of High WHtR</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Insulin Resistance:** Visceral fat impairs the body's response to insulin, directly leading to **Type 2 Diabetes**. WHtR is a strong predictor of poor glucose control.</li>
        <li>**Dyslipidemia:** High visceral fat is closely linked to unhealthy lipid profiles, specifically **high triglycerides** and **low HDL ('good') cholesterol**.</li>
        <li>**Hypertension:** Abdominal fat increases peripheral vascular resistance and inflammation, contributing significantly to **high blood pressure**.</li>
        <li>**Liver Disease:** Excess visceral fat is a primary cause of **Non-Alcoholic Fatty Liver Disease (NAFLD)**, a condition strongly correlated with a high WHtR.</li>
        <li>**Cardiovascular Mortality:** Meta-analyses consistently show that an elevated WHtR is a more reliable predictor of all-cause and cardiovascular mortality than BMI, regardless of age.</li>
    </ul>

    <h2 id="actionable" className="text-xl font-bold text-foreground mt-8">Actionable Strategies to Reduce Your WHtR (Targeting Visceral Fat)</h2>
    <p>Since WHtR targets visceral fat, effective intervention focuses on lifestyle changes that specifically mobilize this dangerous abdominal store.</p>

    <h3 className="font-semibold text-foreground mt-6">Dietary Interventions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Eliminate Fructose and Refined Sugar:** Excess intake of sugars, especially from sodas and processed snacks, is a major driver of visceral fat accumulation.</li>
        <li>**Focus on Soluble Fiber:** Increase consumption of whole grains, oats, beans, and legumes. Soluble fiber slows digestion and improves insulin sensitivity, directly fighting visceral fat.</li>
        <li>**High-Protein Diet:** Protein increases satiety and requires more energy to metabolize, supporting a calorie deficit necessary for fat loss.</li>
        <li>**Choose Monounsaturated Fats:** Sources like olive oil and avocados have been shown to help manage fat distribution more favorably than saturated fats.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Exercise and Lifestyle</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Consistent Aerobic Exercise:** Aim for 150 minutes per week. Cardio is highly effective at burning visceral fat specifically, even if overall weight loss is slow.</li>
        <li>**Resistance Training:** Building muscle mass is important for boosting metabolism and preventing muscle loss during weight reduction.</li>
        <li>**Sleep Optimization:** Poor sleep (less than 7 hours) increases cortisol and ghrelin (hunger hormone), leading to preferential storage of fat in the abdomen. Prioritize 7-9 hours of quality sleep.</li>
        <li>**Stress Reduction:** Chronic stress elevates **cortisol**, which directly promotes the storage of visceral fat. Daily stress reduction practices are a non-negotiable part of lowering WHtR.</li>
    </ul>

    <h2 id="conclusion" className="text-xl font-bold text-foreground mt-8">Monitoring and Professional Advice</h2>
    <p>If your WHtR is **0.5 or higher**, use the calculator as a catalyst for discussion with your doctor. They can order comprehensive metabolic testing (lipids, glucose, blood pressure) to understand the full extent of your risk. Regularly tracking your WHtR (e.g., monthly) provides a tangible, easy-to-understand measure of success as you commit to a healthier lifestyle.</p>
    
    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is based on scientific consensus from the National Institute for Health and Care Excellence (NICE), the World Health Organization (WHO), and large-scale meta-analyses on cardiometabolic risk prediction.</p>
    </div>
</section>
    </div>
  );
}
