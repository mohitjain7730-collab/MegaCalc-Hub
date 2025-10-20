'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wheat, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  breadSlices: z.number().positive().optional(),
  pastaServing: z.number().positive().optional(),
  cerealServing: z.number().positive().optional(),
  beerGlasses: z.number().positive().optional(),
  cookies: z.number().positive().optional(),
  crackers: z.number().positive().optional(),
  otherGluten: z.number().positive().optional(),
  weight: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateGlutenIntake(values: FormValues) {
  // Estimated gluten content in common foods (grams)
  const glutenPerBreadSlice = 2.4; // grams
  const glutenPerPastaServing = 3.2; // grams
  const glutenPerCerealServing = 1.8; // grams
  const glutenPerBeerGlass = 0.8; // grams
  const glutenPerCookie = 0.6; // grams
  const glutenPerCracker = 0.4; // grams
  
  const totalGluten = 
    (values.breadSlices || 0) * glutenPerBreadSlice +
    (values.pastaServing || 0) * glutenPerPastaServing +
    (values.cerealServing || 0) * glutenPerCerealServing +
    (values.beerGlasses || 0) * glutenPerBeerGlass +
    (values.cookies || 0) * glutenPerCookie +
    (values.crackers || 0) * glutenPerCracker +
    (values.otherGluten || 0);
  
  const weight = values.weight || 70; // kg
  const glutenPerKg = totalGluten / weight;
  
  return {
    totalGluten: Math.round(totalGluten * 10) / 10,
    glutenPerKg: Math.round(glutenPerKg * 10) / 10,
  };
}

export default function GlutenIntakeTrackerCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateGlutenIntake> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breadSlices: undefined,
      pastaServing: undefined,
      cerealServing: undefined,
      beerGlasses: undefined,
      cookies: undefined,
      crackers: undefined,
      otherGluten: undefined,
      weight: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateGlutenIntake(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="breadSlices" render={({ field }) => (
              <FormItem>
                <FormLabel>Bread Slices</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="pastaServing" render={({ field }) => (
              <FormItem>
                <FormLabel>Pasta Servings (1 cup each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cerealServing" render={({ field }) => (
              <FormItem>
                <FormLabel>Cereal Servings (1 cup each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="beerGlasses" render={({ field }) => (
              <FormItem>
                <FormLabel>Beer Glasses (12 oz each)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="cookies" render={({ field }) => (
              <FormItem>
                <FormLabel>Cookies</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="crackers" render={({ field }) => (
              <FormItem>
                <FormLabel>Crackers</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="otherGluten" render={({ field }) => (
              <FormItem>
                <FormLabel>Other Gluten Sources (grams)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="weight" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Gluten Intake</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Wheat className="h-8 w-8 text-primary" />
              <CardTitle>Daily Gluten Intake</CardTitle>
            </div>
            <CardDescription>Based on your food consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result.totalGluten} g</p>
              <p className="text-lg text-muted-foreground">{result.glutenPerKg} g/kg body weight</p>
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.totalGluten >= 20 ? 'High gluten intake. Consider reducing for better digestive health.' : 
                 result.totalGluten >= 10 ? 'Moderate gluten intake. Monitor for any sensitivity symptoms.' :
                 result.totalGluten >= 5 ? 'Low gluten intake. Good for those with mild sensitivity.' :
                 'Very low gluten intake. Suitable for gluten-sensitive individuals.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

<section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
    <meta itemProp="headline" content="The Ultimate Gluten Intake Tracker Guide: Monitoring PPM, Cross-Contamination, and Celiac Health" />
    <meta itemProp="author" content="Your Website/Health Team Name" />
    <meta itemProp="about" content="A comprehensive guide to effectively tracking gluten intake, understanding the 20 PPM threshold for Celiac Disease, identifying cross-contamination risks, and using a tracker for better symptom management." />

    <h1 className="text-2xl font-bold text-foreground mb-4">Mastering Your Gluten-Free Diet: A Guide to the Gluten Intake Tracker Calculator</h1>
    
    <p><em><strong>Disclaimer:</strong> This guide is for informational and educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a gastroenterologist or registered dietitian before starting a gluten-free diet.</em></p>

    <h2 className="text-xl font-bold text-foreground mt-8">Table of Contents</h2>
    <ul className="list-disc ml-6 space-y-1">
        <li><a href="#intro">Why Track Gluten? Celiac vs. Sensitivity</a></li>
        <li><a href="#ppm">The Critical Threshold: Understanding 20 Parts Per Million (PPM)</a></li>
        <li><a href="#tracker-use">How the Gluten Intake Tracker Works</a></li>
        <li><a href="#cross-contam">The Invisible Threat: Managing Cross-Contamination</a></li>
        <li><a href="#symptom">Tracking Symptoms and Long-Term Health</a></li>
        <li><a href="#tips">Pro Tips for a Successful Gluten-Free Lifestyle</a></li>
    </ul>

    <h2 id="intro" itemProp="name" className="text-xl font-bold text-foreground mt-8">Why Track Gluten? Celiac Disease vs. Non-Celiac Gluten Sensitivity</h2>
    <p itemProp="description">For individuals with a medical necessity to avoid gluten, tracking intake goes far beyond simply reading a label. A **Gluten Intake Tracker** is an indispensable tool, helping users navigate the complex world of hidden ingredients and cross-contamination. The intensity of tracking required depends heavily on your specific condition.</p>

    <h3 className="font-semibold text-foreground mt-6">Celiac Disease: The Autoimmune Imperative</h3>
    <p>Celiac Disease is an **autoimmune disorder** where the ingestion of gluten (a protein found in wheat, rye, and barley) triggers an immune response. This response damages the villi—the finger-like projections in the small intestine—leading to **nutrient malabsorption** and a host of symptoms ranging from chronic diarrhea and fatigue to anemia and osteoporosis. For those with Celiac Disease, the diet must be **100% strictly gluten-free for life**, as even minute exposure causes internal damage.</p>

    <h3 className="font-semibold text-foreground mt-6">Non-Celiac Gluten Sensitivity (NCGS)</h3>
    <p>NCGS, often called gluten intolerance, involves a symptomatic response to gluten ingestion without the autoimmune response or intestinal damage seen in Celiac Disease. Symptoms often include bloating, abdominal pain, "brain fog," and fatigue. While the diet is restrictive, the tolerance level for trace amounts of gluten may be slightly higher than for Celiac patients, making tracking essential for identifying a personal tolerance threshold.</p>

    <h2 id="ppm" className="text-xl font-bold text-foreground mt-8">The Critical Threshold: Understanding 20 Parts Per Million (PPM)</h2>
    <p>For individuals with Celiac Disease, adherence to a strict diet means avoiding any food containing gluten above a globally recognized, low level of contamination.</p>

    <h3 className="font-semibold text-foreground mt-6">The FDA Standard: Less than 20 PPM</h3>
    <p>In the United States, the Food and Drug Administration (FDA) defines a food product as **"gluten-free"** if it contains less than **20 parts per million (PPM)** of gluten. This threshold is adopted because research indicates that this trace amount is unlikely to cause adverse health effects or intestinal damage in the vast majority of Celiac patients over time. **For a tracker, 20 PPM represents the legal safety limit.**</p>

    <h3 className="font-semibold text-foreground mt-6">Why PPM Tracking is Necessary</h3>
    <p>A sophisticated Gluten Intake Tracker helps users visualize their cumulative daily exposure. Even if every meal is certified "gluten-free" (meaning **&lt;20 PPM**), repeated, low-level exposure throughout the day can lead to a total daily intake that may still trigger symptoms or cause internal inflammation. The tracker allows users to:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Monitor Cumulative Risk:** By logging meals, users can see if multiple **&lt;20 PPM** items are pushing their total daily intake toward a problematic zone.</li>
        <li>**Identify Non-Responsive Celiac Disease:** If a patient is still experiencing symptoms despite strictly following a gluten-free diet, the tracker is often the first tool used to confirm if the issue is high cumulative exposure or another underlying health problem.</li>
    </ul>

    <h2 id="tracker-use" className="text-xl font-bold text-foreground mt-8">How the Gluten Intake Tracker Calculator Works</h2>
    <p>While the actual calculation mechanism varies, most effective gluten trackers function as a sophisticated food diary combined with a risk scoring system.</p>

    <h3 className="font-semibold text-foreground mt-6">Key Data Input Fields</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Meal/Item:** Name of the food (e.g., GF Bread, Salad at Restaurant X).</li>
        <li>**Source/Certification:** Whether the food is naturally GF, labeled GF, or certified GF (certified products often have tighter quality control).</li>
        <li>**Risk Level:** A qualitative measure of the risk of contamination (e.g., Low, Medium, High). This is often user-defined, based on the preparation environment.</li>
        <li>**Estimated Gluten Load:** For Celiac patients, this field may track the exposure in PPM or in estimated milligrams (mg) of gluten ingested.</li>
        <li>**Symptom Logging:** A concurrent log of symptoms (bloating, fatigue, headache) to correlate exposure with physical reaction.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Calculator's Output Value</h3>
    <p>The core value of the calculator is providing a visual representation of risk and correlation. It allows users to:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Correlate Diet with Wellness:** Easily draw lines between high-risk meals and subsequent physical symptoms.</li>
        <li>**Establish Baseline Intake:** Determine an average daily exposure that does *not* produce symptoms, allowing for better confidence in the diet.</li>
        <li>**Identify Hidden Culprits:** Pinpoint specific restaurants, ingredients, or cooking practices that repeatedly lead to issues, even if they were labeled "safe."</li>
    </ul>

    <h2 id="cross-contam" className="text-xl font-bold text-foreground mt-8">The Invisible Threat: Managing Cross-Contact</h2>
    <p>Cross-contamination (or, more accurately, **cross-contact** in the Celiac community, as gluten is a protein and cannot be killed by heat) is the primary obstacle to strict gluten avoidance. Even microscopic particles can cause damage.</p>

    <h3 className="font-semibold text-foreground mt-6">Common Sources of Gluten Cross-Contact</h3>
    <p>Tracking must account for exposure that doesn't involve ingesting a gluten-containing food directly. These silent sources are often logged in a tracker as "High Risk" entries:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Shared Utensils and Surfaces:** Using the same cutting board, colander, or serving spoons for both gluten-free and gluten-containing foods.</li>
        <li>**Toasters and Ovens:** Shared toasters are a major source of contamination. Convection ovens, which circulate air, can also be a risk unless gluten-free items are tightly covered.</li>
        <li>**Condiment Jars:** Knives used on gluten bread and then dipped back into butter, peanut butter, or mayonnaise jars.</li>
        <li>**Deep Fryers:** Shared deep fryers where foods like non-battered fries are cooked in the same oil as battered, gluten-containing items.</li>
        <li>**Oats:** Even certified gluten-free oats can be a source of risk for some, as they are often harvested or processed on shared equipment with wheat.</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">Best Practices for Prevention (Trackable Actions)</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Separate Equipment:** Use dedicated, separate toasters, cutting boards (color-coded is helpful), and colanders for gluten-free preparation.</li>
        <li>**Designated Condiments:** Use squirt bottles or designate specific, clearly labeled jars for gluten-free use only.</li>
        <li>**Cleaning Protocol:** Wash all dishes and surfaces thoroughly with soap and water *before* preparing gluten-free food, not after.</li>
        <li>**Third-Party Certification:** Prioritize products with third-party certification logos (like the Gluten-Free Certification Organization), as their standards often exceed the minimum FDA requirement.</li>
    </ul>

    <h2 id="symptom" className="text-xl font-bold text-foreground mt-8">Tracking Symptoms and Long-Term Health</h2>
    <p>The true measure of a successful gluten-free diet is symptom remission and mucosal healing. A tracker provides the essential data to monitor this process.</p>

    <h3 className="font-semibold text-foreground mt-6">Symptoms and Non-Digestive Manifestations</h3>
    <p>While digestive issues are common, the tracker must account for **extraintestinal symptoms** that may indicate gluten exposure and internal inflammation:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Neurological:** Headaches, migraines, persistent "brain fog," or peripheral neuropathy.</li>
        <li>**Dermatological:** Development of the intensely itchy, blistery rash known as **Dermatitis Herpetiformis (DH)**.</li>
        <li>**Systemic:** Chronic fatigue, joint pain, or persistent iron-deficiency anemia (a sign of continued malabsorption).</li>
    </ul>

    <h3 className="font-semibold text-foreground mt-6">The Role of Serology Monitoring</h3>
    <p>For Celiac patients, the tracker data should always be combined with regular blood tests (serology) conducted by a physician. Continued high levels of **Tissue Transglutaminase (tTG-IgA)** antibodies, despite strict tracking, indicate persistent inflammation and require a review of the diet and potential sources of hidden gluten, which the tracker helps pinpoint.</p>

    <h2 id="tips" className="text-xl font-bold text-foreground mt-8">Pro Tips for a Successful Gluten-Free Lifestyle</h2>
    <p>Living strictly gluten-free requires constant vigilance. These professional tips can help reduce the mental burden and risk of exposure:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>**Read *Every* Label, *Every* Time:** Manufacturing practices change frequently. An item that was safe last month may now contain a 'processed in a facility' warning.</li>
        <li>**Be Skeptical of Wheat Derivatives:** Ingredients like **malt flavor** (often derived from barley) or **modified food starch** (unless the source is specified as corn or potato) can contain gluten.</li>
        <li>**Dining Out Protocol:** When eating at a restaurant, communicate clearly: "I have Celiac Disease, and I need a dish prepared with dedicated utensils and surfaces."</li>
        <li>**Focus on Naturally GF Foods:** Base the majority of your diet on naturally gluten-free foods: fruits, vegetables, unprocessed meats, rice, and legumes. This inherently minimizes the need to rely on labeled or certified products.</li>
        <li>**Consult a Dietitian:** Work with a Registered Dietitian specializing in Celiac Disease. They provide personalized guidance and ensure your diet remains nutritionally complete, mitigating the risk of deficiencies common with restrictive diets (iron, B vitamins, fiber).</li>
    </ul>

    <div className="text-sm italic text-center mt-8 pt-4 border-t border-gray-200">
        <p>This guide references established medical and nutritional guidelines from the Celiac Disease Foundation, the FDA, and leading gastroenterology research on gluten intolerance and cross-contamination risk.</p>
    </div>
</section>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/low-sodium-diet-planner-calculator">Low-Sodium Diet Planner Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/dash-diet-sodium-intake-calculator">DASH Diet Sodium Intake Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/mediterranean-diet-compliance-calculator">Mediterranean Diet Compliance Calculator</Link></p>
      </div>
    </div>
  );
}
