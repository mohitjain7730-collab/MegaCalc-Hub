'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Baby, Pill, HeartPulse, Droplets } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  folateMcg: z.number().min(0).max(2000).optional(),
  ironMg: z.number().min(0).max(100).optional(),
  vitaminDiu: z.number().min(0).max(6000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrenatalVitaminDosageCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; recommendations: string[]; warningSigns: string[]; plan: { week: number; focus: string }[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { folateMcg: undefined, ironMg: undefined, vitaminDiu: undefined } });

const interpret = (v: FormValues) => {
  const msgs: string[] = [];
  if (v.folateMcg != null) {
    msgs.push(`You entered ${v.folateMcg} mcg for folate. You can compare this with what is printed on your prenatal label and any guidance your care team has shared with you.`);
  }
  if (v.ironMg != null) {
    msgs.push(`You entered ${v.ironMg} mg for iron. This snapshot can help you have a more specific conversation with your clinician about iron, if needed.`);
  }
  if (v.vitaminDiu != null) {
    msgs.push(`You entered ${v.vitaminDiu} IU for Vitamin D. Your care team can let you know whether this amount fits your individual situation.`);
  }
  if (msgs.length === 0) {
    msgs.push('Add one or more values from your prenatal label to create a simple snapshot you can review with your care team.');
  }
  return msgs.join(' ');
};

const recommendations = (v: FormValues) => [
  'Keep a note or photo of your prenatal label so you can quickly share details with your care team.',
  'If you try a new prenatal, pay attention to how you feel (energy, digestion, nausea) and share those observations at checkâ€‘ups.',
  'Use this snapshot as a starting point for questions; your care team can help tailor any supplement plan to your needs.',
];

const warnings = (v: FormValues) => [
  'Always follow the instructions on your supplement packaging unless your clinician specifically recommends something different.',
  'Store all supplements safely out of reach of children; accidental ingestion can be dangerous.',
  'Before making big changes to doses or combining multiple products, consider checking in with a qualified health professional.',
];

const steps = [
  'Locate your prenatal vitamin supplement label.',
  'Enter folate amount in micrograms (mcg) from the label.',
  'Enter iron amount in milligrams (mg) from the label.',
  'Enter Vitamin D amount in International Units (IU) from the label.',
  'Review the snapshot and compare with general reference ranges.',
  'Discuss the results with your healthcare provider for personalized guidance.',
];

const faqs = [
  {
    question: 'How much folate is typically recommended?',
    answer: 'Many guidelines suggest ~400â€“800 mcg dietary folate equivalents daily before and during early pregnancy; always follow clinician advice.',
  },
  {
    question: 'Do I need extra iron?',
    answer: 'Pregnancy increases iron needs to support blood volume and fetal growth. Many prenatals provide ~27 mg; confirm with labs.',
  },
  {
    question: 'What about Vitamin D?',
    answer: 'Target intakes vary widely; a common range is 600â€“2000 IU/day, individualized based on 25â€‘OH Vitamin D lab results.',
  },
  {
    question: 'Can I take calcium with iron?',
    answer: 'Calcium can reduce iron absorption; take them at different times if advised.',
  },
  {
    question: 'Are gummies OK?',
    answer: 'They can help with tolerance but may lack iron; verify your formula covers key nutrients.',
  },
  {
    question: 'Is nausea normal?',
    answer: 'Prenatals can cause GI upset. Taking with food, splitting doses, or switching formulations may help; consult your provider.',
  },
  {
    question: 'Is more always better?',
    answer: 'No. Avoid megadoses without medical guidance; some nutrients have upper limits.',
  },
  {
    question: 'Do I still need DHA and iodine?',
    answer: 'Yes, many providers recommend adequate DHA and iodine; check your diet and supplement only as advised.',
  },
];

const relatedCalculators = [
  {
    name: 'Pregnancy Weight Gain Calculator',
    slug: 'ideal-body-weight-calculator',
    description: 'Track recommended weight gain during pregnancy.',
  },
  {
    name: 'Iron Intake Calculator',
    slug: 'protein-intake-calculator',
    description: 'Calculate daily iron requirements.',
  },
  {
    name: 'Calcium Intake Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Understand bone health needs.',
  },
  {
    name: 'Vitamin D Sun Exposure Calculator',
    slug: 'electrolyte-replacement-calculator',
    description: 'Support Vitamin D status.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/prenatal-vitamin-dosage-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Prenatal Vitamin Dosage Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Prenatal Vitamin Dosage Calculator',
      description: 'Organize prenatal vitamin label information for discussion with healthcare providers.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Prenatal Vitamin Dosage Wellness Tracker',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      description: 'Organize prenatal vitamin label information for discussion with healthcare providers.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Prenatal Vitamin Dosage Calculator',
      description: 'Step-by-step guide to organize prenatal vitamin information',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

  const plan = () => ([
    { week: 1, focus: 'Begin prenatal daily; take with food and hydrate' },
    { week: 2, focus: 'Assess tolerance; adjust timing to reduce nausea' },
    { week: 3, focus: 'Discuss labs (ferritin, Vitamin D) with provider' },
    { week: 4, focus: 'Align dose forms (capsule/gummy/liquid) with tolerance' },
    { week: 5, focus: 'Reinforce calcium spacing if using ironâ€‘rich prenatal' },
    { week: 6, focus: 'Recheck symptoms; refine regimen' },
    { week: 7, focus: 'Confirm adequate DHA/iodine from diet/supplement' },
    { week: 8, focus: 'Plan followâ€‘up labs if initially low' },
  ]);

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Evaluated', interpretation: interpret(values), recommendations: recommendations(values), warningSigns: warnings(values), plan: plan() });
  };

  return (
    <div className="space-y-8">
      <Script id="prenatal-vitamin-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Prenatal Vitamin Dosage Wellness Tracker
          </CardTitle>
          <CardDescription>
            Organize a few key numbers from your prenatal label so they're easier to discuss with your care team. This tool does
            not recommend or adjust any doses.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your prenatal vitamin information</CardTitle>
          <CardDescription>Enter values from your prenatal supplement label to create a snapshot for discussion with your care team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="folateMcg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Pill className="h-4 w-4" /> Folate (mcg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ironMg" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><HeartPulse className="h-4 w-4" /> Iron (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 27" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vitaminDiu" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Vitamin D (IU)</FormLabel>
                <FormControl>
                  <Input type="number" step="50" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Evaluate dosage
            </Button>
          </form>
        </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See prenatal vitamin snapshot, interpretation, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded border p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Interpretation</p>
              <p className="text-sm">{result.interpretation}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Important reminders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.warningSigns.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Action plan</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((step) => (
                    <li key={step.week}>
                      <span className="font-semibold">Week {step.week}:</span> {step.focus}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This tool organizes prenatal vitamin label information for easy reference. It does not calculate dosages but helps
            you compare your supplement's contents with general reference ranges commonly discussed in prenatal care.
          </p>
          <p>
            <strong>General Reference Ranges:</strong> Folate: 400-800 mcg DFE (dietary folate equivalents), Iron: 27 mg
            (pregnancy), Vitamin D: 600-2000 IU (individualized based on lab results). These ranges are general guidelines;
            your healthcare provider will determine what's appropriate for your individual situation.
          </p>
          <p>
            The tool creates a snapshot of your prenatal label values to facilitate discussion with your care team, who can
            provide personalized guidance based on your health history, lab results, and nutritional needs.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>
            Comprehensive guide to prenatal vitamins, nutrient needs during pregnancy, and supplement considerations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to Prenatal Vitamins: Understanding Nutrient Needs During Pregnancy
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of prenatal nutrition, learn about essential nutrients during pregnancy, understand prenatal
            vitamin considerations, and discover comprehensive strategies to support maternal and fetal health through nutrition.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#pregnancy-nutrition" className="hover:underline">
                Understanding Pregnancy Nutrition and Nutrient Needs
              </a>
            </li>
            <li>
              <a href="#essential-nutrients" className="hover:underline">
                Essential Nutrients During Pregnancy
              </a>
            </li>
            <li>
              <a href="#prenatal-supplements" className="hover:underline">
                Prenatal Supplements and Considerations
              </a>
            </li>
            <li>
              <a href="#supplement-strategies" className="hover:underline">
                Comprehensive Strategies for Prenatal Supplementation
              </a>
            </li>
          </ul>
          <hr />

          <h2 id="pregnancy-nutrition" className="text-2xl font-bold text-foreground pt-8">
            Understanding Pregnancy Nutrition and Nutrient Needs
          </h2>
          <p>
            Pregnancy increases nutritional needs to support maternal health, fetal development, and prepare for breastfeeding.
            While a balanced diet is the foundation, prenatal supplements help ensure adequate intake of key nutrients.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Increased Nutritional Demands</h3>
          <p>
            During pregnancy, nutritional needs increase for:
          </p>
          <ul>
            <li>
              <b>Fetal growth and development:</b> Supporting rapid cell division and organ formation
            </li>
            <li>
              <b>Maternal changes:</b> Increased blood volume, uterine growth, and breast tissue development
            </li>
            <li>
              <b>Placental development:</b> Supporting the placenta which nourishes the baby
            </li>
            <li>
              <b>Energy needs:</b> Additional calories to support increased metabolic demands
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Why Supplements May Be Needed</h3>
          <p>
            Even with a balanced diet, supplements may be recommended because:
          </p>
          <ul>
            <li>Some nutrients are difficult to obtain in adequate amounts from food alone</li>
            <li>Nausea and food aversions can limit dietary intake</li>
            <li>Nutrient needs increase significantly during pregnancy</li>
            <li>Certain nutrients are critical for preventing birth defects</li>
          </ul>

          <hr />

          <h2 id="essential-nutrients" className="text-2xl font-bold text-foreground pt-8">
            Essential Nutrients During Pregnancy
          </h2>
          <p>
            Several nutrients are particularly important during pregnancy for both maternal and fetal health.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Folate (Folic Acid)</h3>
          <ul>
            <li>
              <b>Importance:</b> Critical for preventing neural tube defects (spina bifida, anencephaly)
            </li>
            <li>
              <b>Recommended intake:</b> 400-800 mcg DFE (dietary folate equivalents) daily
            </li>
            <li>
              <b>Timing:</b> Most important before conception and during early pregnancy
            </li>
            <li>
              <b>Food sources:</b> Leafy greens, legumes, fortified grains, citrus fruits
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Iron</h3>
          <ul>
            <li>
              <b>Importance:</b> Supports increased blood volume and prevents anemia
            </li>
            <li>
              <b>Recommended intake:</b> 27 mg daily during pregnancy (vs 18 mg for non-pregnant women)
            </li>
            <li>
              <b>Absorption:</b> Enhanced when taken with vitamin C; reduced when taken with calcium
            </li>
            <li>
              <b>Food sources:</b> Lean meats, legumes, fortified cereals, dark leafy greens
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Vitamin D</h3>
          <ul>
            <li>
              <b>Importance:</b> Supports bone health, immune function, and fetal skeletal development
            </li>
            <li>
              <b>Recommended intake:</b> 600-2000 IU daily (individualized based on lab results)
            </li>
            <li>
              <b>Testing:</b> 25-OH Vitamin D levels should be monitored
            </li>
            <li>
              <b>Sources:</b> Sunlight exposure, fortified foods, fatty fish, supplements
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Other Important Nutrients</h3>
          <ul>
            <li>
              <b>Calcium:</b> 1000-1300 mg daily for bone health
            </li>
            <li>
              <b>DHA (Omega-3):</b> 200-300 mg daily for brain and eye development
            </li>
            <li>
              <b>Iodine:</b> 220 mcg daily for thyroid function and brain development
            </li>
            <li>
              <b>Choline:</b> 450 mg daily for brain development
            </li>
          </ul>

          <hr />

          <h2 id="prenatal-supplements" className="text-2xl font-bold text-foreground pt-8">
            Prenatal Supplements and Considerations
          </h2>
          <p>
            Prenatal supplements come in various forms and formulations, each with different considerations.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Types of Prenatal Supplements</h3>
          <ul>
            <li>
              <b>Tablets/capsules:</b> Most common, may contain iron which can cause GI upset
            </li>
            <li>
              <b>Gummies:</b> Often easier to tolerate but may lack iron
            </li>
            <li>
              <b>Liquid:</b> May be easier to digest, good for those with swallowing difficulties
            </li>
            <li>
              <b>Split-dose:</b> Taking nutrients at different times to improve tolerance
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Common Side Effects</h3>
          <ul>
            <li>
              <b>Nausea:</b> Often related to iron; taking with food or at bedtime may help
            </li>
            <li>
              <b>Constipation:</b> Common with iron supplements; increase fiber and hydration
            </li>
            <li>
              <b>GI upset:</b> May improve with different formulations or timing
            </li>
          </ul>

          <hr />

          <h2 id="supplement-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies for Prenatal Supplementation
          </h2>
          <p>
            Optimizing prenatal supplementation involves choosing appropriate products, managing side effects, and coordinating
            with healthcare providers.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Choose Appropriate Supplements</h3>
          <ul>
            <li>
              <b>Look for key nutrients:</b> Folate, iron, vitamin D, calcium, DHA, iodine
            </li>
            <li>
              <b>Check amounts:</b> Ensure amounts align with recommendations
            </li>
            <li>
              <b>Consider tolerance:</b> Choose formulations that work for you
            </li>
            <li>
              <b>Verify quality:</b> Look for third-party testing or USP verification
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Manage Timing and Absorption</h3>
          <ul>
            <li>
              <b>Take with food:</b> Reduces nausea and improves absorption
            </li>
            <li>
              <b>Separate iron and calcium:</b> Take at different times to optimize absorption
            </li>
            <li>
              <b>Evening timing:</b> Taking iron at bedtime may reduce GI side effects
            </li>
            <li>
              <b>Consistent schedule:</b> Take at the same time daily for better adherence
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Coordinate with Healthcare Providers</h3>
          <ul>
            <li>
              <b>Share supplement details:</b> Bring labels or photos to appointments
            </li>
            <li>
              <b>Discuss lab results:</b> Adjust supplements based on blood work
            </li>
            <li>
              <b>Report side effects:</b> Your provider can suggest alternatives
            </li>
            <li>
              <b>Ask questions:</b> Clarify any concerns about dosages or formulations
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. Support with Diet</h3>
          <ul>
            <li>
              <b>Eat nutrient-dense foods:</b> Supplements complement, not replace, a healthy diet
            </li>
            <li>
              <b>Focus on variety:</b> Include fruits, vegetables, whole grains, lean proteins
            </li>
            <li>
              <b>Stay hydrated:</b> Important for digestion and overall health
            </li>
          </ul>

          <hr />

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Prenatal vitamins play an important role in supporting maternal and fetal health during pregnancy. By understanding
            essential nutrients, choosing appropriate supplements, managing side effects, and coordinating with healthcare
            providers, you can optimize your nutritional intake during this important time. Remember that prenatal supplements
            are meant to complement a healthy diet, not replace it. Always follow your healthcare provider's recommendations
            regarding supplements, as individual needs vary based on health history, lab results, and dietary intake. If you
            experience persistent side effects or have questions about your supplement regimen, discuss them with your care
            team. This tool is designed for wellness reflection and is not a substitute for professional medical evaluation or
            treatment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This tool offers a prenatal vitamin label snapshot from folate, iron, and vitamin D amounts as a gentle,
            wellness-oriented reference. It is intended for personal organization and discussion with your care team, not for
            diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include interpretation of entered values, supportive recommendations, important reminders about supplement
            safety, an action plan, and contextual information about the inputs and general reference ranges.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


