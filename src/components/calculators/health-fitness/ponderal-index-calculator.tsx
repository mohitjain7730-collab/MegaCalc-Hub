'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dna, Info, Target, BarChart3, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

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
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Calculate Your Ponderal Index
          </CardTitle>
          <CardDescription>
            Assess body proportion using weight and height cubed (better for height extremes than BMI)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
      {result && (
        <Card>
            <CardHeader>
              <div className='flex items-center gap-4'>
                <Dna className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Ponderal Index (PI)</CardTitle>
                  <CardDescription>Body proportion assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)} kg/m³</p>
                    <CardDescription>A normal range for adults is typically between 11 and 15.</CardDescription>
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
              <h4 className="font-semibold text-foreground mb-2">Weight</h4>
              <p className="text-muted-foreground">
                Enter your current body weight in either kilograms (metric) or pounds (imperial). Use your most recent measurement, ideally taken in the morning before eating and after using the restroom for consistency. The formula uses weight as the numerator, making it a key component of the index.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Height</h4>
              <p className="text-muted-foreground">
                Enter your height in meters (metric) or inches (imperial). Measure without shoes, standing straight against a wall. Unlike BMI which uses height squared, PI uses height cubed (height³), which better accounts for the three-dimensional nature of the body and reduces height bias at the extremes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Why Height Cubed Matters</h4>
              <p className="text-muted-foreground">
                Body mass naturally scales with volume, which scales to the third power of linear dimensions. Using height³ instead of height² (as in BMI) theoretically provides a more proportional comparison across different statures. This makes PI particularly valuable for very tall or very short individuals, adolescents, and athletes where BMI may misclassify.
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
              Explore other body composition and anthropometric calculators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/bmi-calculator" className="text-primary hover:underline">
                    BMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Compare your BMI with PI to see how they differ, especially if you're very tall or short.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/waist-to-height-ratio-calculator" className="text-primary hover:underline">
                    Waist-to-Height Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Assess metabolic risk with WHtR, which is often superior to PI for predicting health outcomes.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/body-fat-percentage-calculator" className="text-primary hover:underline">
                    Body Fat Percentage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get a more detailed body composition assessment beyond simple weight-to-height ratios.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/health-fitness/ideal-body-weight-calculator" className="text-primary hover:underline">
                    Ideal Body Weight Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate your ideal weight range based on height and frame size.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section - All original content preserved */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Complete Guide to Ponderal Index
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-foreground">The Ultimate Ponderal Index (PI) Calculator Guide: Beyond BMI for Body Proportions</h2>
            
            <p><em><strong>Disclaimer:</strong> This guide provides educational information on the Ponderal Index. While PI is a valuable screening tool, it should always be used alongside professional medical and body composition assessments. Consult a healthcare provider for any health or nutritional concerns.</em></p>

            <h3 className="font-semibold text-foreground mt-6">What is the Ponderal Index (PI)?</h3>
            <p>The **Ponderal Index (PI)**, often called the **Tri-Ponderal Mass Index (TMI)** or Rohrer's Index, is an anthropometric measure used to quantify the leanness or corpulence of an individual based on their height and weight. Unlike the commonly used Body Mass Index (BMI), which uses height squared (Height²), the PI uses the **cube of height (Height³)** in its calculation.</p>
            
            <p>This difference is significant because mass naturally scales to the third power of linear dimensions. By cubing the height, the Ponderal Index seeks to provide a measure that is theoretically less correlated with height itself, offering a more **proportional comparison** between individuals of vastly different statures. This characteristic makes PI an especially valuable tool in **pediatric medicine** and the assessment of **very tall or very short adults**.</p>

            <h3 className="font-semibold text-foreground mt-6">The Official Ponderal Index Formula and Units</h3>
            <p>The calculation of the Ponderal Index must strictly adhere to the units specific to the population being measured (adults vs. infants) to ensure accurate interpretation against established normative ranges.</p>

            <h4 className="font-semibold text-foreground mt-4">Adult Ponderal Index Formula (PI_Adult)</h4>
            <p>For adults and adolescents, the metric standard uses kilograms and meters, resulting in a PI value typically ranging from 10 to 15 kg/m³.</p>
            <p className="font-mono bg-muted p-2 rounded">PI = Weight (kg) ÷ Height (m)³</p>

            <h4 className="font-semibold text-foreground mt-4">Infant Ponderal Index Formula (PI_Child)</h4>
            <p>In clinical pediatrics, especially for assessing newborns, a different unit set is used due to the scale difference. This formula yields values typically ranging from 2.2 to 3.0.</p>
            <p className="font-mono bg-muted p-2 rounded">PI_Infant = Weight (g) ÷ Height (cm)³</p>
            <p className="text-sm italic">***Note: The adult and infant index values differ by approximately one order of magnitude. Using the adult formula on a newborn will yield an inaccurately high number (e.g., 23 instead of 2.3).***</p>

            <h3 className="font-semibold text-foreground mt-6">PI vs. BMI: Why the Cube Power Matters for Height Extremes</h3>
            <p>The primary critique of **BMI (Weight / Height²)** is its tendency to misclassify individuals at the height extremes. Taller individuals tend to have an inflated BMI value for a given body fat level, while shorter individuals may have an underestimated BMI. This is because the volume and mass of a three-dimensional body scale closer to Height³.</p>

            <h4 className="font-semibold text-foreground mt-4">Advantages of PI Over BMI</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Height Correction:** By using the cubed height, the PI is theoretically less influenced by height, providing a more "fair" comparison of corpulence across individuals of different statures.</li>
                <li>**Adolescent Accuracy:** PI (or TMI) has shown greater accuracy than BMI z-scores in estimating body fat levels in adolescents (ages 8-17), a period of rapid and disproportionate growth where BMI can be unreliable.</li>
                <li>**Athletic Assessment:** It is often preferred by sports scientists for very tall or short athletes where height extremes make BMI less contextual.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">The PI-BMI Relationship</h4>
            <p>The two indices are mathematically related, showing the PI is simply the BMI divided by height:</p>
            <p className="font-mono bg-muted p-2 rounded">PI = BMI ÷ Height (m)</p>
            <p>This relationship clearly demonstrates how BMI is penalized by increased height, while PI attempts to normalize this effect.</p>

            <h3 className="font-semibold text-foreground mt-6">Ponderal Index in Pediatrics: Assessing Fetal Malnutrition</h3>
            <p>The most validated and widely used application of the Ponderal Index is in **neonatology**, where it serves as a simple, non-invasive tool to assess newborn nutritional status at birth.</p>

            <h4 className="font-semibold text-foreground mt-4">Diagnosing Intrauterine Growth Restriction (IUGR)</h4>
            <p>The PI is essential for differentiating between two types of impaired fetal growth:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Symmetrical IUGR (Normal PI):** Weight and height are proportionately low, suggesting a growth problem started early in pregnancy.</li>
                <li>**Asymmetrical IUGR (Low PI):** Weight is low relative to height/length (the baby is long and thin). This indicates fetal wasting or malnutrition that occurred late in pregnancy, often associated with higher neonatal morbidity and distress.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">PI Infant Normal Range</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Normal PI for Term Babies:** Generally defined as **2.2 to 3.0** (using the g/cm³ formula).</li>
                <li>**Low PI:** Values below this range suggest fetal malnutrition and potential health risks, warranting close monitoring.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">PI Interpretation for Adults and Athletes</h3>
            <p>While adult PI ranges are less rigidly defined than BMI categories, they provide a strong indication of body composition and proportion, particularly in populations where BMI is flawed.</p>

            <h4 className="font-semibold text-foreground mt-4">PI Adult Classification (Approximate)</h4>
            <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                    <thead>
                        <tr className="bg-muted text-left">
                            <th className="border p-2">PI Score (kg/m³)</th>
                            <th className="border p-2">Classification</th>
                            <th className="border p-2">Health Implication</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2">Below 11</td>
                            <td className="border p-2">Underweight/Risk of Deficiencies</td>
                            <td className="border p-2">Insufficient mass, muscle wasting, or severe leanness.</td>
                        </tr>
                        <tr>
                            <td className="border p-2">11 to 15</td>
                            <td className="border p-2">Normal Range</td>
                            <td className="border p-2">Healthy body composition for the general population.</td>
                        </tr>
                        <tr>
                            <td className="border p-2">Above 15</td>
                            <td className="border p-2">Overweight/Obese Risk</td>
                            <td className="border p-2">Increased risk of chronic diseases (similar to high BMI).</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h4 className="font-semibold text-foreground mt-4">PI in Athletic Assessment</h4>
            <p>For athletes, the PI is used to assess body type relative to sport-specific demands:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Endurance Athletes:** Typically have lower PI values (e.g., 10-11) reflecting lower body mass relative to height.</li>
                <li>**Power Athletes:** (e.g., throwers, powerlifters) often have higher PI values (e.g., 13-15) due to greater muscle mass relative to height.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Limitations and the Need for Multi-Metric Assessment</h3>
            <p>Despite its theoretical advantages, the Ponderal Index shares a major limitation with BMI: it cannot distinguish between **fat mass** and **lean muscle mass**. A highly muscular individual will have a high PI just as an obese individual would.</p>

            <h4 className="font-semibold text-foreground mt-4">PI is Not a Visceral Fat Predictor</h4>
            <p>Unlike Waist-to-Height Ratio (WHtR) or Waist-to-Hip Ratio (WHR), PI does not account for the **distribution of fat**. Since central (visceral) fat is the primary driver of metabolic syndrome and cardiovascular risk, PI is generally considered a less useful tool than WHtR for screening for these chronic diseases in the general adult population.</p>
            
            <p>For the most accurate assessment of body composition, PI should be supplemented with or replaced by more sophisticated methods:</p>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Waist-to-Height Ratio (WHtR):** Excellent for screening metabolic risk.</li>
                <li>**Skin Fold Calipers:** A quick estimate of subcutaneous body fat percentage.</li>
                <li>**DEXA Scan:** The gold standard for accurately measuring and differentiating fat mass, lean mass, and bone mineral density.</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-6">Actionable Steps Based on Your PI Result</h3>
            <p>Use your Ponderal Index result to guide your overall fitness and health goals:</p>

            <h4 className="font-semibold text-foreground mt-4">If Your PI is Below 11 (Adults)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Focus on Lean Mass Gain:** Increase calorie intake (especially protein) and incorporate consistent **resistance training** to build muscle and increase healthy body weight.</li>
                <li>**Nutritional Screening:** Consult a dietitian to rule out nutrient deficiencies or malabsorption issues.</li>
            </ul>

            <h4 className="font-semibold text-foreground mt-4">If Your PI is Above 15 (Adults)</h4>
            <ul className="list-disc ml-6 space-y-1">
                <li>**Prioritize Fat Loss:** Focus on a consistent **calorie deficit** and high levels of **aerobic exercise** (cardio).</li>
                <li>**Measure WHtR:** Calculate your Waist-to-Height Ratio (WHtR) to determine your level of abdominal fat risk.</li>
                <li>**Consult a Physician:** Schedule blood work to check metabolic markers (glucose, lipids, blood pressure).</li>
            </ul>

            <div className="text-sm italic text-center mt-8 pt-4 border-t">
                <p>This guide is based on established anthropometric research, including studies from *JAMA Pediatrics* and guidelines on newborn assessment.</p>
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
              Common questions about Ponderal Index and body proportion assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a normal Ponderal Index for adults?</h4>
              <p className="text-muted-foreground">
                A normal PI range for adults is typically between 11 and 15 kg/m³. Values below 11 may indicate underweight or insufficient mass, while values above 15 suggest overweight/obese risk. However, PI should be interpreted alongside other metrics since it can't distinguish between muscle and fat mass. Athletic individuals may have higher PIs due to muscle mass rather than fat.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Is PI better than BMI?</h4>
              <p className="text-muted-foreground">
                PI has advantages over BMI for specific populations: very tall or very short individuals, adolescents going through growth spurts, and athletes. The height-cubed formula theoretically reduces height bias. However, PI still can't distinguish fat from muscle, shares BMI's limitations, and doesn't assess fat distribution. For metabolic risk screening, waist-to-height ratio is often superior to both.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why does PI use height cubed instead of squared?</h4>
              <p className="text-muted-foreground">
                Body mass scales with volume, and volume scales to the third power (cubed) of linear dimensions. Using height³ better reflects how body mass actually relates to body size in three dimensions. This makes PI more proportional across different heights compared to BMI, which uses height² and can overestimate corpulence in tall people and underestimate it in short people.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can athletes have a high PI and still be healthy?</h4>
              <p className="text-muted-foreground">
                Yes, high PI values in athletes are often due to increased muscle mass rather than excess fat. Power athletes (weightlifters, throwers) typically have PIs of 13-15 due to high lean mass. Endurance athletes usually have lower PIs (10-11) reflecting lower body mass. PI alone can't distinguish between healthy muscle mass and unhealthy fat mass, so it should be combined with body fat percentage or waist measurements for complete assessment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is PI used in pediatrics?</h4>
              <p className="text-muted-foreground">
                PI is valuable in neonatology for assessing newborn nutritional status. Normal PI for term babies is 2.2-3.0 (using g/cm³ formula). Low PI indicates asymmetrical intrauterine growth restriction (IUGR), where a baby is long and thin due to late-pregnancy malnutrition. This is clinically significant because it's associated with higher neonatal morbidity. PI helps differentiate between symmetrical IUGR (early growth problems) and asymmetrical IUGR.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use PI or waist-to-height ratio?</h4>
              <p className="text-muted-foreground">
                For predicting metabolic risk and chronic disease, waist-to-height ratio (WHtR) is generally superior to PI because it directly measures dangerous abdominal/visceral fat. PI assesses overall body proportion but doesn't show fat distribution. Use PI if you're very tall or short (where BMI may be inaccurate), but combine it with WHtR for metabolic risk assessment. PI is better for assessing leanness/corpulence, WHtR is better for health risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I improve my PI if it's too high?</h4>
              <p className="text-muted-foreground">
                If your PI is above 15 and due to excess body fat (not muscle), focus on fat loss through a calorie deficit, regular cardio exercise, and strength training to preserve muscle. Reducing weight while maintaining or building lean mass will improve your PI. However, first determine if your high PI is from fat or muscle—if you're already lean and muscular, a high PI may be healthy for you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I improve my PI if it's too low?</h4>
              <p className="text-muted-foreground">
                If your PI is below 11, focus on gaining healthy weight through increased calorie intake (especially protein), resistance training to build muscle, and ensuring adequate nutrition. The goal is to increase lean mass, not just fat. Consult with a dietitian or healthcare provider if low PI is due to underlying health issues, nutrient deficiencies, or eating disorders.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can PI change with age?</h4>
              <p className="text-muted-foreground">
                Yes, PI can change with age due to shifts in body composition. Older adults often experience sarcopenia (muscle loss), which can lower PI even if body weight stays similar. Height may also decrease slightly with age due to spinal compression. For tracking purposes, PI trends over time provide useful information about body composition changes, but interpretation should account for age-related shifts in muscle and bone mass.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Does PI work better for certain body types?</h4>
              <p className="text-muted-foreground">
                PI is particularly useful for people at height extremes (very tall or very short) where BMI may misclassify, and for adolescents experiencing rapid growth. However, PI doesn't account for body shape differences (endomorph, mesomorph, ectomorph) or fat distribution patterns. People who store fat centrally (apple shape) may have the same PI as those who store it in the hips (pear shape), but different metabolic risks, which is why WHtR is often a better health predictor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
