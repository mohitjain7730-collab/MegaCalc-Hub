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
import { Fish, Heart, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female']),
  weight: z.number().positive(),
  unit: z.enum(['metric', 'imperial']),
  pregnancyStatus: z.enum(['not_pregnant', 'pregnant', 'breastfeeding']),
  healthConditions: z.array(z.enum(['heart_disease', 'diabetes', 'arthritis', 'depression', 'adhd', 'none'])),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  fishConsumption: z.enum(['none', 'rarely', 'monthly', 'weekly', 'multiple_weekly']),
  supplementUse: z.boolean(),
  currentOmega3Intake: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const calculateOmega3Requirement = (values: FormValues) => {
  // Convert weight to kg if needed
  let weightKg = values.weight;
  if (values.unit === 'imperial') {
    weightKg = values.weight * 0.453592;
  }

  // Base requirements (mg per day)
  let baseEPA = 0;
  let baseDHA = 0;
  let totalOmega3 = 0;

  // Age-based requirements
  if (values.age < 2) {
    baseDHA = 100; // mg per day for infants
    baseEPA = 50;
  } else if (values.age < 18) {
    baseDHA = 200; // mg per day for children
    baseEPA = 100;
  } else {
    // Adult requirements
    if (values.gender === 'male') {
      baseDHA = 1000; // mg per day
      baseEPA = 500;
    } else {
      baseDHA = 800; // mg per day
      baseEPA = 400;
    }
  }

  // Pregnancy and breastfeeding adjustments
  if (values.pregnancyStatus === 'pregnant') {
    baseDHA += 200; // Additional for fetal brain development
    baseEPA += 100;
  } else if (values.pregnancyStatus === 'breastfeeding') {
    baseDHA += 300; // Additional for breast milk
    baseEPA += 150;
  }

  // Health condition adjustments
  let healthMultiplier = 1;
  if (values.healthConditions.includes('heart_disease')) {
    healthMultiplier = 1.5; // Higher requirements for cardiovascular health
  } else if (values.healthConditions.includes('diabetes')) {
    healthMultiplier = 1.3; // Moderate increase for metabolic health
  } else if (values.healthConditions.includes('arthritis')) {
    healthMultiplier = 1.4; // Anti-inflammatory benefits
  } else if (values.healthConditions.includes('depression') || values.healthConditions.includes('adhd')) {
    healthMultiplier = 1.6; // Higher for neurological benefits
  }

  // Activity level adjustments
  let activityMultiplier = 1;
  if (values.activityLevel === 'very_active') {
    activityMultiplier = 1.2;
  } else if (values.activityLevel === 'active') {
    activityMultiplier = 1.1;
  }

  // Fish consumption adjustments
  let fishMultiplier = 1;
  if (values.fishConsumption === 'none') {
    fishMultiplier = 1.5; // Higher supplement needs
  } else if (values.fishConsumption === 'rarely') {
    fishMultiplier = 1.3;
  } else if (values.fishConsumption === 'monthly') {
    fishMultiplier = 1.1;
  } else if (values.fishConsumption === 'weekly') {
    fishMultiplier = 0.8; // Lower supplement needs
  } else if (values.fishConsumption === 'multiple_weekly') {
    fishMultiplier = 0.6; // Much lower supplement needs
  }

  // Calculate final requirements
  const finalEPA = Math.round(baseEPA * healthMultiplier * activityMultiplier * fishMultiplier);
  const finalDHA = Math.round(baseDHA * healthMultiplier * activityMultiplier * fishMultiplier);
  const finalTotal = finalEPA + finalDHA;

  // Determine status
  let status = 'adequate';
  let statusColor = 'text-green-600';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let icon = CheckCircle;

  if (values.currentOmega3Intake && values.currentOmega3Intake > 0) {
    const currentIntake = values.currentOmega3Intake;
    const percentage = (currentIntake / finalTotal) * 100;
    
    if (percentage < 50) {
      status = 'deficient';
      statusColor = 'text-red-600';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      icon = AlertTriangle;
    } else if (percentage < 80) {
      status = 'insufficient';
      statusColor = 'text-orange-600';
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-200';
      icon = AlertTriangle;
    } else if (percentage > 150) {
      status = 'excessive';
      statusColor = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      icon = AlertTriangle;
    }
  }

  return {
    epa: finalEPA,
    dha: finalDHA,
    total: finalTotal,
    status,
    statusColor,
    bgColor,
    borderColor,
    icon,
    weightKg,
    healthMultiplier,
    activityMultiplier,
    fishMultiplier
  };
};

const getRecommendations = (result: ReturnType<typeof calculateOmega3Requirement>, values: FormValues) => {
  const recommendations = [];
  
  if (result.status === 'deficient') {
    recommendations.push('Significantly increase omega-3 intake through diet and supplements');
    recommendations.push('Consider high-dose omega-3 supplements (1000-2000mg daily)');
  } else if (result.status === 'insufficient') {
    recommendations.push('Moderately increase omega-3 intake');
    recommendations.push('Consider omega-3 supplements (500-1000mg daily)');
  } else if (result.status === 'excessive') {
    recommendations.push('Reduce omega-3 intake to avoid potential side effects');
    recommendations.push('Consult healthcare provider about optimal dosage');
  } else {
    recommendations.push('Maintain current omega-3 intake levels');
    recommendations.push('Continue regular fish consumption and/or supplements');
  }

  // Fish consumption recommendations
  if (values.fishConsumption === 'none' || values.fishConsumption === 'rarely') {
    recommendations.push('Increase fish consumption to 2-3 servings per week');
    recommendations.push('Focus on fatty fish: salmon, mackerel, sardines, herring');
  }

  // Supplement recommendations
  if (!values.supplementUse && result.fishMultiplier > 1.2) {
    recommendations.push('Consider omega-3 supplements to meet daily requirements');
  }

  // Health-specific recommendations
  if (values.healthConditions.includes('heart_disease')) {
    recommendations.push('Higher omega-3 intake may reduce cardiovascular risk');
  }
  if (values.healthConditions.includes('depression')) {
    recommendations.push('Omega-3 may support mental health and mood');
  }
  if (values.healthConditions.includes('arthritis')) {
    recommendations.push('Omega-3 has anti-inflammatory properties for joint health');
  }

  return recommendations;
};

const getFoodSources = (values: FormValues) => {
  const sources = [
    { name: 'Salmon (3.5 oz)', epa: 400, dha: 1200, total: 1600 },
    { name: 'Mackerel (3.5 oz)', epa: 500, dha: 1000, total: 1500 },
    { name: 'Sardines (3.5 oz)', epa: 300, dha: 800, total: 1100 },
    { name: 'Herring (3.5 oz)', epa: 200, dha: 900, total: 1100 },
    { name: 'Tuna (3.5 oz)', epa: 100, dha: 600, total: 700 },
    { name: 'Cod Liver Oil (1 tsp)', epa: 400, dha: 500, total: 900 },
    { name: 'Flaxseeds (1 tbsp)', epa: 0, dha: 0, total: 2400 }, // ALA
    { name: 'Chia Seeds (1 tbsp)', epa: 0, dha: 0, total: 1800 }, // ALA
    { name: 'Walnuts (1 oz)', epa: 0, dha: 0, total: 2500 }, // ALA
  ];

  return sources;
};

export default function Omega3DailyRequirementCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateOmega3Requirement> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      weight: undefined,
      unit: 'metric',
      pregnancyStatus: 'not_pregnant',
      healthConditions: [],
      activityLevel: undefined,
      fishConsumption: undefined,
      supplementUse: false,
      currentOmega3Intake: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calculation = calculateOmega3Requirement(values);
    setResult(calculation);
  };

  const unit = form.watch('unit');
  const gender = form.watch('gender');

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="unit" render={({ field }) => (
            <FormItem>
              <FormLabel>Unit System</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit system" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="metric">Metric (kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (lbs)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="weight" render={({ field }) => (
            <FormItem>
              <FormLabel>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {gender === 'female' && (
            <FormField control={form.control} name="pregnancyStatus" render={({ field }) => (
              <FormItem>
                <FormLabel>Pregnancy Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pregnancy status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="not_pregnant">Not Pregnant</SelectItem>
                    <SelectItem value="pregnant">Pregnant</SelectItem>
                    <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}

          <FormField control={form.control} name="activityLevel" render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="fishConsumption" render={({ field }) => (
            <FormItem>
              <FormLabel>Fish Consumption</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="How often do you eat fish?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Never</SelectItem>
                  <SelectItem value="rarely">Rarely (few times per year)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="multiple_weekly">Multiple times per week</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="currentOmega3Intake" render={({ field }) => (
            <FormItem>
              <FormLabel>Current Omega-3 Intake (mg/day) - Optional</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} placeholder="Enter current daily intake" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" className="w-full">
            <Fish className="mr-2 h-4 w-4" />
            Calculate Omega-3 Requirements
          </Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <result.icon className={`h-5 w-5 ${result.statusColor}`} />
              Omega-3 Daily Requirements
            </CardTitle>
            <CardDescription>
              Your personalized omega-3 fatty acid requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">EPA</p>
                  <p className="text-2xl font-bold">{result.epa} mg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">DHA</p>
                  <p className="text-2xl font-bold">{result.dha} mg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Omega-3</p>
                  <p className="text-2xl font-bold text-primary">{result.total} mg</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Status Assessment</h3>
              <div className={`p-4 rounded-lg border ${result.bgColor} ${result.borderColor}`}>
                <p className={`font-semibold ${result.statusColor}`}>
                  {result.status === 'adequate' && 'Adequate Intake'}
                  {result.status === 'insufficient' && 'Insufficient Intake'}
                  {result.status === 'deficient' && 'Deficient Intake'}
                  {result.status === 'excessive' && 'Excessive Intake'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.status === 'adequate' && 'Your omega-3 intake appears to be within the recommended range.'}
                  {result.status === 'insufficient' && 'Your omega-3 intake is below optimal levels for your needs.'}
                  {result.status === 'deficient' && 'Your omega-3 intake is significantly below recommended levels.'}
                  {result.status === 'excessive' && 'Your omega-3 intake may be higher than necessary.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Recommendations</h3>
              <ul className="space-y-2">
                {getRecommendations(result, form.getValues()).map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Rich Food Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFoodSources(form.getValues()).slice(0, 6).map((source, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.total} mg total omega-3
                      {source.epa > 0 && ` (EPA: ${source.epa}mg, DHA: ${source.dha}mg)`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
          <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Age & Gender</h4>
                <p>Omega-3 requirements vary by age and gender, with different needs for children, adults, and seniors.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Pregnancy Status</h4>
                <p>Pregnant and breastfeeding women need additional omega-3 for fetal brain development and breast milk production.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Health Conditions</h4>
                <p>Certain health conditions may benefit from higher omega-3 intake for therapeutic effects.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Fish Consumption</h4>
                <p>Regular fish consumption reduces the need for omega-3 supplements.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="omega3-types">
          <AccordionTrigger>Types of Omega-3 Fatty Acids</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">EPA (Eicosapentaenoic Acid)</h4>
                <p>Supports cardiovascular health, reduces inflammation, and may help with mood disorders.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">DHA (Docosahexaenoic Acid)</h4>
                <p>Essential for brain health, eye function, and fetal development during pregnancy.</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">ALA (Alpha-Linolenic Acid)</h4>
                <p>Found in plant sources, can be converted to EPA and DHA but conversion is limited.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="health-benefits">
          <AccordionTrigger>Health Benefits of Omega-3</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <p>Omega-3 fatty acids provide numerous health benefits:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Heart Health:</strong> Reduces triglycerides, blood pressure, and arrhythmia risk</li>
                <li><strong>Brain Function:</strong> Supports cognitive function and may reduce dementia risk</li>
                <li><strong>Mental Health:</strong> May help with depression and anxiety</li>
                <li><strong>Eye Health:</strong> Essential for retinal function and vision</li>
                <li><strong>Inflammation:</strong> Reduces chronic inflammation and joint pain</li>
                <li><strong>Pregnancy:</strong> Critical for fetal brain and eye development</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="further-reading">
          <AccordionTrigger>Further Reading</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p><a href="https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/fish-and-omega-3-fatty-acids" className="text-primary underline" target="_blank" rel="noopener noreferrer">American Heart Association - Fish and Omega-3 Fatty Acids</a></p>
              <p><a href="https://www.nccih.nih.gov/health/omega3-supplements-in-depth" className="text-primary underline" target="_blank" rel="noopener noreferrer">NIH - Omega-3 Supplements In-Depth</a></p>
              <p><a href="https://www.fda.gov/food/cfsan-constituent-updates/fda-announces-qualified-health-claims-omega-3-fatty-acids" className="text-primary underline" target="_blank" rel="noopener noreferrer">FDA - Omega-3 Health Claims</a></p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section itemScope itemType="https://schema.org/Article">
        <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Omega-3 Requirements</h2>
        <p itemProp="description">Omega-3 fatty acids are essential nutrients that your body cannot produce on its own. They play crucial roles in heart health, brain function, and overall well-being.</p>

        <h3 className="font-semibold text-foreground mt-6">Why Omega-3 Matters</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Heart Health:</strong> Reduces risk of heart disease and stroke</li>
          <li><strong>Brain Function:</strong> Essential for cognitive development and maintenance</li>
          <li><strong>Inflammation:</strong> Natural anti-inflammatory properties</li>
          <li><strong>Mental Health:</strong> May support mood and reduce depression risk</li>
          <li><strong>Eye Health:</strong> Critical for retinal function and vision</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Sources of Omega-3</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li><strong>Fatty Fish:</strong> Salmon, mackerel, sardines, herring, tuna</li>
          <li><strong>Fish Oil:</strong> Cod liver oil and other fish oil supplements</li>
          <li><strong>Plant Sources:</strong> Flaxseeds, chia seeds, walnuts (ALA form)</li>
          <li><strong>Algae Oil:</strong> Vegan source of EPA and DHA</li>
        </ul>

        <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
        <div className="space-y-2">
          <p><Link href="/category/health-fitness/fat-intake-calculator" className="text-primary underline">Fat Intake Calculator</Link></p>
          <p><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio Calculator</Link></p>
          <p><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs Calculator</Link></p>
          <p><Link href="/category/health-fitness/heart-health-calculator" className="text-primary underline">Heart Health Calculator</Link></p>
        </div>
      </section>
      
      <EmbedWidget calculatorSlug="omega3-daily-requirement-calculator" calculatorName="Omega-3 Daily Requirement Calculator" />
    </div>
  );
}
