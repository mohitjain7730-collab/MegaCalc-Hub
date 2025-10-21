
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  weight: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
});

type FormValues = z.infer<typeof formSchema>;

export default function PonderalIndexCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        unit: 'imperial',
    }
  });

  const onSubmit = (values: FormValues) => {
    let weightInKg = values.weight;
    let heightInM = values.height;

    if (values.unit === 'imperial') {
        weightInKg = values.weight * 0.453592;
        heightInM = values.height * 0.0254;
    }

    const pi = weightInKg / Math.pow(heightInM, 3);
    setResult(pi);
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem><FormLabel>Units</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="metric">Metric (kg, m)</SelectItem><SelectItem value="imperial">Imperial (lbs, in)</SelectItem></SelectContent></Select></FormItem>
            )} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({unit === 'metric' ? 'm' : 'in'})</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Dna className="h-8 w-8 text-primary" /><CardTitle>Ponderal Index (PI)</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)} kg/m³</p>
                    <CardDescription>A normal range for adults is typically between 11 and 15.</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}
       <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="Ponderal Index Calculator Guide: PI Formula, Adult & Neonatal Interpretation, and Athletic Use" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to the Ponderal Index (PI) or Tri-Ponderal Mass Index (TMI), its formula (Weight/Height³), why it is considered a better measure than BMI for very tall/short individuals and adolescents, and its use in assessing fetal malnutrition." />

    <h1 className="text-2xl font-bold text-foreground mb-4">The Ultimate Ponderal Index (PI) Calculator Guide: Beyond BMI for Body Proportions</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide provides educational information on the Ponderal Index. While PI is a valuable screening tool, it should always be used alongside professional medical and body composition assessments. Consult a healthcare provider for any health or nutritional concerns.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">What is the Ponderal Index (PI)?</a></li>
        <li><a href="#formula">The Official Ponderal Index Formula and Units</a></li>
        <li><a href="#pi-vs-bmi">PI vs. BMI: Why the Cube Power Matters for Height Extremes</a></li>
        <li><a href="#pediatric">Ponderal Index in Pediatrics: Assessing Fetal Malnutrition</a></li>
        <li><a href="#adult-ranges">PI Interpretation for Adults and Athletes</a></li>
        <li><a href="#limitations">Limitations and the Need for Multi-Metric Assessment</a></li>
        <li><a href="#actionable">Actionable Steps Based on Your PI Result</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">What is the Ponderal Index (PI)?</h2>
    <p itemProp="description">The **Ponderal Index (PI)**, often called the **Tri-Ponderal Mass Index (TMI)** or Rohrer's Index, is an anthropometric measure used to quantify the leanness or corpulence of an individual based on their height and weight. Unlike the commonly used Body Mass Index (BMI), which uses height squared (Height²), the PI uses the **cube of height (Height³)** in its calculation.</p>
    
    <p>This difference is significant because mass naturally scales to the third power of linear dimensions. By cubing the height, the Ponderal Index seeks to provide a measure that is theoretically less correlated with height itself, offering a more **proportional comparison** between individuals of vastly different statures. This characteristic makes PI an especially valuable tool in **pediatric medicine** and the assessment of **very tall or very short adults**.</p>

    <h2 id="formula" className="text-xl font-bold text-foreground mt-8">The Official Ponderal Index Formula and Units</h2>
    <p>The calculation of the Ponderal Index must strictly adhere to the units specific to the population being measured (adults vs. infants) to ensure accurate interpretation against established normative ranges.</p>

    <h3 className="font-semibold text-foreground mt-6">Adult Ponderal Index Formula (PI_Adult)</h3>
    <p>For adults and adolescents, the metric standard uses kilograms and meters, resulting in a PI value typically ranging from 10 to 15 kg/m³.</p>
    <pre><code>PI = Weight (kg) &divide; Height (m)³</code></pre>

    <h3 className="font-semibold text-foreground mt-6">Infant Ponderal Index Formula (PI_Child)</h3>
    <p>In clinical pediatrics, especially for assessing newborns, a different unit set is used due to the scale difference. This formula yields values typically ranging from 2.2 to 3.0.</p>
    <pre><code>PI_Infant = Weight (g) &divide; Height (cm)³</code></pre>
    <p>***Note: The adult and infant index values differ by approximately one order of magnitude. Using the adult formula on a newborn will yield an inaccurately high number (e.g., 23 instead of 2.3).***</p>

    <h2 id="pi-vs-bmi" className="text-xl font-bold text-foreground mt-8">PI vs. BMI: Why the Cube Power Matters for Height Extremes</h2>
    <p>The primary critique of **BMI (Weight / Height²)** is its tendency to misclassify individuals at the height extremes. Taller individuals tend to have an inflated BMI value for a given body fat level, while shorter individuals may have an underestimated BMI. This is because the volume and mass of a three-dimensional body scale closer to Height³.</p>

    <h3 className="font-semibold text-foreground mt-6">Advantages of PI Over BMI</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Height Correction:** By using the cubed height, the PI is theoretically less influenced by height, providing a more "fair" comparison of corpulence across individuals of different statures.</li>
        <li>**Adolescent Accuracy:** PI (or TMI) has shown greater accuracy than BMI z-scores in estimating body fat levels in adolescents (ages 8-17), a period of rapid and disproportionate growth where BMI can be unreliable.</li>
        <li>**Athletic Assessment:** It is often preferred by sports scientists for very tall or short athletes where height extremes make BMI less contextual.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The PI-BMI Relationship</h3>
    <p>The two indices are mathematically related, showing the PI is simply the BMI divided by height:</p>
    <pre><code>PI = BMI &divide; Height (m)</code></pre>
    <p>This relationship clearly demonstrates how BMI is penalized by increased height, while PI attempts to normalize this effect.</p>

    <h2 id="pediatric" className="text-xl font-bold text-foreground mt-8">Ponderal Index in Pediatrics: Assessing Fetal Malnutrition</h2>
    <p>The most validated and widely used application of the Ponderal Index is in **neonatology**, where it serves as a simple, non-invasive tool to assess newborn nutritional status at birth.</p>

    <h3 className="font-semibold text-foreground mt-6">Diagnosing Intrauterine Growth Restriction (IUGR)</h3>
    <p>The PI is essential for differentiating between two types of impaired fetal growth:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Symmetrical IUGR (Normal PI):** Weight and height are proportionately low, suggesting a growth problem started early in pregnancy.</li>
        <li>**Asymmetrical IUGR (Low PI):** Weight is low relative to height/length (the baby is long and thin). This indicates fetal wasting or malnutrition that occurred late in pregnancy, often associated with higher neonatal morbidity and distress.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">PI Infant Normal Range</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Normal PI for Term Babies:** Generally defined as **2.2 to 3.0** (using the g/cm³ formula).</li>
        <li>**Low PI:** Values below this range suggest fetal malnutrition and potential health risks, warranting close monitoring.</li>
    </ul>

    <h2 id="adult-ranges" className="text-xl font-bold text-foreground mt-8">PI Interpretation for Adults and Athletes</h2>
    <p>While adult PI ranges are less rigidly defined than BMI categories, they provide a strong indication of body composition and proportion, particularly in populations where BMI is flawed.</p>

    <h3 className="font-semibold text-foreground mt-6">PI Adult Classification (Approximate)</h3>
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">PI Score (kg/m³)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Classification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">Health Implication</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**Below 11**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Underweight/Risk of Deficiencies</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Insufficient mass, muscle wasting, or severe leanness.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**11 to 15**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Normal Range</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Healthy body composition for the general population.</td>
                </tr>
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">**Above 15**</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Overweight/Obese Risk</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">Increased risk of chronic diseases (similar to high BMI).</td>
                </tr>
            </tbody>
        </table>
    </div>

    <h3 className="font-semibold text-foreground mt-6">PI in Athletic Assessment</h3>
    <p>For athletes, the PI is used to assess body type relative to sport-specific demands:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Endurance Athletes:** Typically have lower PI values (e.g., 10-11) reflecting lower body mass relative to height.</li>
        <li>**Power Athletes:** (e.g., throwers, powerlifters) often have higher PI values (e.g., 13-15) due to greater muscle mass relative to height.</li>
    </ul>

    <h2 id="limitations" className="text-xl font-bold text-foreground mt-8">Limitations and the Need for Multi-Metric Assessment</h2>
    <p>Despite its theoretical advantages, the Ponderal Index shares a major limitation with BMI: it cannot distinguish between **fat mass** and **lean muscle mass**. A highly muscular individual will have a high PI just as an obese individual would.</p>

    <h3 className="font-semibold text-foreground mt-6">PI is Not a Visceral Fat Predictor</h3>
    <p>Unlike Waist-to-Height Ratio (WHtR) or Waist-to-Hip Ratio (WHR), PI does not account for the **distribution of fat**. Since central (visceral) fat is the primary driver of metabolic syndrome and cardiovascular risk, PI is generally considered a less useful tool than WHtR for screening for these chronic diseases in the general adult population.</p>
    
    <p>For the most accurate assessment of body composition, PI should be supplemented with or replaced by more sophisticated methods:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Waist-to-Height Ratio (WHtR):** Excellent for screening metabolic risk.</li>
        <li>**Skin Fold Calipers:** A quick estimate of subcutaneous body fat percentage.</li>
        <li>**DEXA Scan:** The gold standard for accurately measuring and differentiating fat mass, lean mass, and bone mineral density.</li>
    </ul>

    <h2 id="actionable" className="text-xl font-bold text-foreground mt-8">Actionable Steps Based on Your PI Result</h2>
    <p>Use your Ponderal Index result to guide your overall fitness and health goals:</p>

    <h3 className="font-semibold text-foreground mt-6">If Your PI is Below 11 (Adults)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Focus on Lean Mass Gain:** Increase calorie intake (especially protein) and incorporate consistent **resistance training** to build muscle and increase healthy body weight.</li>
        <li>**Nutritional Screening:** Consult a dietitian to rule out nutrient deficiencies or malabsorption issues.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">If Your PI is Above 15 (Adults)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Prioritize Fat Loss:** Focus on a consistent **calorie deficit** and high levels of **aerobic exercise** (cardio).</li>
        <li>**Measure WHtR:** Calculate your Waist-to-Height Ratio (WHtR) to determine your level of abdominal fat risk.</li>
        <li>**Consult a Physician:** Schedule blood work to check metabolic markers (glucose, lipids, blood pressure).</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide is based on established anthropometric research, including studies from *JAMA Pediatrics* and guidelines on newborn assessment.</p>
    </div>
</section>

    </div>
  );
}
